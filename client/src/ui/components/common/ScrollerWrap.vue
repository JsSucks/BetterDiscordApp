/**
 * BetterDiscord Scroller Wrap  Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-scrollerWrap" :class="{'bd-dark': dark}">
        <div class="bd-scroller" @scroll="onscroll">
            <slot/>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['dark'],
        methods: {
            onscroll(e) {
                const { offsetHeight, scrollTop, scrollHeight } = e.target;
                if (offsetHeight + scrollTop >= scrollHeight) this.$emit('scrollend', e);
            }
        }
    }
</script>
