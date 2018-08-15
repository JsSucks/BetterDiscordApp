/**
 * BetterDiscord Input Modal Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <Modal :class="['bd-modalBasic', {'bd-modalOut': modal.closing}]" :headerText="modal.title" @close="modal.close">
        <div slot="body" class="bd-modalBasicBody bd-inputModalBody bd-formTextinput">
            {{ modal.text }}
            <input v-if="modal.password" ref="input" type="password" @keyup.stop="keyup" />
            <input v-else ref="input" type="text" @keyup.stop="keyup"/>
        </div>
        <div slot="footer" class="bd-modalControls">
            <div class="bd-flexGrow"></div>
            <div class="bd-button bd-ok" @click="() => { modal.confirm(value); modal.close(); }">OK</div>
        </div>
    </Modal>
</template>

<script>
    // Imports
    import { Modal } from '../../common';

    export default {
        data() {
            return {
                value: ''
            }
        },
        props: ['modal'],
        components: {
            Modal
        },
        methods: {
            keyup(e) {
                if (e.key === 'Enter') {
                    this.modal.confirm(this.value);
                    this.modal.close();
                    return;
                }
                this.value = e.target.value;
            }
        },
        mounted() {
            this.$refs.input.focus();
        }
    }
</script>
