/**
 * BetterDiscord Basic Modal Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <Modal :class="['bd-modalBasic', {'bd-modal-out': modal.closing}]" :headerText="modal.title" @close="modal.close">
        <div slot="body" class="bd-modalBasicBody">{{ modal.text }}</div>
        <div slot="footer" class="bd-modalControls">
            <div class="bd-flexGrow"></div>
            <div class="bd-button bd-ok" @click="modal.close">OK</div>
        </div>
    </Modal>
</template>

<script>
    // Imports
    import { Modal } from '../../common';

    export default {
        props: ['modal'],
        components: {
            Modal
        }
    }
</script>
