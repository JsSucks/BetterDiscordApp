/**
 * BetterDiscord Card Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-card">
        <div class="bd-cardHeader">
            <div class="bd-cardIcon" :style="{backgroundImage: iconURL}">
                <MiExtension v-if="!item.icon" :size="30" />
            </div>
            <span>{{item.name}}</span>
            <div class="bd-flexSpacer" />
            <slot name="toggle"/>
        </div>
        <div class="bd-cardBody">
            <div class="bd-cardDescription">{{item.description}}</div>
            <div class="bd-cardFooter">
                <div class="bd-cardExtra">
                    v{{item.version}} by
                    <template v-for="(author, i) in item.authors">
                        <ContentAuthor :author="author" :after="i === item.authors.length - 1 ? '' : i === item.authors.length - 2 ? ' and' : ','" />
                    </template>
                </div>
                <div class="bd-controls">
                    <slot name="controls" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    // Imports
    import { FileUtils, ClientLogger as Logger } from 'common';
    import path from 'path';
    import { MiExtension } from '../common';
    import ContentAuthor from './ContentAuthor.vue';

    export default {
        props: ['item'],
        data() {
            return {
                iconURL: undefined,
                updatingIcon: false
            };
        },
        components: {
            ContentAuthor,
            MiExtension
        },
        methods: {
            async getIconURL() {
                if (!this.item.icon) return;

                try {
                    if (this.item.icon.substr(0, 5) === 'data:') {
                        return `url(${this.item.icon})`;
                    }

                    const iconPath = path.join(this.item.contentPath, this.item.icon);
                    const iconURL = await FileUtils.toDataURI(iconPath, this.item.info.icon_type);
                    return `url(${iconURL})`;
                } catch (err) {
                    Logger.err('ContentCard', ['Invalid icon URL', this.item]);
                }
            },
            async refreshIcon() {
                if (this.updatingIcon) return;
                this.updatingIcon = true;
                this.iconURL = await this.getIconURL();
                this.updatingIcon = false;
            }
        },
        watch: {
            'item.contentPath'() {
                this.refreshIcon();
            },
            'item.icon'() {
                this.refreshIcon();
            },
            'item.info.icon_type'() {
                this.refreshIcon();
            }
        },
        created() {
            this.refreshIcon();
        }
    }
</script>
