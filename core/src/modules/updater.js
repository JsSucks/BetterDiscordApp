/**
 * BetterDiscord Updater Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Module from './modulebase';
import { FileUtils } from './utils';
import semver from 'semver';
import Axi from './axi';
import zlib from 'zlib';
import tarfs from 'tar-fs';
import path from 'path';

const TEST_UPDATE = [
    {
        'id': 'core',
        'version': '2.0.0-beta.5'
    },
    {
        'id': 'client',
        'version': '2.0.0-beta.5'
    },
    {
        'id': 'editor',
        'version': '0.4.1'
    }
];

class ReleaseInfo {

    constructor(versions) {
        this.versions = versions;
    }

    get core() {
        const f = this.files.find(f => f.id === 'core');
        f.upToDate = semver.satisfies(this.versions.core, `>=${f.version}`, { includePrerelease: true });
        f.currentVersion = this.versions.core;
        return f;
    }

    get client() {
        const f = this.files.find(f => f.id === 'client');
        f.upToDate = semver.satisfies(this.versions.client, `>=${f.version}`, { includePrerelease: true });
        f.currentVersion = this.versions.client;
        return f;
    }

    get editor() {
        const f = this.files.find(f => f.id === 'editor');
        f.upToDate = semver.satisfies(this.versions.editor, `>=${f.version}`, { includePrerelease: true });
        f.currentVersion = this.versions.editor;
        return f;
    }

    test() {
        this.files = TEST_UPDATE;
    }

}

export default class Updater extends Module {

    constructor(bd) {
        super();
        this.bd = bd;
    }

    bindings() {
        this.checkForUpdates = this.checkForUpdates.bind(this);
        this.checkForBdUpdates = this.checkForBdUpdates.bind(this);
        this.updateAll = this.updateAll.bind(this);
        this.updateFinished = this.updateFinished.bind(this);
        this.start = this.start.bind(this);
    }

    events(ipc) {
        ipc.on('updater-startUpdate', (_, updates) => {
            clearInterval(this.updaterThread);
            this.updateAll(updates);
        });
        ipc.on('debug-updater-forceUpdate', () => {
            this.checkForUpdates(true);
        });
    }

    async updateBd(update) {
        try {
            console.log('[BetterDiscord:Updater] Updating', update.id);
            await this.downloadTarGz(`https://github.com/JsSucks/BetterDiscordApp${update.remote}`, this.bd.config.getPath('tmp'));
            await FileUtils.rn(path.join(this.bd.config.getPath('tmp'), update.id), this.bd.config.getPath(update.id));
            this.updateFinished(update);
            // Cleanup
            await FileUtils.rm(`${this.bd.config.getPath(update.id)}_old`);
        } catch (err) {
            console.log('[BetterDiscord:Updater] Failed to update', update.id);
            console.log(err);
            update.error = err;
            this.bd.sendToDiscord('updater-updateError', update);
        }
    }

    async updateAll(updates) {
        const bd = updates.bd || [];
        const plugins = updates.plugins || [];
        const themes = updates.themes || [];
        const modules = updates.modules || [];

        this.restartRequired = this.reloadRequired = false;
        this.finishedUpdates = 0;
        this.totalUpdates = bd.length + plugins.length + themes.length + modules.length;

        const renamed = [];
        // TODO cleaner
        if (bd.length) {
            for (const update of bd) {
                try {
                    await FileUtils.rm(`${this.bd.config.getPath(update.id)}_old`);
                    // Try to rename dirs first
                    await FileUtils.rn(this.bd.config.getPath(update.id), `${this.bd.config.getPath(update.id)}_old`);
                    renamed.push({ 'old': this.bd.config.getPath(update.id), 'new': `${this.bd.config.getPath(update.id)}_old`});
                } catch (err) {
                    if (renamed.length) {
                        // Restore dirs
                        for (const r of renamed) {
                            await FileUtils.rn(r.new, r.old);
                        }
                    }

                    throw err;
                }
            }

            for (const update of bd) {
                this.updateBd(update);
            }
        }

    }

    updateFinished(update) {
        if (update.id === 'core') this.restartRequired = true;
        if (update.id === 'client') this.reloadRequired = true;

        console.log('[BetterDiscord:Updater] Finished updating', update.id);
        this.bd.sendToDiscord('updater-updateFinished', update);

        this.finishedUpdates++;
        if (this.finishedUpdates >= this.totalUpdates) {
            this.bd.sendToDiscord('updater-updated', { restartRequired: this.restartRequired, reloadRequired: this.reloadRequired });
        }
    }

    start(interval = 30) {
        this.updaterThread = setInterval(this.checkForUpdates, interval * 60 * 1000);
    }

    validate(releaseInfo) {
        return releaseInfo &&
            typeof releaseInfo === 'object' &&
            releaseInfo.files &&
            Array.isArray(releaseInfo.files) &&
            releaseInfo.files.length >= 4;
    }

    async latestRelease() {
        try {
            const release = await Axi.github.api.get('repos/JsSucks/BetterDiscordApp/releases/latest'); // TODO replace with config
            const releaseInfoAsset = release.data.assets.find(asset => asset.name === 'releaseinfo.json');
            const releaseInfo = await Axi.get(releaseInfoAsset['browser_download_url']);

            if (this.validate(releaseInfo.data)) return releaseInfo.data;
            return this.latestReleaseFallback();
        } catch (err) {
            console.log(err);
            return this.latestReleaseFallback();
        }
    }

    async latestReleaseFallback() {
        console.log('fallback');
    }

    async checkForBdUpdates(forced = false) {
        try {
            const { coreVersion, clientVersion, editorVersion } = this.bd.config;
            const releaseInfo = new ReleaseInfo({ core: coreVersion, client: clientVersion, editor: editorVersion });

            const latestRelease = await this.latestRelease();

            if (forced) {
                latestRelease.files = latestRelease.files.map(file => {
                    file.version = '10.0.0';
                    return file;
                });
            }

            releaseInfo.files = latestRelease.files;

            const updates = [];

            const { core, client, editor } = releaseInfo;
            if (!core.upToDate) updates.push(core);
            if (!client.upToDate) updates.push(client);
            if (!editor.upToDate) updates.push(editor);

            return updates;

        } catch (err) {
            console.log('[BetterDiscord:Updater]', err);
            return [];
        }
    }

    async checkForUpdates(forced = false) {
        console.log('[BetterDiscord:Updater] Checking for updates');
        this.bd.sendToDiscord('updater-checkForUpdates', '');

        try {
            const bd = await this.checkForBdUpdates(forced);
            const updates = { bd, haveUpdates: false };

            if (bd.length) updates.haveUpdates = true;

            if (!updates.haveUpdates) {
                this.bd.sendToDiscord('updater-noUpdates', '');
                return true;
            }

            this.bd.sendToDiscord('updater-updatesAvailable', updates);

            return true;

        } catch (err) {
            console.log('[BetterDiscord:Updater]', err);
            this.bd.sendToDiscord('updater-error', err);
            return 'err';
        }
    }

    async downloadTarGz(url, dest, responseType = 'stream', headers = null) {
        try {
            const stream = await Axi.axios({
                url,
                type: 'GET',
                responseType,
                headers: headers ||
                {
                    'Content-Type': 'application/octet-stream',
                    'Accept': 'application/octet-stream'
                }
            });

            return new Promise((resolve, reject) => {
                stream.data.pipe(zlib.createGunzip()).pipe(tarfs.extract(dest)).on('finish', resolve).on('error', reject);
            });
        } catch (err) {
            throw err;
        }
    }

    debug(releaseInfo) {
        const { core, client, editor } = releaseInfo;
        if (!core.upToDate) {
            console.log(`[BetterDiscord:Updater] Core update available: ${core.currentVersion} > ${core.version}`);
        } else {
            console.log(`[BetterDiscord:Updater] Core up to date: ${core.currentVersion} = ${core.version}`);
        }

        if (!client.upToDate) {
            console.log(`[BetterDiscord:Updater] Client update available: ${client.currentVersion} > ${client.version}`);
        } else {
            console.log(`[BetterDiscord:Updater] Client up to date: ${client.currentVersion} = ${client.version}`);
        }

        if (!editor.upToDate) {
            console.log(`[BetterDiscord:Updater] Editor update available: ${editor.currentVersion} > ${editor.version}`);
        } else {
            console.log(`[BetterDiscord:Updater] Editor up to date: ${editor.currentVersion} = ${editor.version}`);
        }
    }

}
