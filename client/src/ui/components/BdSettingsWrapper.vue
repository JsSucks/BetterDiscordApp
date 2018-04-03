/**
 * BetterDiscord Settings Wrapper Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-settings-wrapper" :class="[{active: active}, 'platform-' + this.platform]">
        <div class="bd-settings-button" :class="{'bd-active': active, 'bd-animating': animating}" @click="active = true">
            <div v-if="updating === 0" v-tooltip.right="'Checking for updates'" class="bd-settings-button-btn bd-loading"></div>
            <div v-else-if="updating === 2" v-tooltip.right="'Updates available!'" class="bd-settings-button-btn bd-updates"></div>
            <div v-else class="bd-settings-button-btn" :class="[{'bd-loading': !loaded}]"></div>
        </div>
        <BdSettings ref="settings" :active="active" @close="active = false" />
    </div>
</template>

<script>
    // Imports
    import { Events, Settings } from 'modules';
    import { Modals } from 'ui';
    import BdSettings from './BdSettings.vue';
    import { ClientIPC } from 'common';

    export default {
        data() {
            return {
                loaded: false,
                updating: false,
                active: false,
                animating: false,
                timeout: null,
                platform: global.process.platform
            };
        },
        components: {
            BdSettings
        },
        methods: {
            keyupListener(e) {
                if (Modals.stack.length || !this.active || e.which !== 27) return;
                if (this.$refs.settings.activeIndex !== -1) this.$refs.settings.closeContent();
                else this.active = false;
                e.stopImmediatePropagation();
            }
        },
        watch: {
            active(active) {
                if (active && !this.loaded)
                    return this.active = false;

                this.animating = true;
                if (this.timeout) clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.animating = false;
                    this.timeout = null;
                }, 400);
            }
        },
        created() {
            Events.on('ready', e => this.loaded = true);
            Events.on('bd-toggle-menu', () => this.active = !this.active);
            Events.on('bd-open-menu', item => this.active = true);
            Events.on('bd-close-menu', () => this.active = false);
            Events.on('update-check-start', e => this.updating = 0);
            Events.on('update-check-end', e => this.updating = 1);
            Events.on('updates-available', e => this.updating = 2);
            window.addEventListener('keyup', this.keyupListener);

            const menuKeybind = Settings.getSetting('core', 'default', 'menu-keybind');
            menuKeybind.on('keybind-activated', () => this.active = !this.active);
        },
        destroyed() {
            window.removeEventListener('keyup', this.keyupListener);
            ClientIPC.off('bd-toggle-menu', this.toggleSettings);
            ClientIPC.off('bd-show-menu', this.showSettings);
            ClientIPC.off('bd-hide-menu', this.hideSettings);
        }
    }
</script>
