/**
 * BetterDiscord Settings Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-settings" :class="{'bd-active': active, 'bd-settingsOut': !item && animating}" @keyup="$emit('close')">
        <SidebarView :contentVisible="item" :animating="animating" :class="{'bd-stop': item}">
            <Sidebar slot="sidebar">
                <div class="bd-settingsX" @click="$emit('close')">
                    <MiClose size="17"/>
                    <span class="bd-xText">ESC</span>
                </div>

                <div v-if="nativeModuleErrorCount" class="bd-sidebarMessage bd-err" @click="showNativeModuleErrors">
                    <MiError size="20" />
                    <div>
                        <strong>{{ nativeModuleErrorCount }} native module{{ nativeModuleErrorCount !== 1 ? 's' : '' }} failed to load.</strong>
                        Some features will be unavailable.
                    </div>
                </div>

                <template v-for="(category, text) in sidebar">
                    <SidebarItem :item="{text, type: 'header'}" />
                    <SidebarItem v-for="i in category" :key="i.id" :item="i" :active="item && i.id === item.id" @click="itemOnClick(i.id)" />
                </template>
            </Sidebar>

            <div slot="sidebarfooter" class="bd-info">
                <span class="bd-vtext">{{versionString}}</span>
                <div @click="openGithub" v-tooltip="'GitHub'" class="bd-materialButton">
                    <MiGithubCircle size="16" />
                </div>
                <div @click="openTwitter" v-tooltip="'@Jiiksi'" class="bd-materialButton">
                    <MiTwitterCircle size="16" />
                </div>
                <div @click="openWebsite" v-tooltip="'BetterDiscord'" class="bd-materialButton">
                    <MiWeb size="16" />
                </div>
            </div>

            <ContentColumn slot="content">
                <transition name="bd-contentcolumn" @before-enter="animating++" @after-enter="animating--" @enter-cancelled="animating--" @before-leave="animating++" @after-leave="animating--" @leave-cancelled="animating--">
                    <div v-if="item" :key="item.id">
                        <template v-if="item.component">
                            <component :is="item.component" :SettingsWrapper="SettingsWrapper" />
                        </template>

                        <SettingsWrapper v-else-if="typeof item.set === 'string'" :headertext="Settings.getSet(item.set).headertext">
                            <SettingsPanel :settings="Settings.getSet(item.set)" :schemes="Settings.getSet(item.set).schemes" />
                        </SettingsWrapper>
                        <SettingsWrapper v-else-if="item.set" :headertext="item.set.headertext">
                            <SettingsPanel :settings="item.set" :schemes="item.set.schemes" />
                        </SettingsWrapper>

                        <ConnectivityView v-else-if="item.contentid === 'connectivity'" />
                        <CssEditorView v-else-if="item.contentid === 'css'" />
                        <PluginsView v-else-if="item.contentid === 'plugins'" />
                        <ThemesView v-else-if="item.contentid === 'themes'" />
                        <UpdaterView v-else-if="item.contentid === 'updater'" />
                    </div>
                </transition>
            </ContentColumn>
        </SidebarView>
    </div>
</template>

<script>
    // Imports
    import { Events, Settings, Globals, Reflection } from 'modules';
    import { BdMenuItems } from 'ui';
    import { shell } from 'electron';
    import { SidebarView, Sidebar, SidebarItem, ContentColumn } from './sidebar';
    import { SettingsWrapper, SettingsPanel, CssEditorView, PluginsView, ThemesView, UpdaterView, ConnectivityView, SuperSecretView } from './bd';
    import { SvgX, MiGithubCircle, MiWeb, MiClose, MiTwitterCircle, MiError } from './common';

    export default {
        data() {
            return {
                animating: 0,
                item: null,
                items: BdMenuItems.items,
                Settings,
                SettingsWrapper,
                openMenuHandler: null
            };
        },
        props: ['active'],
        components: {
            SidebarView, Sidebar, SidebarItem, ContentColumn,
            SettingsWrapper, SettingsPanel, CssEditorView, PluginsView, ThemesView, UpdaterView, ConnectivityView,
            MiGithubCircle, MiWeb, MiClose, MiTwitterCircle, MiError
        },
        computed: {
            sidebar() {
                const categories = {};
                for (let item of this.items) {
                    if (item.hidden) continue;
                    const category = categories[item.category] || (categories[item.category] = []);
                    category.push(item);
                }
                return categories;
            },
            versionString() {
                return Globals.version;
            },
            nativeModuleErrorCount() {
                return Globals.nativeModuleErrorCount;
            }
        },
        methods: {
            itemOnClick(id) {
                this.item = this.items.find(item => item.id === id);
            },
            closeContent() {
                this.item = null;
            },
            openGithub() {
                shell.openExternal('https://github.com/JsSucks/BetterDiscordApp');
            },
            openWebsite() {
                shell.openExternal('https://betterdiscord.net');
            },
            openTwitter() {
                shell.openExternal('https://twitter.com/Jiiksi');
            },
            showNativeModuleErrors() {
                Events.emit('show-native-module-errors');
            }
        },
        watch: {
            active(active) {
                if (active) return;
                this.closeContent();
            }
        },
        created() {
            Events.on('bd-open-menu', this.openMenuHandler = item => item && this.itemOnClick(this.items.find(i => i === item || i.id === item || i.contentid === item || i.set === item).id));

            try {
                const currentUser = Reflection.module.byName('UserStore').getCurrentUser();
                if (['81388395867156480', '98003542823944192', '249746236008169473', '284056145272766465', '478559353516064769'].includes(currentUser.id)) {
                    BdMenuItems.addVueComponent('BD Devs', 'Super Secret', SuperSecretView);
                }
            } catch (err) {}
        },
        destroyed() {
            if (this.openMenuHandler) Events.off('bd-open-menu', this.openMenuHandler);
        }
    }
</script>
