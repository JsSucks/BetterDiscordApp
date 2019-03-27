const Plugin = require('betterdiscord/plugin');
const { Logger, Settings, Modals, BdMenuItems, CommonComponents, DiscordContextMenu, Autocomplete, Notifications, Api } = require('betterdiscord/plugin-api');

exports.main = class extends Plugin {
    async onstart() {
        this.keybindEvent = this.keybindEvent.bind(this);

        /**
         * Array setting events.
         */

        const arraySetting = this.settings.getSetting('default', 'array-1');
        Logger.log('Array setting', arraySetting);
        arraySetting.on('item-added', event => Logger.log('Item', event.item, 'was added to the array setting'));
        arraySetting.on('item-updated', event => Logger.log('Item', event.item, 'of the array setting was updated', event));
        arraySetting.on('item-removed', event => Logger.log('Item', event.item, 'removed from the array setting'));

        /**
         * Keybind setting events.
         */

        const keybindSetting = this.settings.getSetting('default', 'keybind-1');
        Logger.log('Keybind setting', keybindSetting);
        keybindSetting.on('keybind-activated', this.keybindEvent);

        /**
         * Settings.
         */

        const set = Settings.createSet({
            text: this.name
        });
        const category = await set.addCategory({ id: 'default' });

        const setting = await category.addSetting({
            id: 'test',
            type: 'text',
            text: 'Enter some text',
            multiline: true // Works better now
        });

        setting.on('setting-updated', event => Logger.log('Setting was changed to', event.value));

        const scheme = await set.addScheme({
            id: 'scheme-1',
            name: 'Test scheme',
            icon_path: 'scheme-icon.jpg',
            settings: [{ category: 'default', settings: [{ id: 'test', value: 'Some\npresent\n\nmultiline\n\ntext' }] }]
        });
        scheme.setContentPath(__dirname);

        set.on('settings-updated', async updatedSettings => {
            Logger.log('Updated settings', updatedSettings);
            await new Promise(resolve => setTimeout(resolve, 500));
            set.setSaved();
        });

        const setting2 = await category.addSetting({
            id: 'setting-2',
            type: 'text',
            text: 'Enter some text',
            fullwidth: true
        });

        setting2.on('setting-updated', event => Logger.log('Setting 2 was changed to', event.value));

        /**
         * Menu items.
         */

        this.menuItem = BdMenuItems.addSettingsSet('Plugins', set, 'Plugin 4');

        this.menuItem2 = BdMenuItems.addVueComponent('Plugins', 'Also Plugin 4', {
            template: `<settings-wrapper :headertext="plugin.name + ' custom menu panel'">
                <p style="margin-top: 0; color: #f6f6f7;">Test</p>
            </settings-wrapper>`,
            components: {
                SettingsWrapper: CommonComponents.SettingsWrapper
            },
            data() { return {
                Api, plugin: Api.plugin
            }; }
        });

        /**
         * Discord context menus.
         */

        this.contextMenu = DiscordContextMenu.add([
            {
                text: 'Test',
                onClick: () => Modals.basic('Test', 'Hello from Plugin 4')
            }
        ]);

        /**
         * Autocomplete.
         * This calls `acsearch` on the controller (the plugin object). You can add multiple autocomplete sets by passing another controller.
         */

        Autocomplete.add('|');

        /**
         * Notifications.
         */

        Notifications.add('Notification from Plugin 4', [
            {text: 'Dismiss', onClick: () => true}
        ]);
    }

    onstop() {
        const keybindSetting = this.settings.getSetting('default', 'keybind-1');
        keybindSetting.off('keybind-activated', this.keybindEvent);

        BdMenuItems.removeAll();
        DiscordContextMenu.removeAll();
        Autocomplete.removeAll();
    }

    keybindEvent(event) {
        Logger.log('Keybind pressed', event);
        Modals.basic('Example Plugin 4', 'Test keybind activated.');
    }

    acsearch(sterm) {
        // sterm is the text after the prefix
        Logger.log('Searching for', sterm);

        return {
            title: ['Plugin 4 autocomplete'],
            items: [
                {key: 'Item 1', value: {replaceWith: 'Something to insert when selected'}},
                {key: 'Item 2', value: {replaceWith: 'Something to insert when selected'}},
                {key: 'Item 3', value: {replaceWith: 'Something to insert when selected'}},
                {key: 'Item 4', value: {replaceWith: 'Something to insert when selected'}}
            ]

            // `title` can also be an array - the second item will be white
            // You can also add `type: 'imagetext'` here and add an `src` property to each item's value to show an image
        };
    }

    get api() {
        return Api;
    }
}
