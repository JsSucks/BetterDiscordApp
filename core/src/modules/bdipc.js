/**
 * BetterDiscord IPC Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { ipcMain } from 'electron';
import Module from './modulebase';

const callbacks = new WeakMap();

/**
 * The IPC module used in the main process.
 */
export default class BDIpc {

    /**
     * Adds an IPC event listener.
     * @param {String} channel The channel to listen on
     * @param {Function} callback A function that will be called when a message is received
     * @param {Boolean} reply Whether to automatically reply to the message with the callback's return value
     * @return {Promise}
     */
    static on(channel, callback, reply) {
        channel = channel.startsWith('bd-') ? channel : `bd-${channel}`;

        const boundCallback = async (event, args) => {
            const ipcevent = new BDIpcEvent(event, args);
            try {
                const r = callback(ipcevent, ipcevent.message);
                if (reply) ipcevent.reply(await r);
            } catch (err) {
                console.error('Error in IPC callback:', err);
                if (reply) ipcevent.reject(err);
            }
        };

        callbacks.set(callback, boundCallback);
        ipcMain.on(channel, boundCallback);
    }

    static off(channel, callback) {
        ipcMain.removeListener(channel, callbacks.get(callback));
    }

    /**
     * Sends a message to the main process and returns a promise that is resolved when the main process replies.
     * @param {BrowserWindow} window The window to send a message to
     * @param {String} channel The channel to send a message to
     * @param {Any} message Data to send to the main process
     * @param {Boolean} error Whether to mark the message as an error
     * @return {Promise}
     */
    static send(window, channel, message, error) {
        channel = channel.startsWith('bd-') ? channel : `bd-${channel}`;

        const eid = `bd-${  Date.now().toString()}`;
        window.send(channel, { eid, message, error });

        return new Promise((resolve, reject) => {
            ipcMain.once(eid, (event, arg) => {
                if (arg.error) reject(arg.message);
                else resolve(arg.message);
            });
        });
    }

    static ping(window) {
        return this.send(window, 'ping');
    }

}

export class BDIpcEvent extends Module {

    constructor(event, args) {
        super(args);
        this.ipcEvent = event;
        this.replied = false;
    }

    bindings() {
        this.reply = this.reply.bind(this);
    }

    /**
     * Sends a message back to the message's sender.
     * @param {Any} message Data to send to this message's sender
     */
    reply(message, error) {
        if (this.replied)
            throw {message: 'This message has already been replied to.'};

        this.replied = true;
        return BDIpc.send(this.ipcEvent.sender, this.eid, message, error);
    }

    reject(err) {
        return this.reply(err, true);
    }

    get message() {
        return this.args.message;
    }

    get error() {
        return this.args.error;
    }

    get eid() {
        return this.args.eid;
    }

}
