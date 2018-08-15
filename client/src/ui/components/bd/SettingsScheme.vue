/**
 * BetterDiscord Settings Scheme Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-settingsScheme" :class="{'bd-active': isActive}" @click="$emit('apply')">
        <div class="bd-settingsSchemeIcon" :style="{'background-image': iconURL}"></div>
        <div class="bd-settingsSchemeName" v-if="scheme.name">{{ scheme.name }}</div>
        <div class="bd-settingsSchemeHint" v-if="scheme.hint">{{ scheme.hint }}</div>
    </div>
</template>

<script>
    import { FileUtils, ClientLogger as Logger } from 'common';
    import path from 'path';

    export default {
        props: ['scheme', 'is-active'],
        data() {
            return {
                iconURL: undefined,
                updatingIcon: false
            };
        },
        methods: {
            async getIconURLFromPath() {
                if (!this.scheme.icon_path) return;

                try {
                    const iconPath = path.join(this.scheme.path, this.scheme.icon_path);
                    const iconURL = await FileUtils.toDataURI(iconPath, this.scheme.icon_type);
                    return `url(${iconURL})`;
                } catch (err) {
                    Logger.err('SettingsScheme', ['Invalid icon URL', this.scheme, err]);
                }
            },
            async refreshIcon() {
                if (this.updatingIcon) return;
                this.updatingIcon = true;
                this.iconURL = this.scheme.icon_url || await this.getIconURLFromPath();
                this.updatingIcon = false;
            }
        },
        watch: {
            'scheme.path'() {
                this.refreshIcon();
            },
            'scheme.icon_path'() {
                this.refreshIcon();
            },
            'scheme.icon_type'() {
                this.refreshIcon();
            }
        },
        created() {
            this.refreshIcon();
        }
    }
</script>
