/**
 * BetterDiscord Window Preferences Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-windowPreferences">
        <div v-if="disabled" class="bd-formItem bd-windowPreferencesDisabled">
            <p>You can't edit your window preferences here as you are using a JavaScript file to set window preferences.</p>
            <FormButton @click="openFile">Open</FormButton>
            <p class="bd-hint">This will open {{ filePath }} in your system's default editor.</p>
        </div>

        <div v-else-if="settingsSet" class="bd-formItem">
            <SettingsPanel :settings="settingsSet" />

            <p class="bd-hint">You must fully restart Discord for changes here to take effect.</p>
            <FormButton @click="restart">Restart</FormButton>

            <FormButton @click="openFile">Open</FormButton>
            <p class="bd-hint">This will open {{ filePath }} in your system's default editor.</p>
        </div>

        <div v-else>
            <p>Loading...</p>
        </div>
    </div>
</template>

<script>
    import { Globals } from 'modules';
    import { SettingsSet } from 'structs';
    import { Utils, FileUtils, ClientLogger as Logger } from 'common';
    import path from 'path';
    import { remote, shell } from 'electron';
    import SettingsPanel from '../SettingsPanel.vue';
    import { FormButton } from '../../common';

    export default {
        props: ['setting'],
        data() {
            return {
                saved: {},
                settingsSet: null,
                disabled: false
            };
        },
        components: {
            // SettingsPanel,
            FormButton
        },
        computed: {
            filePath() {
                return Globals.require.resolve(path.join(Globals.getPath('data'), 'window'));
            }
        },
        methods: {
            openFile() {
                return shell.openExternal('file://' + this.filePath);
            },
            restart() {
                remote.app.relaunch();
                remote.app.quit();
            },
            async listener(event) {
                const newPreferences = Utils.deepclone(this.saved);

                if (event.category.id === 'default' && event.setting.id === 'transparent') {
                    newPreferences.transparent = event.value;
                    if (event.value) delete newPreferences.backgroundColor;
                }

                if (event.category.id === 'default' && event.setting.id === 'background-colour') {
                    newPreferences.backgroundColor = event.value;
                }

                if (event.category.id === 'default' && event.setting.id === 'frame') {
                    newPreferences.frame = event.value;
                }

                if (event.category.id === 'advanced' && event.setting.id === 'experimental-features') {
                    if (!newPreferences.webPreferences) newPreferences.webPreferences = {};
                    newPreferences.webPreferences.experimentalFeatures = event.value;
                }

                if (event.category.id === 'advanced' && event.setting.id === 'preload') {
                    if (!newPreferences.webPreferences) newPreferences.webPreferences = {};
                    newPreferences.webPreferences.preload = event.value;
                }

                if (event.category.id === 'advanced' && event.setting.id === 'webview-tag') {
                    if (!newPreferences.webPreferences) newPreferences.webPreferences = {};
                    newPreferences.webPreferences.webviewTag = event.value;
                }

                try {
                    await FileUtils.writeJsonToFile(this.filePath, newPreferences, true);
                    await this.update();
                } catch (err) {
                    Logger.err('WindowPreferences', ['Failed to update window preferences:', err]);
                }
            },
            async update() {
                this.saved = await FileUtils.readJsonFromFile(this.filePath) || {};
                this.settingsSet.getSetting('default', 'transparent').value = this.saved.transparent;
                this.settingsSet.getSetting('default', 'background-colour').value = this.saved.backgroundColor;
                this.settingsSet.getSetting('default', 'frame').value = this.saved.frame;
                this.settingsSet.getSetting('advanced', 'experimental-features').value = this.saved.webPreferences && this.saved.webPreferences.experimentalFeatures;
                this.settingsSet.getSetting('advanced', 'preload').value = this.saved.webPreferences && this.saved.webPreferences.preload;
                this.settingsSet.getSetting('advanced', 'webview-tag').value = this.saved.webPreferences && this.saved.webPreferences.webviewTag;
                this.settingsSet.setSaved();
            }
        },
        beforeCreate() {
            // https://vuejs.org/v2/guide/components.html#Circular-References-Between-Components
            this.$options.components.SettingsPanel = SettingsPanel;
        },
        async created() {
            if (this.filePath !== path.join(Globals.getPath('data'), 'window.json')) {
                this.disabled = true;
                return;
            }

            this.settingsSet = new SettingsSet({});

            const category = await this.settingsSet.addCategory({id: 'default'});

            await category.addSetting({
                id: 'transparent',
                type: 'bool',
                text: 'Transparent',
                hint: 'Removes the window background. This requires the background colour option to be disabled, and a theme to remove any higher backgrounds.'
            });

            await category.addSetting({
                id: 'background-colour',
                type: 'colour',
                text: 'Background colour',
                hint: 'Sets the background colour under any elements.'
            });

            await category.addSetting({
                id: 'frame',
                type: 'bool',
                text: 'Frame',
                hint: 'Shows the desktop environment\'s default window frame.'
            });

            const advanced = await this.settingsSet.addCategory({
                id: 'advanced',
                name: 'Advanced',
                type: 'drawer'
            });

            await advanced.addSetting({
                id: 'experimental-features',
                type: 'bool',
                text: 'Experimental features',
                hint: 'Enables Chromium\'s experimental features.'
            });

            await advanced.addSetting({
                id: 'preload',
                type: 'text',
                text: 'Preload script',
                hint: 'The path of a JavaScript file relative to the BetterDiscord data directory to run before the window is loaded.'
            });

            await advanced.addSetting({
                id: 'webview-tag',
                type: 'bool',
                text: 'Webview tag',
                hint: 'Enables the webview tag. If you enable this you should use a preload script to restrict how the webview tag can be used.'
            });

            try {
                await this.update();
            } catch (err) {
                Logger.err('WindowPreferences', ['Failed to read window preferences:', err]);
            }

            this.settingsSet.on('setting-updated', this.listener);
        },
        unmounted() {
            if (this.settingsSet) this.settingsSet.removeListener('setting-updated', this.listener);
        }
    }
</script>
