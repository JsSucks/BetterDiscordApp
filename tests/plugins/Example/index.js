module.exports = (Plugin, Api, Vendor) => {

    const { $, moment, _ } = Vendor;
    const { Events, Logger } = Api;

    return class extends Plugin {
        onStart() {
            Events.subscribe('TEST_EVENT', this.eventTest);
            Logger.log('onStart');
            Logger.log(`Setting "default-0" value: ${this.getSetting('default-0')}`);

            const exampleModule = new (Api.import('Example Module'));
            Logger.log(`2+4=${exampleModule.add(2, 4)}`);
            return true;
        }

        onStop() {
            Events.unsubscribeAll();
            Logger.log('onStop');
            console.log(this.showSettingsModal());
            return true;
        }

        eventTest(e) {
            Logger.log(e);
        }

        get bridge() {
            return {
                test1: this.test1.bind(this),
                test2: this.test2.bind(this)
            };
        }

        test1() { return 'It works!'; }
        test2() { return 'This works too!'; }

        settingChanged(category, setting_id, value) {
            if (!this.enabled) return;
            Logger.log(`${category}/${setting_id} changed to ${value}`);
        }

        settingsChanged(settings) {
            if (!this.enabled) return;
            Logger.log([ 'Settings updated', settings ]);
        }
    }

}
