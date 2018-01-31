/**
 * BetterDiscord Core Settings Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <SettingsWrapper headertext="Core Settings">
        <div class="bd-form-item" v-for="setting in settings" :key="setting.id">
            <SettingSwitch key="setting.id" :setting="setting" :onClick="settingOnClick" :disabled="setting.disabled" />
            <div class="bd-form-divider" />
        </div>
    </SettingsWrapper>
</template>

<script>
    // Imports
    import { SettingsWrapper } from './';
    import { SettingSwitch } from '../common';

    /*Methods*/
    function settingOnClick(setting) {
        if (setting.enabled) return this.disableSetting('core', setting.id);
        this.enableSetting('core', setting.id);
    }

    const methods = { settingOnClick };

    export default {
        props: ['settings', 'enableSetting', 'disableSetting'],
        components: {
            SettingsWrapper, SettingSwitch
        },
        methods: {
            settingOnClick(setting) {
                if (setting.enabled) return this.disableSetting('core', setting.id);
                this.enableSetting('core', setting.id);
            }
        }
    }
</script>
