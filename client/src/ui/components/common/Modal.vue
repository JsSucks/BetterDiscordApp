/**
 * BetterDiscord ¨Modal Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-modal">
        <div class="bd-modal-inner">
            <div class="bd-modal-header">
                <span>{{headerText}}</span>
                <div class="bd-modal-x" @click="close">
                    <SvgX size="18"/>
                </div>
            </div>
            <div class="bd-modal-body">
                <slot name="body"></slot>
            </div>
            <div class="bd-modal-footer">
                <slot name="footer"></slot>
            </div>
        </div>
    </div>
</template>

<script>
    // Imports
    import SvgX from './SvgX.vue';

    export default {
        props: ['headerText', 'close'],
        components: {
            SvgX
        }
    }
</script>
