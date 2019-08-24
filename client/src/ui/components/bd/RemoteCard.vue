/**
 * BetterDiscord Remote Card Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-remoteCard">
        <div class="bd-flexRow bd-flex">
            <div class="bd-remoteCardTitle bd-flexGrow">{{item.name}} v{{item.version}} by {{item.author}}</div>
            <div class="bd-remoteCardLikes">{{item.rating}}</div>
        </div>
        <div class="bd-flexRow bd-flex" :style="{marginTop: '10px'}">
            <div class="bd-remoteCardThumb" :style="{backgroundImage: `url(${resolveThumb()})`}"></div>
            <div class="bd-remoteCardInfoContainer bd-flex bd-flexCol bd-flexGrow">
                <div class="bd-remoteCardInfoBox bd-flex bd-flexGrow bd-flexCol">
                    <div class="bd-remoteCardInfo">{{item.installs}} Installs</div>
                    <div class="bd-remoteCardInfo">{{item.activeUsers}} Active Users</div>
                    <div class="bd-remoteCardInfo">Updated {{fromNow()}}</div>
                </div>
            </div>
        </div>
        <div class="bd-flexRow bd-flex bd-flexGrow">
            <div class="bd-flexGrow bd-remoteCardTags">
                <div v-for="(tag, index) in item.tags" class="bd-remoteCardTag">
                    <div @click="$emit('tagclicked', tag)">{{tag}}</div><span v-if="index + 1 < item.tags.length">, </span>
                </div>
            </div>
            <div class="bd-buttonGroup">
                <div class="bd-button" @click="install">Install</div>
                <div class="bd-button">Preview</div>
                <div class="bd-button" @click="openSourceUrl">Source</div>
            </div>
        </div>
    </div>
</template>

<script>
    import { Reflection, PackageInstaller } from 'modules';
    import { shell } from 'electron';

    export default {
        props: ['item'],
        data() {
            return {}
        },
        methods: {
            resolveThumb() {
                // TODO
                return '';
                // return `${this.item.repository.rawUri}/${this.item.files.previews[0].thumb}`;
            },
            fromNow() {
                const { Moment } = Reflection.modules;
                return Moment(this.item.updated).fromNow();
            },
            openSourceUrl() {
                if (!this.item.repository || !this.item.repository.baseUri) return;
                if (Object.assign(document.createElement('a'), { href: this.item.repository.baseUri }).hostname !== 'github.com') return;
                shell.openExternal(this.item.repository.baseUri);
            },
            async install() {
                await PackageInstaller.installRemotePackage(this.item.repository.assetUri);
            }
        }
    }
</script>
