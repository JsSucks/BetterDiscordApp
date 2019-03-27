const Plugin = require('betterdiscord/plugin');
const PluginApi = require('betterdiscord/plugin-api');
const Vendor = require('betterdiscord/vendor');
const Dependencies = require('betterdiscord/dependencies');

const { Events, Logger, Utils, InternalSettings, CssUtils } = PluginApi;
const { $, _ } = Vendor;

// This will use version 1 of Example Module as that's listed in the config.json
const ExampleModule = require('betterdiscord/dependencies/example-module');

module.exports = class extends Plugin {
    get require() {
        return require;
    }

    get api() {
        return PluginApi;
    }

    async onStart() {
        await this.injectStyles();

        Events.subscribe('TEST_EVENT', this.eventTest);
        Logger.log('onStart');

        Logger.log(`Plugin setting "default-0" value: ${this.settings.get('default-0')}`);
        this.on('setting-updated', event => {
            console.log('Received plugin setting update:', event);
        });
        this.on('settings-updated', event => {
            console.log('Received plugin settings update:', event);
        });

        this.settings.on('setting-updated', event => {
            Logger.log(`Setting ${event.category.id}/${event.setting.id} changed from ${event.old_value} to ${event.value}:`, event);
        });

        // this.settings.categories.find(c => c.id === 'default').settings.find(s => s.id === 'default-5')
        this.settings.getSetting('default', 'default-0').on('setting-updated', async event => {
            Logger.log(`Some feature ${event.value ? 'enabled' : 'disabled'}`);
        });

        this.settings.on('settings-updated', async event => {
            await this.injectStyles();

            Logger.log('Settings updated:', event, 'Waiting before saving complete...');
            await Utils.wait(5000);
            Logger.log('Done');
        });

        Logger.log(`Internal setting "core/default/test-setting" value: ${InternalSettings.get('core', 'default', 'test-setting')}`);
        Events.subscribe('setting-updated', event => {
            Logger.log('Received internal setting update:', event);
        });

        const exampleModule = new ExampleModule();
        Logger.log(`2+4=${exampleModule.add(2, 4)}`);
    }

    async injectStyles() {
        const scss = await CssUtils.getConfigAsSCSS() + `.layer-kosS71 .guilds-wrapper + * {
            &::before {
                content: 'Example plugin stuff (test radio setting #{$default-5} selected)';
                display: block;
                padding: 10px 40px;
                color: #eee;
                background-color: #202225;
                text-align: center;
                font-size: 14px;
            }
        }`;
        Logger.log('Plugin SCSS:', scss);
        await CssUtils.injectSass(scss);
    }

    onStop() {
        PluginApi.unloadAll();
        Logger.log('onStop');
        console.log(this.showSettingsModal());
    }

    onUnload(reload) {
        Logger.log('Unloading plugin');
    }

    eventTest(e) {
        Logger.log(e);
    }

    /**
     * Allows plugins to support plugins using older versions of their bridge.
     * The bridge property will be used when plugins don't ask for a version.
     * This uses getters to avoid creating every available versions.
     */
    get bridges() {
        return Object.defineProperty(this, 'bridges', {value: Object.defineProperties({}, {
            '2.0.0': {get: () => this.bridge},
            '1.0.0': {get: () => this.v1bridge}
        })}).bridges;
    }

    get bridge() {
        return Object.defineProperty(this, 'bridge', {value: {
            test1: this.test1.bind(this),
            test2: this.test2.bind(this)
        }}).bridge;
    }

    async test1() { return 'It works!'; }
    async test2() { return 'This works too!'; }

    get v1bridge() {
        return Object.defineProperty(this, 'v1bridge', {value: {
            test1: this.test1Sync.bind(this),
            test2: this.test2Sync.bind(this)
        }}).v1bridge;
    }

    test1Sync() { return 'It works!'; }
    test2Sync() { return 'This works too!'; }

    settingChanged(event) {
        if (!this.enabled) return;
        Logger.log(`${event.category_id}/${event.setting_id} changed to ${event.value}`);
    }

    settingsChanged(event) {
        if (!this.enabled) return;
        Logger.log('Settings updated', event.updatedSettings);
    }

    get settingscomponent() {
        const plugin = this;
        return this._settingscomponent ? this._settingscomponent : this._settingscomponent = {
            template: `<div style="margin-bottom: 15px; background-color: rgba(0, 0, 0, 0.2); border: 1px dashed rgba(255, 255, 255, 0.2); padding: 10px; color: #f6f6f7; font-weight: 500; font-size: 15px;">
                Test custom setting {{ setting.id }}. This is from Plugin.settingscomponent.<br />
                Plugin ID: {{ plugin.id }}
            </div>`,
            props: ['setting', 'change'],
            data() { return { plugin }; }
        };
    }

    getSettingsComponent(setting, change) {
        return this._settingscomponent2 ? this._settingscomponent2 : this.settingscomponent2 = {
            template: `<div style="margin-bottom: 15px; background-color: rgba(0, 0, 0, 0.2); border: 1px dashed rgba(255, 255, 255, 0.2); padding: 10px; color: #f6f6f7; font-weight: 500; font-size: 15px;">
                Test custom setting {{ setting.id }}. This is from Plugin.getSettingsComponent().
            </div>`,
            props: ['setting', 'change']
        };
    }

    getSettingsComponentHTMLElement(setting, change) {
        const el = document.createElement('div');
        el.setAttribute('style', 'margin-bottom: 15px; background-color: rgba(0, 0, 0, 0.2); border: 1px dashed rgba(255, 255, 255, 0.2); padding: 10px; color: #f6f6f7; font-weight: 500; font-size: 15px;');
        el.textContent = `Test custom setting ${setting.id}. This is from Plugin.getSettingsComponentHTMLElement(). Current value: ${setting.value}.`;

        const button1 = document.createElement('button');
        button1.setAttribute('class', 'bd-button bd-buttonPrimary');
        button1.setAttribute('style', 'display: inline-block; margin-left: 10px;');
        button1.addEventListener('click', () => change(1));
        button1.textContent = 'Set value to 1';
        el.appendChild(button1);

        const button2 = document.createElement('button');
        button2.setAttribute('class', 'bd-button bd-buttonPrimary');
        button2.setAttribute('style', 'display: inline-block; margin-left: 10px;');
        button2.addEventListener('click', () => change(2));
        button2.textContent = 'Set value to 2';
        el.appendChild(button2);

        return el;
    }
}
