/**
 * BetterDiscord Setting Bool Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-settingSwitch">
        <div class="bd-title">
            <h3>{{setting.text}}</h3>
            <SettingSwitch v-model="setting.value" />
        </div>
        <div class="bd-hint">{{setting.hint}}</div>
    </div>
</template>

<script>
    import SettingSwitch from '../../common/SettingSwitch.vue';

    export default {
        props: ['setting'],
        components: {
            SettingSwitch
        }
    }
</script>
