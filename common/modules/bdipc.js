/**
 * BetterDiscord IPC Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

const { ipcRenderer, ipcMain } = require('electron');

export class ClientIPC {
    static on(channel, cb) {
        ipcRenderer.on(channel, (event, message) => cb(event, message));
    }

    static async send(channel, message) {
        channel = channel.startsWith('bd-') ? channel : `bd-${channel}`;
        const __eid = Date.now().toString();
        ipcRenderer.send(channel, Object.assign(message ? message : {}, { __eid }));
        return new Promise((resolve, reject) => {
            ipcRenderer.once(__eid, (event, arg) => resolve(arg));
        });
    }
}

class BDIpcEvent {

    constructor(event, args) {
        this.args = args;
        this.ipcEvent = event;
    }

    bindings() {
        this.send = this.send.bind(this);
        this.reply = this.reply.bind(this);
    }

    send(message) {
        this.ipcEvent.sender.send(this.args.__eid, message);
    }

    reply(message) {
        this.send(message);
    }
}

export class CoreIPC {
    static on(channel, cb) {
        ipcMain.on(channel, (event, args) => cb(new BDIpcEvent(event, args)));
    }
}
