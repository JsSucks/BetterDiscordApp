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
    <div class="bd-settings" :class="{active: active, 'bd-settings-out': activeIndex === -1 && lastActiveIndex >= 0}" @keyup="$emit('close')">
        <SidebarView :contentVisible="this.activeIndex >= 0 || this.lastActiveIndex >= 0" :animating="this.animating" :class="{'bd-stop': !first}">
            <Sidebar slot="sidebar">
                <div class="bd-settings-x" @click="$emit('close')">
                    <MiClose size="17"/>
                    <span class="bd-x-text">ESC</span>
                </div>
                <template v-for="(category, text) in sidebar">
                    <SidebarItem :item="{text, type: 'header'}" />
                    <SidebarItem v-for="item in category" :item="item" :key="item.id" @click="itemOnClick(item.id)" />
                </template>
            </Sidebar>
            <div slot="sidebarfooter" class="bd-info">
                <span class="bd-vtext">v2.0.0a by Jiiks/JsSucks</span>
                <div @click="openGithub" v-tooltip="'GitHub'" class="bd-material-button">
                    <MiGithubCircle size="16" />
                </div>
                <div @click="openTwitter" v-tooltip="'@Jiiksi'" class="bd-material-button">
                    <MiTwitterCircle size="16" />
                </div>
                <div @click="openWebsite" v-tooltip="'BetterDiscord'" class="bd-material-button">
                    <MiWeb size="16" />
                </div>
            </div>
            <ContentColumn slot="content">
                <div v-for="item in sidebarItems" v-if="activeContent(item.contentid) || animatingContent(item.contentid)" :class="{active: activeContent(item.contentid), animating: animatingContent(item.contentid)}">
                    <template v-if="item.component">
                        <component :is="item.component" :SettingsWrapper="SettingsWrapper" />
                    </template>

                    <SettingsWrapper v-if="typeof item.set === 'string'" :headertext="Settings.getSet(item.set).headertext">
                        <SettingsPanel :settings="Settings.getSet(item.set)" :schemes="Settings.getSet(item.set).schemes" />
                    </SettingsWrapper>
                    <SettingsWrapper v-else-if="item.set" :headertext="item.set.headertext">
                        <SettingsPanel :settings="item.set" :schemes="item.set.schemes" />
                    </SettingsWrapper>

                    <CssEditorView v-if="item.contentid === 'css'" />
                    <PluginsView v-if="item.contentid === 'plugins'" />
                    <ThemesView v-if="item.contentid === 'themes'" />
                    <UpdaterView v-if="item.contentid === 'updater'" />
                </div>
            </ContentColumn>
        </SidebarView>
    </div>
</template>

<script>
    // Imports
    import { Events, Settings } from 'modules';
    import { BdMenuItems } from 'ui';
    import { shell } from 'electron';
    import { SidebarView, Sidebar, SidebarItem, ContentColumn } from './sidebar';
    import { SettingsWrapper, SettingsPanel, CssEditorView, PluginsView, ThemesView, UpdaterView } from './bd';
    import { SvgX, MiGithubCircle, MiWeb, MiClose, MiTwitterCircle } from './common';
    import { ClientIPC } from 'common';

    export default {
        data() {
            return {
                BdMenuItems,
                activeIndex: -1,
                lastActiveIndex: -1,
                animating: false,
                first: true,
                Settings,
                timeout: null,
                SettingsWrapper
            };
        },
        props: ['active'],
        components: {
            SidebarView, Sidebar, SidebarItem, ContentColumn,
            SettingsWrapper, SettingsPanel, CssEditorView, PluginsView, ThemesView, UpdaterView,
            MiGithubCircle, MiWeb, MiClose, MiTwitterCircle
        },
        computed: {
            sidebarItems() {
                return this.BdMenuItems.items;
            },
            sidebar() {
                const categories = {};
                for (let item of this.sidebarItems) {
                    if (item.hidden) continue;
                    const category = categories[item.category] || (categories[item.category] = []);
                    category.push(item);
                }
                return categories;
            }
        },
        methods: {
            itemOnClick(id) {
                if (this.animating || id === this.activeIndex) return;
                if (this.activeIndex >= 0) this.sidebarItems.find(item => item.id === this.activeIndex).active = false;
                this.sidebarItems.find(item => item.id === id).active = true;
                this.animating = true;
                this.lastActiveIndex = this.activeIndex;
                this.activeIndex = id;

                if (this.timeout) clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.first = false;
                    this.animating = false;
                    this.lastActiveIndex = -1;
                    this.timeout = null;
                }, 400);
            },
            activeContent(s) {
                const item = this.sidebarItems.find(item => item.contentid === s);
                return item && item.id === this.activeIndex;
            },
            animatingContent(s) {
                const item = this.sidebarItems.find(item => item.contentid === s);
                return item && item.id === this.lastActiveIndex;
            },
            closeContent() {
                if (this.activeIndex >= 0) this.sidebarItems.find(item => item.id === this.activeIndex).active = false;
                this.first = true;
                this.lastActiveIndex = this.activeIndex;
                this.activeIndex = -1;

                if (this.timeout) clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.animating = false;
                    this.lastActiveIndex = -1;
                    this.timeout = null;
                }, 400);
            },
            openGithub() {
                shell.openExternal('https://github.com/JsSucks/BetterDiscordApp');
            },
            openWebsite() {
                shell.openExternal('https://betterdiscord.net');
            },
            openTwitter() {
                shell.openExternal('https://twitter.com/Jiiksi');
            }
        },
        watch: {
            active(active) {
                if (active) return;
                this.closeContent();
            }
        },
        created() {
            Events.on('bd-open-menu', item => item && this.itemOnClick(this.sidebarItems.find(i => i === item || i.id === item || i.contentid === item || i.set === item).id));
        }
    }
</script>
