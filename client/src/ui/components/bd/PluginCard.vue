/**
 * BetterDiscord Plugin Card Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-plugin-card">
        <div class="bd-plugin-header">
            <span v-tooltip="'wat'">{{plugin.name}}</span>
            <div class="bd-flex-spacer" />
            <label class="bd-switch-wrapper" @click="() => { togglePlugin(plugin); this.$forceUpdate(); }">
                <input type="checkbox" class="bd-switch-checkbox" />
                <div class="bd-switch" :class="{'bd-checked': plugin.enabled}" />
            </label>
        </div>
        <div class="bd-plugin-body">
            <div class="bd-plugin-description">{{plugin.description}}</div>
            <div class="bd-plugin-footer">
                <div class="bd-plugin-extra">v{{plugin.version}} by {{plugin.authors.join(', ').replace(/,(?!.*,)/gmi, ' and')}}</div>
                <div class="bd-controls">
                    <ButtonGroup>
                        <Button v-tooltip="'Settings'" v-if="plugin.hasSettings" :onClick="() => showSettings(plugin)">
                            <MiSettings />
                        </Button>
                        <Button v-tooltip="'Reload'" :onClick="() => reloadPlugin(plugin)">
                            <MiReload />
                        </Button>
                        <Button v-tooltip="'Edit'" :onClick="editPlugin">
                            <MiEdit />
                        </Button>
                        <Button v-tooltip="'Uninstall'" type="err">
                            <MiDelete />
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    // Imports
    import { shell } from 'electron';
    import { Button, ButtonGroup, SettingSwitch } from '../common';
    import MiSettings from 'vue-material-design-icons/settings.vue';
    import MiReload from 'vue-material-design-icons/refresh.vue';
    import MiEdit from 'vue-material-design-icons/pencil.vue';
    import MiDelete from 'vue-material-design-icons/delete.vue';

    export default {
        data() {
            return {
                settingsOpen: false
            }
        },
        props: ['plugin', 'togglePlugin', 'reloadPlugin', 'showSettings'],
        components: {
            Button, ButtonGroup, SettingSwitch,
            MiSettings, MiReload, MiEdit, MiDelete
        },
        methods: {
            editPlugin() {
                try {
                    shell.openItem(this.plugin.pluginPath);
                } catch (err) {
                    console.log(err);
                }
            }
        }

    }
</script>
