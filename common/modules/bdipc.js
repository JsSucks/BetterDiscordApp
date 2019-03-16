/**
 * BetterDiscord IPC Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { ipcRenderer } from 'electron';

const callbacks = new WeakMap();

const ClientIPC = new class ClientIPC {

    constructor() {
        this.on('ping', () => 'pong', true);
    }

    /**
     * Adds an IPC event listener.
     * @param {String} channel The channel to listen on
     * @param {Function} callback A function that will be called when a message is received
     * @param {Boolean} reply Whether to automatically reply to the message with the callback's return value
     * @return {Promise}
     */
    on(channel, callback, reply) {
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
        ipcRenderer.on(channel, boundCallback);
    }

    off(channel, callback) {
        ipcRenderer.removeListener(channel, callbacks.get(callback));
    }

    /**
     * Sends a message to the main process and returns a promise that is resolved when the main process replies.
     * @param {String} channel The channel to send a message to
     * @param {Any} message Data to send to the main process
     * @param {Boolean} error Whether to mark the message as an error
     * @return {Promise}
     */
    async send(channel, message, error) {
        channel = channel.startsWith('bd-') ? channel : `bd-${channel}`;

        const eid = `bd-${Date.now().toString()}`;
        ipcRenderer.send(channel, { eid, message, error });

        return new Promise((resolve, reject) => {
            ipcRenderer.once(eid, (event, arg) => {
                if (arg.error) reject(arg.message);
                else resolve(arg.message);
            });
        });
    }

    /**
     * Sends a message to the Discord window and returns a promise that is resolved when it replies.
     * @param {String} channel The channel to send a message to
     * @param {Any} message Data to send to the renderer process
     * @return {Promise}
     */
    sendToDiscord(channel, message) {
        return this.send('bd-sendToDiscord', {
            channel, message
        });
    }

    /**
     * Sends a message to the CSS editor window and returns a promise that is resolved when it replies.
     * @param {String} channel The channel to send a message to
     * @param {Any} message Data to send to the CSS editor window
     * @return {Promise}
     */
    sendToCssEditor(channel, message) {
        return this.send('bd-sendToCssEditor', {
            channel, message
        });
    }

    ping() {
        return this.send('ping');
    }

    getConfig() {
        return this.send('getConfig');
    }

    showOpenDialog(options) {
        return this.send('native-open', options);
    }

    getNativeModuleErrors() {
        return this.send('getNativeModuleErrors');
    }

    compileSass(options) {
        return this.send('compileSass', options);
    }

    dba(command) {
        return this.send('dba', command);
    }

    getPassword(service, account) {
        return this.send('keytar-get', {service, account});
    }

    setPassword(service, account, password) {
        return this.send('keytar-set', {service, account, password});
    }

    deletePassword(service, account) {
        return this.send('keytar-delete', {service, account});
    }

    findCredentials(service) {
        return this.send('keytar-find-credentials', {service});
    }

}

export default ClientIPC;

/**
 * An IPC event.
 */
class BDIpcEvent {

    constructor(event, args) {
        this.args = args;
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
    get send() { return this.reply }
    reply(message, error) {
        if (this.replied)
            throw {message: 'This message has already been replied to.'};

        this.replied = true;
        return ClientIPC.send(this.eid, message, error);
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
