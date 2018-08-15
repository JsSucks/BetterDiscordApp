/**
 * BetterDiscord Css Editor Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <SettingsWrapper headertext="CSS Editor">
        <div class="bd-cssEditor">
            <div v-if="error" class="bd-formItem">
                <h5 style="margin-bottom: 10px;">Compiler error</h5>
                <div class="bd-err bd-preWrap"><div class="bd-pre">{{ error.formatted }}</div></div>
                <div class="bd-formDivider"></div>
            </div>

            <div class="bd-formItem">
                <h5>Custom Editor</h5>
                <FormButton v-if="internalEditorIsInstalled" @click="openInternalEditor">Open</FormButton>
                <template v-else>
                    <div class="bd-formWarning">
                        <div class="bd-text">Custom Editor is not installed!</div>
                        <FormButton>Install</FormButton>
                    </div>
                    <span style="color: #fff; font-size: 12px; font-weight: 700;">* This is displayed if editor is not installed</span>
                </template>
            </div>
            <div class="bd-formDivider"></div>

            <div class="bd-formItem">
                <h5>System Editor</h5>
                <FormButton @click="openSystemEditor">Open</FormButton>
                <p class="bd-hint">This will open {{ systemEditorPath }} in your system's default editor.</p>
            </div>
            <div class="bd-formDivider"></div>

            <div class="bd-formItem">
                <h5 style="margin-bottom: 10px;">Settings</h5>
            </div>
            <SettingsPanel :settings="settingsset" />

            <FormButton @click="recompile" :loading="compiling">Recompile</FormButton>
        </div>
    </SettingsWrapper>
</template>

<script>
    // Imports
    import { Settings, CssEditor } from 'modules';
    import { SettingsWrapper } from './';
    import { FormButton } from '../common';
    import SettingsPanel from './SettingsPanel.vue';
    import Setting from './setting/Setting.vue';

    export default {
        components: {
            SettingsWrapper,
            SettingsPanel,
            Setting,
            FormButton
        },
        data() {
            return {
                CssEditor
            };
        },
        computed: {
            error() {
                return this.CssEditor.error;
            },
            compiling() {
                return this.CssEditor.compiling;
            },
            systemEditorPath() {
                return this.CssEditor.filePath;
            },
            liveUpdateSetting() {
                return Settings.getSetting('css', 'default', 'live-update');
            },
            watchFilesSetting() {
                return Settings.getSetting('css', 'default', 'watch-files');
            },
            settingsset() {
                return Settings.css;
            },
            internalEditorIsInstalled() {
                return true;
            }
        },
        methods: {
            openInternalEditor() {
                this.CssEditor.show();
            },
            openSystemEditor() {
                this.CssEditor.openSystemEditor();
            },
            recompile() {
                this.CssEditor.recompile();
            }
        }
    }
</script>
