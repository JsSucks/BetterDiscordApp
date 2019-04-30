/**
 * BetterDiscord Generic Button Group Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-buttonGroup">
        <Button v-for="(button, index) in buttons" :text="button.text" :classes="button.class" @click="button.onClick" :key="index"/>
    </div>
</template>

<script>
    import Button from './Button.vue';
    export default {
        props: ['buttons'],
        components: { Button }
    }
</script>
