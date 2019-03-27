module.exports = (Plugin, Api, Vendor) => {

    const { $ } = Vendor;
    const { Events, Logger } = Api;

    return class extends Plugin {
        async onstart() {
            // Use version 1 of Example Plugin's bridge
            const example_plugin = await Api.bridge('example-plugin', '^1');
            console.log('Example plugin exports:', example_plugin.test1());
        }

        async onstop() {
            const example_plugin = await Api.bridge('example-plugin', '^1');
            console.log('Example plugin exports:', example_plugin.test2());
        }
    }

};
