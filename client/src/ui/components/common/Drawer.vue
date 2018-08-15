/**
 * BetterDiscord Drawer Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div :class="['bd-drawer', {'bd-drawerOpen': open, 'bd-animating': animating}]">
        <div class="bd-formHeader bd-drawerHeader" @click="() => open = !open">
            <span class="bd-formHeaderText">{{ label }}</span>
            <span class="bd-formHeaderButton bd-drawerOpenButton">
                <span class="bd-chevron1"><MiChevronDown /></span>
                <span class="bd-chevron2"><MiChevronDown /></span>
            </span>
        </div>
        <div class="bd-drawerContentsWrap">
            <div class="bd-drawerContents" ref="contents">
                <slot v-if="open || animating" />
            </div>
        </div>
    </div>
</template>

<script>
    import { MiChevronDown } from './MaterialIcon';

    export default {
        props: [
            'label'
        ],
        components: {
            MiChevronDown
        },
        data() {
            return {
                open: false,
                animating: false,
                timeout: null
            }
        },
        watch: {
            async open(open) {
                this.animating = true;
                const contents = this.$refs.contents;
                contents.style.marginTop = 0 - contents.offsetHeight + 'px';
                if (this.timeout) clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    contents.style.marginTop = null;
                    this.animating = false;
                }, 200);
            }
        }
    }
</script>
