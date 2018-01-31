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
    <div class="bd-sidebar-view" :class="{active: contentVisible, animating: animating}">
        <div class="bd-sidebar-region">
            <div class="bd-settingsWrap">
                <ScrollerWrap dark="true">
                    <slot name="sidebar" />
                </ScrollerWrap>
            </div>
        </div>
        <div class="bd-content-region">
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
