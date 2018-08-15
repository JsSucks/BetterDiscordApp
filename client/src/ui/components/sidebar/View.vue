/**
 * BetterDiscord Sidebar View Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-sidebarView" :class="{'bd-active': contentVisible, animating: animating}">
        <div class="bd-sidebarRegion bd-flexCol">
            <div class="bd-settingswrap">
                <ScrollerWrap dark="true">
                    <slot name="sidebar" />
                </ScrollerWrap>
            </div>
            <slot name="sidebarfooter"/>
        </div>
        <div class="bd-contentRegion">
            <slot name="content" />
        </div>
    </div>
</template>

<script>
    // Imports
    import { ScrollerWrap } from '../common';

    export default {
        props: ['contentVisible', 'animating'],
        components: {
            ScrollerWrap
        }
    }
</script>
