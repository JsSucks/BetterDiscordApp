<template>
    <Modal :headertext="modal.event.header" :closing="modal.closing" @close="modal.close"
           :class="{'bd-err': modal.event.type && modal.event.type === 'err'}">
        <MiError v-if="modal.event.type === 'err'" slot="icon" size="20"/>
        <div slot="body">
            <p v-if="modal.event.message">{{ modal.event.message }}</p>

            <div v-for="(content, index) in modal.event.content">
                <div class="bd-modalError" :class="{'bd-open': content.showStack}">
                    <div class="bd-modalErrorTitle bd-flex">
                        <span class="bd-modalTitleText bd-flexGrow">{{content.message}}</span>
                        <span class="bd-modalTitlelink" v-if="content.showStack" @click="content.showStack = false; $forceUpdate();">Hide Stacktrace</span>
                        <span class="bd-modalTitlelink" v-else @click="content.showStack = true; $forceUpdate();">Show Stacktrace</span>
                    </div>
                    <div class="bd-scrollerWrap">
                        <div class="bd-scroller">
                            <div class="bd-modalErrorBody"><span>{{content.err.message}}</span>
                            {{content.stackTrace}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div slot="footer" class="bd-modalControls">
            <span class="bd-modalTip">Press {{ platformInspectorKey }} for more details</span>
            <div class="bd-button bd-ok" @click="modal.close">OK</div>
        </div>
    </Modal>
</template>

<script>
    // Imports
    import process from 'process';
    import { Modal } from '../../common';
    import { MiError } from '../../common/MaterialIcon';

    export default {
        props: ['modal'],
        components: {
            Modal, MiError
        },
        computed: {
            platformInspectorKey() {
                return process.platform === 'darwin' ? 'Cmd+Option+I' : 'Ctrl+Shift+I';
            }
        }
    }
</script>
