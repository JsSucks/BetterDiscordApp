/**
 * BetterDiscord Plugins View Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <SettingsWrapper headertext="Plugins">
        <div class="bd-tabbar" slot="header">
            <div class="bd-button" :class="{'bd-active': local}" @click="showLocal">
                <h3>Installed</h3>
                <RefreshBtn v-if="local" @click="refreshLocal" />
            </div>
            <div class="bd-button" :class="{'bd-active': !local}" @click="showOnline">
                <h3>Browse</h3>
                <RefreshBtn v-if="!local" @click="refreshOnline" />
            </div>
        </div>

        <div class="bd-flex bd-flexCol bd-pluginsview">
            <div v-if="local" class="bd-flex bd-flexGrow bd-flexCol bd-pluginsContainer bd-localPlugins">
                <PluginCard v-for="plugin in localPlugins" :plugin="plugin" :key="plugin.id" :data-plugin-id="plugin.id" @toggle-plugin="togglePlugin(plugin)" @reload-plugin="reloadPlugin(plugin)" @delete-plugin="unload => deletePlugin(plugin, unload)" @show-settings="dont_clone => showSettings(plugin, dont_clone)" />
            </div>
            <div v-if="!local" class="bd-onlinePh">
                <h3>Coming Soon</h3>
                <a href="https://v2.betterdiscord.net/plugins" target="_new">Website Browser</a>
            </div>
        </div>
    </SettingsWrapper>
</template>

<script>
    // Imports
    import { PluginManager } from 'modules';
    import { Modals } from 'ui';
    import { ClientLogger as Logger } from 'common';
    import { MiRefresh } from '../common';
    import SettingsWrapper from './SettingsWrapper.vue';
    import PluginCard from './PluginCard.vue';
    import RefreshBtn from '../common/RefreshBtn.vue';

    export default {
        data() {
            return {
                PluginManager,
                local: true,
                localPlugins: PluginManager.localPlugins
            };
        },
        components: {
            SettingsWrapper, PluginCard,
            MiRefresh,
            RefreshBtn
        },
        methods: {
            showLocal() {
                this.local = true;
            },
            showOnline() {
                this.local = false;
            },
            async refreshLocal() {
                await this.PluginManager.refreshPlugins();
            },
            async refreshOnline() {
                // TODO
            },
            async togglePlugin(plugin) {
                // TODO: display error if plugin fails to start/stop
                const enabled = plugin.enabled;
                try {
                    await enabled ? this.PluginManager.stopPlugin(plugin) : this.PluginManager.startPlugin(plugin);
                } catch (err) {
                    Logger.err('PluginsView', [`Error ${enabled ? 'stopp' : 'start'}ing plugin ${plugin.name}:`, err]);
                }
            },
            async reloadPlugin(plugin) {
                try {
                    await this.PluginManager.reloadPlugin(plugin);
                } catch (err) {
                    Logger.err('PluginsView', [`Error reloading plugin ${plugin.name}:`, err]);
                }
            },
            async deletePlugin(plugin, unload) {
                try {
                    await unload ? this.PluginManager.unloadPlugin(plugin) : this.PluginManager.deletePlugin(plugin);
                } catch (err) {
                    Logger.err('PluginsView', [`Error ${unload ? 'unload' : 'delet'}ing plugin ${plugin.name}:`, err]);
                }
            },
            showSettings(plugin, dont_clone) {
                return Modals.contentSettings(plugin, null, {
                    dont_clone
                });
            }
        }
    }
</script>
