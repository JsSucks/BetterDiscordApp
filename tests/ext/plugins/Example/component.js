exports.default = {
    template: `<div style="margin-bottom: 15px; background-color: rgba(0, 0, 0, 0.2); border: 1px dashed rgba(255, 255, 255, 0.2); padding: 10px; color: #f6f6f7; font-weight: 500; font-size: 15px;">
        Test custom setting {{ setting.id }}. This is from component.js in the plugin/theme's directory. (It can use functions.)
    </div>`,
    props: ['setting', 'change']
};

const CustomSetting = require('betterdiscord/plugin-api/settings/custom');

const component = {
    template: `<div style="margin-bottom: 15px; background-color: rgba(0, 0, 0, 0.2); border: 1px dashed rgba(255, 255, 255, 0.2); padding: 10px; color: #f6f6f7; font-weight: 500; font-size: 15px;">
        Test custom setting {{ setting.id }}. Also in component.js. It extends the CustomSetting class.

        <button class="bd-button bd-buttonPrimary" style="display: inline-block; margin-left: 10px;" @click="change(1)">Set value to 1</button>
        <button class="bd-button bd-buttonPrimary" style="display: inline-block; margin-left: 10px;" @click="change(2)">Set value to 2</button>
    </div>`,
    props: ['setting', 'change']
};

exports.CustomSetting = class extends CustomSetting {
    get component() {
        return component;
    }

    get debug() {
        return true;
    }
}
