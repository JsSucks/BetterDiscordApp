/**
 * BetterDiscord Modals Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-modalsContainer">
        <div v-for="(modal, index) in modals.stack" :key="`bd-modal${modal.id}`">
            <div class="bd-backdrop" :class="{'bd-backdropOut': closing}" :style="{opacity: index === 0 ? undefined : 0}"></div>
            <div class="bd-modalWrap" :style="{transform: `scale(${downscale(index + 1, 0.2)})`, opacity: downscale(index + 1, 1)}">
                <div class="bd-modalCloseArea" @click="closeModal(modal)"></div>
                <keep-alive><component :is="modal.component" /></keep-alive>
            </div>
        </div>
    </div>
</template>

<script>
    // Imports
    import { Events } from 'modules';
    import { Modals } from 'ui';
    import { Modal } from './common';
    import { MiError } from './common/MaterialIcon';
    import ErrorModal from './bd/modals/ErrorModal.vue';

    export default {
        components: {
            Modal, MiError
        },
        data() {
            return {
                modals: Modals,
                eventListener: null
            };
        },
        computed: {
            closing() {
                return !this.modals.stack.find(m => !m.closing);
            }
        },
        created() {
            Events.on('bd-refresh-modals', this.eventListener = () => {
                this.$forceUpdate();
            });

            window.addEventListener('keyup', this.keyupListener);
        },
        destroyed() {
            if (this.eventListener) Events.off('bd-refresh-modals', this.eventListener);
            window.removeEventListener('keyup', this.keyupListener);
        },
        methods: {
            closeModal(modal) {
                modal.close();
            },
            downscale(index, times) {
                return 1 - ((this.modals.stack.filter(m => !m.closing).length - index) * times);
            },
            keyupListener(e) {
                if (this.modals.stack.length && e.which === 27)
                    this.modals.closeLast(e.shiftKey);
            }
        }
    }
</script>
