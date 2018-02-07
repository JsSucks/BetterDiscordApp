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
    <div :class="['bd-modal', {'bd-modal-scrolled': scrolled}]">
        <div class="bd-modal-inner">
            <div class="bd-modal-header">
                <div class="bd-modal-icon">
                    <slot name="icon" />
                </div>
                <span class="bd-modal-headertext">{{headerText}}</span>
                <div class="bd-modal-x" @click="close">
                    <MiClose size="18"/>
                </div>
            </div>
            <div class="bd-modal-body">
                <div class="bd-scroller-wrap">
                    <div class="bd-scroller" @scroll="e => scrolled = e.target.scrollTop !== 0">
                        <slot name="body"></slot>
                     </div>
                </div>
            </div>
            <div class="bd-modal-footer">
                <slot name="footer"></slot>
            </div>
        </div>
    </div>
</template>

<script>
    // Imports
    import { MiClose } from './MaterialIcon';

    export default {
        props: ['headerText', 'close'],
        components: {
            MiClose
        },
        data() {
            return {
                scrolled: false
            };
        },
        beforeMount() {
            window.addEventListener('keyup', this.keyupListener);
        },
        destroyed() {
            window.removeEventListener('keyup', this.keyupListener);
        },
        methods: {
            keyupListener(e) {
                if (e.which === 27) {
                    this.close();
                }
            }
        }
    }
</script>
