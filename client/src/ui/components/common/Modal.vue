/**
 * BetterDiscord Modal Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div :class="['bd-modal', {'bd-modalScrolled': scrolled}]">
        <div class="bd-modalInner">
            <div class="bd-modalHeader">
                <div class="bd-modalIcon">
                    <slot name="icon" />
                </div>
                <span class="bd-modalHeadertext">{{ headerText }}</span>
                <div class="bd-modalX" @click="$emit('close', $event.shiftKey, $event)">
                    <MiClose size="18" />
                </div>
            </div>
            <div class="bd-modalBody">
                <div class="bd-scrollerWrap">
                    <div class="bd-scroller" @scroll="e => scrolled = e.target.scrollTop !== 0">
                        <slot name="body"></slot>
                     </div>
                </div>
            </div>
            <div class="bd-modalFooter">
                <slot name="footer"></slot>
            </div>
        </div>
    </div>
</template>

<script>
    // Imports
    import { MiClose } from './MaterialIcon';

    export default {
        props: ['headerText'],
        components: {
            MiClose
        },
        data() {
            return {
                scrolled: false
            };
        }
    }
</script>
