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
                    <div class="bd-remoteCardInfo">Updated: Some time ago</div>
                </div>
            </div>
        </div>
        <div class="bd-flexRow bd-flex bd-flexGrow">
            <div class="bd-flexGrow bd-remoteCardTags">{{item.tags.join(', ')}}</div>
            <div class="bd-buttonGroup">
                <div class="bd-button">Install</div>
                <div class="bd-button">Preview</div>
                <div class="bd-button">Source</div>
            </div>
        </div>
    </div>
</template>

<script>
    import { WebpackModules } from 'modules';
    export default {
        props: ['item'],
        data() {
            return {}
        },
        methods: {
            resolveThumb() {
                window.momentTest = WebpackModules;
                return `${this.item.repository.rawUri}/${this.item.files.previews[0].thumb}`;
            }
        }
    }
</script>
