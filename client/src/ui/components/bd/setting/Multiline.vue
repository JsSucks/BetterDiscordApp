/**
 * BetterDiscord Setting Multiline Text Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-formTextarea">
        <div class="bd-formTextareaDetails">
            <div class="bd-title">
                <h3>{{ setting.text }}</h3>
            </div>
            <div class="bd-hint">{{ setting.hint }}</div>
        </div>
        <textarea class="bd-textarea" ref="textarea" @keyup.stop v-model="setting.value" :disabled="setting.disabled"></textarea>
    </div>
</template>

<script>
    export default {
        props: ['setting'],
        methods: {
            recalculateHeight() {
                const { textarea } = this.$refs;
                textarea.style.height = '1px';
                textarea.style.height = textarea.scrollHeight + 2 + 'px';
            }
        },
        watch: {
            'setting.value'() {
                this.recalculateHeight();
            }
        },
        mounted() {
            this.recalculateHeight();
        }
    }
</script>
