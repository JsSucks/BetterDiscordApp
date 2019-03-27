
const Plugin = require('betterdiscord/plugin');
const { Logger, ReactComponents, Patcher, monkeyPatch } = require('betterdiscord/plugin-api');

module.exports = class extends Plugin {
    onStart() {
        this.patchMessage();
    }

    async patchMessage() {
        const Message = await ReactComponents.getComponent('Message');
        monkeyPatch(Message.component.prototype).after('render', e => {
            Logger.log('MESSAGE RENDER!', e);
        });
    }

    onStop() {
        // The automatic unpatcher is not there yet
        Patcher.unpatchAll();
    }
}
