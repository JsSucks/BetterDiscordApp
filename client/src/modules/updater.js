/**
 * BetterDiscord Updater Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Notifications } from 'ui';
import { Reflection, Globals } from 'modules';

import Events from './events';
import Module from './imodule';

export default new class extends Module {

    get updates() { return this.state.updates }
    get bdUpdates() { return this.state.updates.bd }
    get error() { return null; }
    get updatesAvailable() { return this.state.updatesAvailable; }

    constructor() {
        super({
            updatesAvailable: false,
            error: null,
            updates: { bd: [] },
            updating: false
        });
    }

    bindings() {
        this.restartNotif = this.restartNotif.bind(this);
        this.reloadNotif = this.reloadNotif.bind(this);
        this.startUpdate = this.startUpdate.bind(this);
        this.setUpdateStatus = this.setUpdateStatus.bind(this);
        this.testUi = this.testUi.bind(this);
    }

    restartNotif() {
        Notifications.add('Updates Finished!', 'Restart required.', [
            {
                text: 'Restart Later',
                onClick: () => { setTimeout(this.restartNotif, 5 * 60000); return true; }
            },
            {
                text: 'Restart Now',
                onClick: () => {
                    try {
                        const { remote } = Globals.require('electron');
                        window.close();
                        Reflection.module.byProps('showToken', 'hideToken').showToken();
                        remote.app.relaunch();
                        remote.app.exit(0);
                    } catch (err) {
                        console.err(err);
                        return true;
                    }
                }
            }
        ]);
    }

    reloadNotif() {
        Notifications.add('Updates Finished!', 'Reload required.', [
            {
                text: 'Reload Later',
                onClick: () => { setTimeout(this.reloadNotif, 5 * 60000); return true; }
            },
            {
                text: 'Reload Now',
                onClick: () => {
                    document.location.reload();
                }
            }
        ]);
    }

    events(ipc) {
        ipc.on('updater-checkForUpdates', () => {
            if (this.state.updating) return; // We're already updating. Updater should be paused anyways at this point.
            Events.emit('update-check-start');
        });

        ipc.on('updater-noUpdates', () => {
            if (this.state.updatesAvailable) return; // If for some reason we get this even though we have updates already.
            this.setState({
                updatesAvailable: false,
                updates: {}
            });
        });

        ipc.on('updater-updatesAvailable', (_, updates) => {
            console.log(updates);
            if (this.state.updating) return; // If for some reason we get more updates when we're already updating
            updates.bd = updates.bd.map(update => {
                update.text = `${update.id.charAt(0).toUpperCase()}${update.id.slice(1)}`;
                update.hint = `Current: ${update.currentVersion} | Latest: ${update.version}`;
                update.status = {
                    update: !Globals.disableUpdater.includes(update.id),
                    updating: false,
                    updated: false,
                    error: null
                };

                return update;
            });
            this.setState({
                updates,
                updatesAvailable: true
            });
        });

        ipc.on('updater-updated', (_, info) => {
            const { reloadRequired, restartRequired } = info;
            if (restartRequired) {
                this.restartNotif();
                return;
            }

            if (reloadRequired) {
                this.reloadNotif();
                return;
            }
        });

        ipc.on('updater-updateFinished', (_, update) => {
            this.setUpdateStatus(update.id, 'updated', true);
        });

        ipc.on('updater-updateError', (_, update) => {
            this.setUpdateStatus(update.id, 'error', update.error);
        });
    }

    stateChanged(oldState, newState) {
        if (!newState.updatesAvailable) return Events.emit('update-check-end');
        if (!oldState.updatesAvailable && newState.updatesAvailable) {
            Events.emit('updates-available');
            Notifications.add('', 'Updates Available!', [
                {
                    text: 'Ignore',
                    onClick: () => { return true; }
                },
                {
                    text: 'Show Updates',
                    onClick: () => {
                        Events.emit('bd-open-menu', 'updater');
                        return true;
                    }
                }
            ]);
        }
    }

    setUpdateStatus(updateId, statusChild, statusValue) {
        for (const u of this.bdUpdates) {
            if (u.id === updateId) {
                u.status[statusChild] = statusValue;
                return;
            }
        }
    }

    toggleUpdate(update) {
        update.status.update = !update.status.update && !Globals.disableUpdater.includes(update.id);
    }

    async startUpdate() {
        console.log('start update');
        const updates = { bd: [] };
        for (const update of this.bdUpdates) {
            if (update.status.update) {
                update.status.updating = true;
                updates.bd.push(update);
            }
        }
        console.log(updates);
        this.send('updater-startUpdate', updates);
    }

    testUi(updates) {
        this.setState({
            updates,
            updatesAvailable: true
        });
    }

}
