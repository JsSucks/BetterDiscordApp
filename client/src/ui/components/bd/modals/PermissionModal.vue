/**
 * BetterDiscord Permission Modal Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <Modal :class="['bd-modalBasic', {'bd-modalOut': modal.closing}]" :headerText="modal.title" @close="modal.close">
        <div slot="body" class="bd-modalBasicBody">
            <div v-for="(perm, i) in permissions" :key="`perm-${i}`" class="bd-permScope">
                <div class="bd-permAllow">
                    <div class="bd-permCheck">
                        <div class="bd-permCheckInner"></div>
                    </div>
                    <div class="bd-permInner">
                        <div class="bd-permName">{{perm.HEADER}}</div>
                        <div class="bd-permDesc">{{perm.BODY}}</div>
                    </div>
                </div>
            </div>
        </div>
        <div slot="footer" class="bd-modalControls">
            <div class="bd-flexGrow"></div>
            <div class="bd-button" @click="modal.close">Cancel</div>
            <div class="bd-button bd-ok" @click="() => { modal.confirm(); modal.close(); }">Authorize</div>
        </div>
    </Modal>
</template>

<script>
    // Imports
    import { Modal } from '../../common';
    import { Permissions } from 'modules';

    export default {
        props: ['modal'],
        components: {
            Modal
        },
        computed: {
            permissions() {
                return this.modal.perms.map(perm => {
                    const getPerm = Permissions.permissionText(perm);
                    getPerm.BODY = getPerm.BODY.replace(':NAME:', this.modal.name);
                    return getPerm;
                });
            }
        }
    }
</script>
