const { ipcRenderer } = window.require('electron');

export default class {

    static on(channel, cb) {
        ipcRenderer.on(channel, (event, args) => cb(event, args));
    }

    static async send(channel, message) {
        const __eid = Date.now().toString();
        ipcRenderer.send(
            channel.startsWith('bd-') ? channel: `bd-${channel}`,
            message === undefined ? { __eid } : Object.assign(message, { __eid })
        );

        return new Promise((resolve, reject) => {
            ipcRenderer.once(__eid, (event, arg) => {
                if (arg.err) return reject(arg);
                resolve(arg);
            });
        });
    }

    static sendToDiscord(channel, message) {
        this.send('bd-sendToDiscord', { channel, message });
    }

}
