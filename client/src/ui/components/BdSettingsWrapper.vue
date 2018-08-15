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
    <div class="bd-settingsWrapper" :class="[{'bd-active': active}, 'platform-' + this.platform]">
        <div class="bd-settingsButton" :class="{'bd-active': active, 'bd-animating': animating, 'bd-hideButton': hideButton}" @click="active = true">
            <div v-if="updating === 0" v-tooltip.right="'Checking for updates'" class="bd-settingsButtonBtn bd-loading"></div>
            <div v-else-if="updating === 2" v-tooltip.right="'Updates available!'" class="bd-settingsButtonBtn bd-updates"></div>
            <div v-else class="bd-settingsButtonBtn" :class="[{'bd-loading': !loaded}]"></div>
        </div>
        <BdSettings ref="settings" :active="active" @close="active = false" />
    </div>
</template>

<script>
    // Imports
    import { Events, Settings } from 'modules';
    import { Modals } from 'ui';
    import process from 'process';
    import BdSettings from './BdSettings.vue';

    export default {
        data() {
            return {
                loaded: false,
                updating: false,
                active: false,
                animating: false,
                timeout: null,
                platform: process.platform,
                eventHandlers: {},
                keybindHandler: null,
                hideButton: false,
                hideButtonToggleHandler: null
            };
        },
        components: {
            BdSettings
        },
        methods: {
            keyupListener(e) {
                if (Modals.stack.length || !this.active || e.which !== 27) return;
                if (this.$refs.settings.item) this.$refs.settings.closeContent();
                else this.active = false;
                e.stopImmediatePropagation();
            },
            prevent(e) {
                if (this.active && e.which === 27)
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
            Events.on('ready', this.eventHandlers.ready = e => this.loaded = true);
            Events.on('bd-open-menu', this.eventHandlers['bd-open-menu'] = item => this.active = true);
            Events.on('bd-close-menu', this.eventHandlers['bd-close-menu'] = () => this.active = false);
            Events.on('update-check-start', this.eventHandlers['update-check-start'] = e => this.updating = 0);
            Events.on('update-check-end', this.eventHandlers['update-check-end'] = e => this.updating = 1);
            Events.on('updates-available', this.eventHandlers['updates-available'] = e => this.updating = 2);

            window.addEventListener('keyup', this.keyupListener);
            window.addEventListener('keydown', this.prevent, true);

            const menuKeybind = Settings.getSetting('core', 'default', 'menu-keybind');
            menuKeybind.on('keybind-activated', this.keybindHandler = () => this.active = !this.active);

            const hideButtonSetting = Settings.getSetting('ui', 'default', 'hide-button');
            hideButtonSetting.on('setting-updated', this.hideButtonToggleHandler = event => this.hideButton = event.value);
            this.hideButton = hideButtonSetting.value;
        },
        destroyed() {
            for (let event in this.eventHandlers) Events.off(event, this.eventHandlers[event]);

            window.removeEventListener('keyup', this.keyupListener);
            window.removeEventListener('keydown', this.prevent);

            if (this.keybindHandler) {
                const menuKeybind = Settings.getSetting('core', 'default', 'menu-keybind');
                menuKeybind.removeListener('keybind-activated', this.keybindHandler);
            }

            if (this.hideButtonToggleHandler) {
                const hideButtonSetting = Settings.getSetting('ui', 'default', 'hide-button');
                hideButtonSetting.removeListener('setting-updated', this.hideButtonToggleHandler);
            }
        }
    }
</script>
