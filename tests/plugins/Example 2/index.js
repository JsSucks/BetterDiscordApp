module.exports = (Plugin, Api, Vendor) => 

    const { $, moment } = Vendor;
    const { Events } = Api;

    const test = 'Testing';

    return class extends Plugin {
        test() {
            return test;
        }

        onStart() {
            console.log('On Start!');
            return true;
        }
    }

}