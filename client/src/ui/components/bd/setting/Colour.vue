/**
 * BetterDiscord Colour Setting Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-formColourpicker">
        <div class="bd-title">
            <h3 v-if="setting.text">{{setting.text}}</h3>
            <div class="bd-colourpickerWrapper">
                <button ref="swatch" class="bd-colourpickerSwatch" :style="{backgroundColor: rgbaString}" @click="open = !open" />
            </div>
        </div>
        <Picker ref="picker" v-model="colours" @input="pick" :class="{'bd-hide': !open}" :style="{top: topOffset}" />
        <div class="bd-hint">{{setting.hint}}</div>
    </div>
</template>

<script>
    import { Chrome as Picker } from 'vue-color';

    export default {
        data() {
            return {
                open: false,
                colours: '#fff',
                topOffset: '35px'
            }
        },
        components: {
            Picker
        },
        props: ['setting'],
        computed: {
            hex() {
                if (!this.$refs.picker || !this.$refs.picker.val) return this.colours;
                return this.$refs.picker.val.hex;
            },
            rgba() {
                if (!this.$refs.picker || !this.$refs.picker.val) return this.colours;
                return this.$refs.picker.val.rgba;
            },
            hsva() {
                if (!this.$refs.picker || !this.$refs.picker.val) return this.colours;
                return this.$refs.picker.val.hsv;
            },
            hsla() {
                if (!this.$refs.picker || !this.$refs.picker.val) return this.colours;
                return this.$refs.picker.val.hsl;
            },
            rgbaString() {
                if (typeof this.colours === 'string') return this.colours;
                const { r, g, b, a } = this.colours.rgba;
                return `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        },
        methods: {
            pick(c) {
                this.setting.value = this.rgbaString;
            },
            closePopup(e) {
                if (!this.$refs.swatch.contains(e.target) && !this.$refs.picker.$el.contains(e.target))
                    this.open = false;
            }
        },
        beforeMount() {
            this.colours = this.setting.value;
            window.addEventListener('click', this.closePopup);
        },
        destroyed() {
            window.removeEventListener('click', this.closePopup);
        },
        watch: {
            setting(newVal, oldVal) {
                if (newVal.value === oldVal.value) return;
                this.colours = newVal.value;
                this.open = false;
            },
            open(open) {
                if (!open) return;
                const offset = window.innerHeight - this.$el.getBoundingClientRect().top - 340;
                if (offset >= 0) {
                    this.topOffset = '35px';
                } else {
                    this.topOffset = 35 + offset > 35 ? '35px' : `${35 + offset}px`;
                }
            }
        }
    }
</script>
