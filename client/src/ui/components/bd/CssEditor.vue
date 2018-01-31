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
        <div class="bd-css-editor">
            <div class="bd-form-item">
                <h5>Custom Editor</h5>
                <div class="bd-form-warning">
                    <div class="bd-text">Custom Editor is not installed!</div>
                    <FormButton>
                        Install
                    </FormButton>
                </div>
                <span style="color: #FFF; font-size: 12px; font-weight: 700;">*This is displayed if editor is not installed</span>
                <FormButton :onClick="openInternalEditor">
                    Open
                </FormButton>
            </div>
            <div class="bd-form-divider"></div>
            <SettingSwitch :setting="dummySetting" :onClick="settingClicked" />
            <div class="bd-form-item">
                <h5>System Editor</h5>
                <FormButton>
                    Open
                </FormButton>
            </div>
            <div class="bd-form-divider"></div>
            <FormButton :onClick="settingClicked">
                Enabled
            </FormButton>
            <FormButton :disabled="true">
                <span>Disabled</span>
            </FormButton>
            <FormButton :loading="true" />
        </div>
    </SettingsWrapper>
</template>

<script>
    // Imports
    import { CssEditor } from 'modules';
    import { SettingsWrapper } from './';
    import { SettingSwitch, FormButton } from '../common';

    export default {
        components: {
            SettingsWrapper,
            SettingSwitch, FormButton
        },
        methods: {
            openInternalEditor() {
                CssEditor.show();
            },
            settingClicked() {
            }
        },
        data() {
            return {
                dummySetting: {
                    title: "Live Update",
                    hint: "Automatically update client css when saved.",
                    checked: true
                }
            }
        }
    }
</script>
