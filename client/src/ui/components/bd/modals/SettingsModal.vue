/**
 * BetterDiscord Settings Modal Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-settingsModal" :class="{'bd-edited': changed}">
        <Modal :class="{'bd-modalOut': modal.closing}" :headerText="modal.headertext" @close="modal.close">
            <SettingsPanel :settings="settings" :schemes="modal.schemes" slot="body" class="bd-settingsModalBody" />
            <div slot="footer" class="bd-footerAlert" :class="{'bd-active': changed || saving, 'bd-warn': warnclose}" :style="{pointerEvents: changed ? 'all' : 'none'}">
                <div class="bd-footerAlertText">Unsaved changes</div>
                <div class="bd-button bd-resetButton bd-tp" :class="{'bd-disabled': saving}" @click="resetSettings">Reset</div>
                <div class="bd-button bd-ok" :class="{'bd-disabled': saving}" @click="saveSettings">
                    <div v-if="saving" class="bd-spinner7"></div>
                    <template v-else>Save Changes</template>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script>
    // Imports
    import { Modal } from '../../common';
    import SettingsPanel from '../SettingsPanel.vue';
    import { Utils, ClientLogger as Logger } from 'common';

    export default {
        props: ['modal'],
        data() {
            return {
                warnclose: false,
                settings: null,
                closing: false,
                saving: false,
                closeHandler: null
            }
        },
        components: {
            Modal,
            SettingsPanel
        },
        computed: {
            changed() {
                return this.settings.categories.find(category => category.changed);
            }
        },
        methods: {
            async saveSettings() {
                if (this.saving) return;
                this.saving = true;
                try {
                    await this.modal.saveSettings ? this.modal.saveSettings(this.settings) : this.modal.settings.merge(this.settings);
                } catch (err) {
                    // TODO: display error that settings failed to save
                    Logger.err('SettingsModal', ['Failed to save settings:', err]);
                }
                this.saving = false;
            },
            resetSettings() {
                if (this.saving) return;
                this.cloneSettings();
            },
            cloneSettings() {
                this.settings = this.modal.dont_clone ? this.modal.settings : this.modal.settings.clone();
            }
        },
        created() {
            this.modal.on('close', this.closeHandler = force => {
                if (this.changed && !force) {
                    this.warnclose = true;
                    setTimeout(() => this.warnclose = false, 400);
                    throw {message: 'Settings have been changed'};
                }
            });

            this.modal.settings.on('settings-updated', this.cloneSettings);
            this.cloneSettings();
        },
        destroyed() {
            if (this.closeHandler) this.modal.removeListener('close', this.closeHandler);
            this.modal.settings.off('settings-updated', this.cloneSettings);
        }
    }
</script>
