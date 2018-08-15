/**
 * BetterDiscord Setting Array Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-formSettingsarray" :class="{'bd-formSettingsarrayInline': setting.inline}">
        <div class="bd-title">
            <h3>{{ setting.text }}</h3>
            <button class="bd-button bd-buttonPrimary" :class="{'bd-disabled': setting.disabled || setting.max && setting.items.length >= setting.max}" @click="() => addItem(!setting.inline)">Add</button>
        </div>
        <div class="bd-hint">{{ setting.hint }}</div>
        <div class="bd-settingsarrayItems">
            <div class="bd-settingsarrayItem" v-for="(item, index) in setting.items">
                <div class="bd-settingsarrayItemMarker">{{ index + 1 }}</div>

                <SettingsPanel class="bd-settingsarrayItemContents" v-if="setting.inline" :settings="item" />
                <div class="bd-settingsarrayItemContents" v-else>
                    <div class="bd-settingsarrayItemHint">
                        <span v-if="getItemSettings(item)[0]">{{ getItemSettings(item)[0].text }}: {{ getItemSettings(item)[0].value }}</span><span v-if="getItemSettings(item)[1]">, {{ getItemSettings(item)[1].text }}: {{ getItemSettings(item)[1].value }}</span><span v-if="getItemSettings(item)[2]">, ...</span>
                    </div>
                </div>

                <div class="bd-settingsarrayItemControls">
                    <span class="bd-settingsarrayOpen" v-if="setting.allow_external" @click="() => showModal(item, index)"><MiOpenInNew v-if="setting.inline" /><MiSettings v-else /></span>
                    <span class="bd-settingsarrayRemove" :class="{'bd-disabled': setting.disabled || setting.min && setting.items.length <= setting.min}" @click="() => removeItem(item)"><MiMinus /></span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { shell } from 'electron';
    import { Utils, ClientIPC } from 'common';
    import { MiSettings, MiOpenInNew, MiMinus } from '../../common';
    import { Modals } from 'ui';
    import SettingsPanel from '../SettingsPanel.vue';

    export default {
        props: ['setting'],
        components: {
            MiSettings, MiOpenInNew, MiMinus
        },
        methods: {
            async addItem(openModal) {
                if (this.setting.disabled || this.setting.max && this.setting.items.length >= this.setting.max) return;
                const item = await this.setting.addItem();
                if (openModal) this.showModal(item, this.setting.items.length - 1);
            },
            async removeItem(item) {
                if (this.setting.disabled || this.setting.min && this.setting.items.length <= this.setting.min) return;
                await this.setting.removeItem(item);
            },
            showModal(item, index) {
                Modals.settings(item, this.setting.headertext ? this.setting.headertext.replace(/%n/, index + 1) : this.setting.text + ` #${index + 1}`);
            },
            getItemSettings(item) {
                return item.findSettings(() => true);
            }
        },
        beforeCreate() {
            // https://vuejs.org/v2/guide/components.html#Circular-References-Between-Components
            this.$options.components.SettingsPanel = SettingsPanel;
        }
    }
</script>
