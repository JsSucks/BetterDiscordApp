module.exports = (Plugin, Api, Vendor) => {

    const { $, moment } = Vendor;
    const { Events } = Api;

    const test = 'Testing';

    return class extends Plugin {
        test() {
            return test;
        }

        onStart() {
            console.log('Example Plugin 1 onStart');
            return true;
        }

        onStop() {
            console.log('Example Plugin 1 onStop');
            return true;
        }
    }

}