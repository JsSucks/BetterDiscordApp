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
        <div class="bd-flex bd-flex-col bd-pluginsView">
            <div class="bd-flex bd-tabheader">
                <div class="bd-flex-grow bd-button" :class="{'bd-active': local}" @click="showLocal">
                    <h3>Local</h3>
                    <div class="bd-material-button" @click="refreshLocal">
                        <refresh />
                    </div>
                </div>
                <div class="bd-flex-grow bd-button" :class="{'bd-active': !local}" @click="showOnline">
                    <h3>Online</h3>
                    <div class="bd-material-button">
                        <refresh />
                    </div>
                </div>
            </div>
            <div v-if="local" class="bd-flex bd-flex-grow bd-flex-col bd-plugins-container bd-local-plugins">
                <PluginCard v-for="plugin in localPlugins" :plugin="plugin" :key="plugin.id" :togglePlugin="togglePlugin" :reloadPlugin="reloadPlugin" :showSettings="showSettings" />
            </div>
            <div v-if="!local" class="bd-spinner-container">
                <div class="bd-spinner-2"></div>
            </div>
        </div>
        <div v-if="settingsOpen !== null" class="bd-backdrop" @click="settingsOpen = null"></div>
        <div v-if="settingsOpen !== null" class="bd-modal">
            <PluginSettingsModal :plugin="settingsOpen" />
        </div>
    </SettingsWrapper>
</template>

<script>
    // Imports
    import { PluginManager } from 'modules';
    import { SettingsWrapper } from './';
    import PluginCard from './PluginCard.vue';
    import PluginSettingsModal from './PluginSettingsModal.vue';
    import Refresh from 'vue-material-design-icons/refresh.vue';

    export default {
        data() {
            return {
                local: true,
                settingsOpen: null,
                localPlugins: PluginManager.localPlugins
            }
        },
        components: {
            SettingsWrapper, PluginCard, PluginSettingsModal, Refresh
        },
        methods: {
            showLocal() {
                this.local = true;
            },
            showOnline() {
                this.local = false;
            },
            refreshLocal() {
                (async () => {
                    await PluginManager.refreshPlugins();
                })();
            },
            togglePlugin(plugin) {
                // TODO Display error if plugin fails to start/stop
                try {
                    if (plugin.enabled) {
                        PluginManager.stopPlugin(plugin);
                    } else {
                        PluginManager.startPlugin(plugin);
                    }
                } catch (err) {
                    console.log(err);
                }
            },
            reloadPlugin(plugin) {
                (async () => {
                    try {
                        await PluginManager.reloadPlugin(plugin);
                        this.$forceUpdate();
                    } catch (err) {
                        console.log(err);
                    }
                })();
            },
            showSettings(plugin) {
                this.settingsOpen = plugin;
            }
        }
    }

</script>
