/**
 * BetterDiscord Plugin Settings Modal Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <Modal :headerText="plugin.name + ' Settings'" :close="() => {  }">
        <div slot="body" v-for="setting in plugin.pluginConfig" class="bd-plugin-settings-body">
            <div class="bd-form-item">

                <div v-if="setting.type === 'bool'" class="bd-setting-switch">
                    <div class="bd-title">
                        <h3>{{setting.text}}</h3>
                        <label class="bd-switch-wrapper">
                            <input type="checkbox" class="bd-switch-checkbox" />
                            <div class="bd-switch" :class="{'bd-checked': setting.value}" />
                        </label>
                    </div>
                    <div class="bd-hint">{{setting.hint}}</div>
                </div>

                <div v-else-if="setting.type === 'text'" class="bd-form-textinput">
                    <div class="bd-title">
                        <h3>{{setting.text}}</h3>
                        <div class="bd-textinput-wrapper">
                            <input type="text" v-model="setting.value" @keyup.stop @keydown="textInputKd" />
                        </div>
                    </div>
                    <div class="bd-hint">{{setting.hint}}</div>
                </div>

                <div class="bd-form-divider"></div>
            </div>

        </div>

        <div slot="footer">
            <div class="footer-alert" :class="{'bd-active': changed}">
                <div class="footer-alert-text">Unsaved changes</div>
                <div class="bd-reset-button">Reset</div>
                <div class="bd-button bd-ok">Save Changes</div>
            </div>
        </div>
    </Modal>
</template>
<script>
    // Imports
    import { Modal } from '../common';

    export default {
        props: ['plugin'],
        data() {
            return {
                'changed': false
            }
        },
        components: {
            Modal
        },
        methods: {
            textInputKd(e) {
                this.changed = true;
            }
        }
    }
</script>