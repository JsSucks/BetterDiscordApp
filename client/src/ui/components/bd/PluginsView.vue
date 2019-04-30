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
    <SettingsWrapper headertext="Plugins" :noscroller="true">
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
            <div v-if="local" class="bd-flex bd-flexGrow bd-flexCol bd-pluginsContainer bd-localPlugins bd-localPh">
                <ScrollerWrap>
                    <PluginCard v-for="plugin in localPlugins" :plugin="plugin" :key="plugin.id" :data-plugin-id="plugin.id" @toggle-plugin="togglePlugin(plugin)" @reload-plugin="reloadPlugin(plugin)" @delete-plugin="unload => deletePlugin(plugin, unload)" @show-settings="dont_clone => showSettings(plugin, dont_clone)" />
                </ScrollerWrap>
            </div>
            <div v-else class="bd-onlinePh">
                <div class="bd-onlinePhHeader bd-flexCol">
                    <div class="bd-flex bd-flexRow">
                        <div v-if="loadingOnline" class="bd-spinnerContainer">
                            <div class="bd-spinner7" />
                        </div>
                        <div class="bd-searchHint">{{searchHint}}</div>
                        <form @submit.prevent="refreshOnline">
                            <div class="bd-fancySearch" :class="{'bd-disabled': loadingOnline, 'bd-active': loadingOnline || (onlinePlugins && onlinePlugins.docs)}">
                                <input type="text" class="bd-textInput" placeholder="Search" v-model="onlinePlugins.filters.sterm" :disabled="loadingOnline" @input="search" @keyup.stop/>
                            </div>
                        </form>
                    </div>
                    <div class="bd-flex bd-flexRow" v-if="onlinePlugins && onlinePlugins.docs && onlinePlugins.docs.length">
                        <div class="bd-searchSort bd-flex bd-flexGrow">
                            <div v-for="btn in sortBtns"
                                 class="bd-sort"
                                 :class="{'bd-active': onlinePlugins.filters.sort === btn.toLowerCase(), 'bd-flipY': onlinePlugins.filters.ascending}"
                                 @click="sortBy(btn.toLowerCase())">
                                {{btn}}<MiChevronDown v-if="onlinePlugins.filters.sort === btn.toLowerCase()" size="18" />
                            </div>
                        </div>
                    </div>
                </div>
                <ScrollerWrap class="bd-onlinePhBody" @scrollend="scrollend">
                    <template v-if="!loadingOnline && onlinePlugins">
                        <RemoteCard v-if="onlinePlugins && onlinePlugins.docs" v-for="plugin in onlinePlugins.docs" :key="onlinePlugins.id" :item="plugin" @tagclicked="searchByTag" />
                        <div class="bd-spinnerContainer">
                            <div v-if="loadingMore" class="bd-spinner7" />
                        </div>
                    </template>
                </ScrollerWrap>
            </div>
        </div>
    </SettingsWrapper>
</template>

<script>
    // Imports
    import { PluginManager, BdWebApi } from 'modules';
    import { Modals } from 'ui';
    import { ClientLogger as Logger } from 'common';
    import { MiRefresh, ScrollerWrap, MiChevronDown } from '../common';
    import SettingsWrapper from './SettingsWrapper.vue';
    import PluginCard from './PluginCard.vue';
    import RemoteCard from './RemoteCard.vue';
    import RefreshBtn from '../common/RefreshBtn.vue';

    export default {
        data() {
            return {
                PluginManager,
                sortBtns: ['Updated', 'Installs', 'Users', 'Rating'],
                local: true,
                localPlugins: PluginManager.localPlugins,
                onlinePlugins: {
                    docs: [],
                    filters: {
                        sterm: '',
                        sort: 'installs',
                        ascending: false
                    },
                    pagination: {
                        total: 0,
                        pages: 0,
                        limit: 9,
                        page: 1
                    }
                },
                loadingOnline: false,
                loadingMore: false,
                searchHint: '',
                searchTimeout: null
            };
        },
        components: {
            SettingsWrapper, PluginCard, RemoteCard,
            MiRefresh, MiChevronDown,
            ScrollerWrap,
            RefreshBtn
        },
        methods: {
            showLocal() {
                this.local = true;
            },
            async showOnline() {
                this.local = false;
                if (!this.onlinePlugins.pagination.total) await this.refreshOnline();
            },
            async refreshLocal() {
                await this.PluginManager.refreshPlugins();
            },
            async refreshOnline() {
                this.searchHint = '';
                if (this.loadingOnline || this.loadingMore) return;
                this.loadingOnline = true;
                try {
                    const getPlugins = await BdWebApi.plugins.get(this.onlinePlugins.filters);
                    this.onlinePlugins = getPlugins;
                    if (!this.onlinePlugins.docs) return;
                    this.searchHint = `${this.onlinePlugins.pagination.total} Results`;
                } catch (err) {
                    Logger.err('PluginsView', err);
                } finally {
                    this.loadingOnline = false;
                }
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
            },
            async scrollend(e) {
                if (this.onlinePlugins.pagination.page >= this.onlinePlugins.pagination.pages) return;
                if (this.loadingOnline || this.loadingMore) return;
                this.loadingMore = true;

                try {
                    const getPlugins = await BdWebApi.plugins.get({
                        sterm: this.onlinePlugins.filters.sterm,
                        page: this.onlinePlugins.pagination.page + 1,
                        sort: this.onlinePlugins.filters.sort,
                        ascending: this.onlinePlugins.filters.ascending
                    });

                    this.onlinePlugins.docs = [...this.onlinePlugins.docs, ...getPlugins.docs];
                    this.onlinePlugins.filters = getPlugins.filters;
                    this.onlinePlugins.pagination = getPlugins.pagination;
                } catch (err) {
                    Logger.err('PluginsView', err);
                } finally {
                    this.loadingMore = false;
                }
            },
            async sortBy(by) {
                if (this.loadingOnline || this.loadingMore) return;
                if (this.onlinePlugins.filters.sort === by) {
                    this.onlinePlugins.filters.ascending = !this.onlinePlugins.filters.ascending;
                } else {
                    this.onlinePlugins.filters.sort = by;
                    this.onlinePlugins.filters.ascending = false;
                }
                this.refreshOnline();
            },
            async search() {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(this.refreshOnline, 1000);
            },
            async searchByTag(tag) {
                if (this.loadingOnline || this.loadingMore) return;
                this.onlinePlugins.filters.sterm = tag;
                this.refreshOnline();
            }
        }
    }
</script>
