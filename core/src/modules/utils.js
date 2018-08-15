/**
 * BetterDiscord Utils Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

// TODO Use common

import fs from 'fs';

import Module from './modulebase';
import BDIpc from './bdipc';

export class Utils {
    static async tryParseJson(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (err) {
            throw ({
                message: 'Failed to parse json',
                err
            });
        }
    }
}

export class FileUtils {
    static async fileExists(path) {
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if(err) return reject({
                    message: `No such file or directory: ${err.path}`,
                    err
                });

                if(!stats.isFile()) return reject({
                    message: `Not a file: ${path}`,
                    stats
                });

                resolve();
            });
        });
    }

    static async directoryExists(path) {
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if(err) return reject({
                    message: `Directory does not exist: ${path}`,
                    err
                });

                if(!stats.isDirectory()) return reject({
                    message: `Not a directory: ${path}`,
                    stats
                });

                resolve();
            });
        });
    }

    static async readFile(path) {
        try {
            await this.fileExists(path);
        } catch (err) {
            throw err;
        }

        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf-8', (err, data) => {
                if(err) return reject({
                    message: `Could not read file: ${path}`,
                    err
                });

                resolve(data);
            });
        });
    }

    static async readJsonFromFile(path) {
        let readFile;
        try {
            readFile = await this.readFile(path);
        } catch(err) {
            throw err;
        }

        try {
            return await Utils.tryParseJson(readFile);
        } catch (err) {
            throw Object.assign(err, { path });
        }
    }

    static async listDirectory(path) {
        try {
            await this.directoryExists(path);
            return new Promise((resolve, reject) => {
                fs.readdir(path, (err, files) => {
                    if (err) reject(err);
                    else resolve(files);
                });
            });
        } catch (err) {
            throw err;
        }
    }

    static filterFiles(files, filter, map) {
        if (!map) return files.filter(filter);
        return files.filter(filter).map(map);
    }

    static resolveLatest(files, filter, map, prefix, suffix) {
        let latest = null;
        for (const file of this.filterFiles(files, filter, map)) {
            const [major, minor, revision] = file.split('.');
            if (!major || !minor || !revision) continue;
            if (!latest) {
                latest = file;
                continue;
            }

            latest = file > latest ? file : latest;
        }
        return (prefix && suffix) ? `${prefix}${latest}${suffix}` : latest;
    }

    static async createDirectory(path) {
        return new Promise((resolve, reject) => {
            fs.mkdir(path, err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    static async ensureDirectory(path) {
        try {
            await this.directoryExists(path);
            return true;
        } catch (err) {
            try {
                await this.createDirectory(path);
                return true;
            } catch (err) {
                throw err;
            }
        }
    }
}

export class WindowUtils extends Module {
    bindings() {
        this.openDevTools = this.openDevTools.bind(this);
        this.executeJavascript = this.executeJavascript.bind(this);
        this.injectScript = this.injectScript.bind(this);
    }

    get window() {
        return this.state.window;
    }

    get webContents() {
        return this.window.webContents;
    }

    openDevTools() {
        this.webContents.openDevTools();
    }

    executeJavascript(script) {
        return this.webContents.executeJavaScript(script);
    }

    injectScript(fpath, variable) {
        return WindowUtils.injectScript(this.window, fpath, variable);
    }

    static async injectScript(window, fpath, variable) {
        window = window.webContents || window;
        if (!window) return;
        // console.log(`Injecting: ${fpath} to`, window);

        const escaped_path = fpath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const escaped_variable = variable ? variable.replace(/\\/g, '\\\\').replace(/"/g, '\\"') : null;

        const nodeIntegration = await window.executeJavaScript(`typeof require !== 'undefined'`);

        if (!nodeIntegration) return window.send('--bd-inject-script', {script: fpath, variable});

        if (variable) return window.executeJavaScript(`window["${escaped_variable}"] = require("${escaped_path}");`);

        return window.executeJavaScript(`require("${escaped_path}");`);
    }

    on(event, callback) {
        this.webContents.on(event, callback);
    }

    send(channel, message) {
        return BDIpc.send(this.window, channel, message);
    }
}
