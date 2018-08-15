/**
 * BetterDiscord Custom Setting Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-formCustomsetting" :class="{'bd-formCustomsettingDebug': setting.debug}">
        <component :is="component" :setting="setting" :change="change"></component>
        <Drawer class="bd-formCustomsettingValue bd-formTextarea" label="Custom setting data" v-if="setting.debug">
            <pre class="bd-preWrap"><div class="bd-pre">{{ JSON.stringify(setting, null, 4) }}</div></pre>

            <div class="bd-formTextareaDetails">
                <div class="bd-title">
                    <h3>Set value</h3>
                </div>
                <div class="bd-hint">Enter a JSON string to update the setting.</div>
            </div>
            <textarea ref="set_value_input" class="bd-textarea" @keyup.stop :value="JSON.stringify(setting.value, null, 4)"></textarea>
            <Button @click="setting.value = JSON.parse($refs.set_value_input.value)">Update</Button>
        </Drawer>
    </div>
</template>

<script>
    import { Globals, PluginManager } from 'modules';
    import SettingsPanel from '../SettingsPanel.vue';
    import Drawer from '../../common/Drawer.vue';
    import Button from '../../common/Button.vue';
    import * as InternalSettings from '../internal-settings';
    import path from 'path';

    export default {
        props: ['setting'],
        components: {
            Drawer,
            Button
        },
        computed: {
            component() {
                if (this.setting.path && typeof this.setting.file === 'string') {
                    const component = Globals.require(path.join(this.setting.path, this.setting.file));
                    return this.setting.component ? component[this.setting.component] : component.default ? component.default : component;
                }

                if (this.setting.path && typeof this.setting.function === 'string') {
                    const plugin = PluginManager.getPluginByPath(this.setting.path);
                    if (!plugin) return;
                    const component = plugin[this.setting.function](this.setting, this.change);
                    if (component instanceof HTMLElement)
                        return this.componentFromHTMLElement(component, this.setting, this.change);
                    return component;
                }

                if (this.setting.path && typeof this.setting.component === 'string') {
                    const plugin = PluginManager.getPluginByPath(this.setting.path);
                    if (plugin && plugin[this.setting.component]) return plugin[this.setting.component];
                }

                if (typeof this.setting.component === 'object') {
                    return this.setting.component;
                }

                if (typeof this.setting.component === 'string' && InternalSettings[this.setting.component]) {
                    return InternalSettings[this.setting.component];
                }
            }
        },
        methods: {
            componentFromHTMLElement(htmlelement, setting, change) {
                return {
                    template: '<div></div>',
                    props: ['setting', 'change'],
                    mounted() {
                        this.$el.appendChild(htmlelement);
                    }
                };
            },
            change(value, ignore_disabled) {
                if (this.disabled && !ignore_disabled) return;
                this.setting.value = value;
            }
        }
    }
</script>
