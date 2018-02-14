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
        <div class="bd-settings-button" :class="{'bd-active': active}" @click="showSettings">
            <div v-if="updating === 0" v-tooltip.right="'Checking for updates'" class="bd-settings-button-btn bd-loading"></div>
            <div v-else-if="updating === 2" v-tooltip.right="'Updates available!'" class="bd-settings-button-btn bd-updates"></div>
            <div v-else class="bd-settings-button-btn" :class="[{'bd-loading': !loaded}]"></div>
        </div>
        <BdSettings :active="active" :close="hideSettings" />
    </div>
</template>
<script>
    // Imports
    import { Events } from 'modules';
    import BdSettings from './BdSettings.vue';

    export default {
        data() {
            return {
                loaded: false,
                updating: false,
                active: false,
                platform: global.process.platform
            }
        },
        components: {
            BdSettings
        },
        methods: {
            showSettings() {
                if (!this.loaded) return;
                this.active = true;
            },
            hideSettings() { this.active = false },
            toggleSettings() { this.active = !this.active },
            keyupListener(e) {
                if (document.getElementsByClassName('bd-backdrop').length) return;
                if (this.active && e.which === 27) return this.hideSettings();
                if (!e.metaKey && !e.ctrlKey || e.key !== 'b') return;
                this.toggleSettings();
                e.stopImmediatePropagation();
            }
        },
        created() {
            Events.on('ready', e => this.loaded = true);
            Events.on('update-check-start', e => this.updating = 0);
            Events.on('update-check-end', e => this.updating = 1);
            Events.on('updates-available', e => this.updating = 2);
            window.addEventListener('keyup', this.keyupListener);
        },
        destroyed() {
            window.removeEventListener('keyup', this.keyupListener);
        }
    }
</script>
