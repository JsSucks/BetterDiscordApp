/**
 * BetterDiscord Setting Number Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-formNumberinput">
        <div class="bd-title">
            <h3 v-if="setting.text">{{setting.text}}</h3>
            <div class="bd-number">
                <input type="number" :value="setting.value / setting.multi" :min="setting.min" :max="setting.max" :step="setting.step" @keyup.stop @input="input" />
                <div class="bd-numberSpinner bd-flex bd-flexCol">
                    <div class="bd-arrow" @click="changeBy(1)"><div class="bd-upArrow"></div></div>
                    <div class="bd-arrow" @click="changeBy(-1)"><div class="bd-downArrow"></div></div>
                </div>
            </div>
        </div>
        <div class="bd-hint">{{setting.hint}}</div>
    </div>
</template>

<script>
    export default {
        props: ['setting'],
        methods: {
            input(e) {
                let number = parseFloat(e.target.value)
                if (Number.isNaN(number)) return;

                this.setting.value = number * this.setting.multi;
            },
            changeBy(change) {
                let step = this.setting.step === undefined ? 1 : this.settings.step;
                this.setting.value = (this.setting.value + (change * step)) * this.setting.multi;
            },
            handleWheel() {} // No idea why this works but it does
        },
        beforeMount() {
            window.addEventListener('wheel', this.handleWheel);
        },
        destroyed() {
            window.removeEventListener('wheel', this.handleWheel);
        }
    }
</script>
