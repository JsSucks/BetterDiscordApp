/**
 * BetterDiscord Themes View Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <SettingsWrapper headertext="Themes">
        <div class="bd-tabbar" slot="header">
            <div class="bd-button" :class="{'bd-active': local}" @click="showLocal">
                <h3>Installed</h3>
                <RefreshBtn v-if="local" @click="refreshLocal"/>
            </div>
            <div class="bd-button" :class="{'bd-active': !local}" @click="showOnline">
                <h3>Browse</h3>
                <RefreshBtn v-if="!local" @click="refreshOnline" />
            </div>
        </div>

        <div class="bd-flex bd-flexCol bd-themesview">
            <div v-if="local" class="bd-flex bd-flexGrow bd-flexCol bd-themesContainer bd-localThemes">
                <ThemeCard v-for="theme in localThemes" :theme="theme" :key="theme.id" :data-theme-id="theme.id" @toggle-theme="toggleTheme(theme)" @reload-theme="reload => reloadTheme(theme, reload)" @show-settings="dont_clone => showSettings(theme, dont_clone)" @delete-theme="unload => deleteTheme(theme, unload)" />
            </div>
            <div v-if="!local" class="bd-onlinePh">
                <div class="bd-fancySearch" :class="{'bd-active': loadingOnline || (onlineThemes && onlineThemes.docs)}">
                    <input type="text" class="bd-textInput" @keydown.enter="searchInput" @keyup.stop/>
                </div>
                <h2 v-if="loadingOnline">Loading</h2>
                <RemoteCard v-else-if="onlineThemes && onlineThemes.docs" v-for="theme in onlineThemes.docs" :key="theme.id" :item="theme"/>
            </div>
        </div>
    </SettingsWrapper>
</template>

<script>
    // Imports
    import { ThemeManager, BdWebApi } from 'modules';
    import { Modals } from 'ui';
    import { ClientLogger as Logger } from 'common';
    import { MiRefresh } from '../common';
    import SettingsWrapper from './SettingsWrapper.vue';
    import ThemeCard from './ThemeCard.vue';
    import RemoteCard from './RemoteCard.vue';
    import RefreshBtn from '../common/RefreshBtn.vue';

    export default {
        data() {
            return {
                ThemeManager,
                local: true,
                localThemes: ThemeManager.localThemes,
                onlineThemes: null,
                loadingOnline: false
            };
        },
        components: {
            SettingsWrapper, ThemeCard, RemoteCard,
            MiRefresh,
            RefreshBtn
        },
        methods: {
            showLocal() {
                this.local = true;
            },
            async showOnline() {
                this.local = false;
                if (this.loadingOnline || this.onlineThemes) return;
            },
            async refreshLocal() {
                await this.ThemeManager.refreshThemes();
            },
            async refreshOnline() {
                this.loadingOnline = true;
                try {
                    // const getThemes = await BdWebApi.themes.get();
                    // this.onlineThemes = JSON.parse(getThemes);
                    const dummies = [];
                    for (let i = 0; i < 10; i++) {
                        dummies.push({
                            id: `theme${i}`,
                            name: `Dummy ${i}`,
                            tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
                            installs: Math.floor(Math.random() * 10000),
                            updated: '2018-07-21T14:51:32.057Z',
                            rating: Math.floor(Math.random() * 1000),
                            activeUsers: Math.floor(Math.random() * 1000),
                            rated: Math.random() > .5,
                            version: '1.0.0',
                            repository: {
                                name: 'ExampleRepository',
                                baseUri: 'https://github.com/Jiiks/ExampleRepository',
                                rawUri: 'https://github.com/Jiiks/ExampleRepository/raw/master'
                            },
                            files: {
                                readme: 'Example/readme.md',
                                previews: [{
                                    large: 'Example/preview1-big.png',
                                    thumb: 'Example/preview1-small.png'
                                }]
                            },
                            author: 'Jiiks'
                        });
                    }
                    this.onlineThemes = { docs: dummies };
                } catch (err) {
                    Logger.err('ThemesView', err);
                } finally {
                    this.loadingOnline = false;
                }
            },
            async toggleTheme(theme) {
                // TODO: display error if theme fails to enable/disable
                try {
                    await theme.enabled ? this.ThemeManager.disableTheme(theme) : this.ThemeManager.enableTheme(theme);
                } catch (err) {
                    Logger.err('ThemesView', [`Error ${enabled ? 'stopp' : 'start'}ing theme ${theme.name}:`, err]);
                }
            },
            async reloadTheme(theme, reload) {
                try {
                    await reload ? this.ThemeManager.reloadTheme(theme) : theme.recompile();
                } catch (err) {
                    Logger.err('ThemesView', [`Error ${reload ? 'reload' : 'recompil'}ing theme ${theme.name}:`, err]);
                }
            },
            async deleteTheme(theme, unload) {
                try {
                    await unload ? this.ThemeManager.unloadTheme(theme) : this.ThemeManager.deleteTheme(theme);
                } catch (err) {
                    Logger.err('ThemesView', [`Error ${unload ? 'unload' : 'delet'}ing theme ${theme.name}:`, err]);
                }
            },
            showSettings(theme, dont_clone) {
                return Modals.contentSettings(theme, null, {
                    dont_clone
                });
            },
            searchInput(e) {
                this.loadingOnline = true;
                setTimeout(this.refreshOnline, 1000);
            }
        }
    }
</script>
