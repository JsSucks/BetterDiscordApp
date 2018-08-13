/**
 * BetterDiscord Setting Secure Key Value Pair Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-formKvp">
        <div class="bd-formKvpDetails">
            <div class="bd-inputWrapper">
                <input type="text" class="bd-textInput" :value="setting.value.key" @keyup.stop="keyUpKey" @input="keyChange" />
            </div>
            <div class="bd-inputWrapper">
                <input type="password" class="bd-textInput" :value="setting.value.value" @keyup.stop="keyUpValue" @blur="valueBlur" @input="valueChange" ref="valueInput" />
            </div>
        </div>
    </div>
</template>

<script>
    import { DiscordApi } from 'modules';
    import { E2EE } from 'builtin';

    export default {
        data() {
            return {
                valueChanged: false
            }
        },
        props: ['setting'],
        methods: {
            keyChange(e) {
                this.setting.value = { key: e.target.value, value: this.setting.value.value }
            },
            valueChange(e) {
                this.valueChanged = true;
            },
            valueBlur(e) {
                if (!this.valueChanged) return;
                const value = E2EE.encrypt(null, e.target.value);
                this.setting.value = { key: this.setting.value.key, value }
                this.valueChanged = false;
            },
            keyUpKey(e) {
                if (e.key !== 'Enter') return;
                this.$refs.valueInput.focus();
            },
            keyUpValue(e) {
                if (e.key !== 'Enter') return;
                e.target.blur();
            }
        },
        beforeMount() {
            if (this.setting.value.key !== 'PlaceholderKey') return;
            this.setting.value.key = DiscordApi.currentChannel.id || 'Key';
        }
    }
</script>
