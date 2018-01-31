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
    <div class="bd-settingsWrap">
        <div class="bd-settingsWrap-header">{{headertext}}</div>
        <ScrollerWrap>
            <slot />
        </ScrollerWrap>
    </div>
</template>
<script>
    // Imports
    import { ScrollerWrap } from '../common';

    export default {
        props: ['headertext'],
        components: {
            ScrollerWrap
        }
    }
</script>
