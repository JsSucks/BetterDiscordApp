/**
 * BetterDiscord Theme Card Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <Card :item="theme">
        <SettingSwitch slot="toggle" :value="theme.enabled" @input="$emit('toggle-theme')" />
        <ButtonGroup slot="controls" v-if="!online">
            <Button v-if="devmode && !theme.packed" v-tooltip="'Package Theme'" @click="package"><MiBoxDownload size="18" /></Button>
            <Button v-tooltip="'Settings (shift + click to open settings without cloning the set)'" v-if="theme.hasSettings" @click="$emit('show-settings', $event.shiftKey)"><MiSettings size="18" /></Button>
            <Button v-tooltip="'Recompile (shift + click to reload)'" @click="$emit('reload-theme', $event.shiftKey)"><MiRefresh size="18" /></Button>
            <Button v-if="devmode && !theme.packed" v-tooltip="'Edit'" @click="editTheme"><MiPencil size="18" /></Button>
            <Button v-tooltip="'Uninstall (shift + click to unload)'" @click="$emit('delete-theme', $event.shiftKey)" type="err"><MiDelete size="18" /></Button>
        </ButtonGroup>
    </Card>
</template>

<script>
    // Imports
    import { Toasts } from 'ui';
    import { Settings, ThemeManager } from 'modules';
    import { ClientLogger as Logger } from 'common';
    import { shell } from 'electron';
    import Card from './Card.vue';
    import { Button, ButtonGroup, SettingSwitch, MiSettings, MiRefresh, MiPencil, MiDelete, MiExtension, MiBoxDownload } from '../common';

    export default {
        data() {
            return {
                devmodeSetting: Settings.getSetting('core', 'advanced', 'developer-mode')
            };
        },
        props: ['theme', 'online'],
        components: {
            Card, Button, ButtonGroup, SettingSwitch,
            MiSettings, MiRefresh, MiPencil, MiDelete, MiExtension, MiBoxDownload
        },
        computed: {
            devmode() {
                return this.devmodeSetting.value;
            }
        },
        methods: {
            async package() {
                try {
                    const packagePath = await ThemeManager.packContent(this.theme.name, this.theme.contentPath);
                    Toasts.success(`Theme Packaged: ${packagePath}`);
                } catch (err) {
                    Logger.log('ThemeCard', err);
                }
            },
            editTheme() {
                try {
                    shell.openItem(this.theme.contentPath);
                } catch (err) {
                    Logger.err('ThemeCard', [`Error opening theme directory ${this.theme.contentPath}:`, err]);
                }
            }
        }
    }
</script>
