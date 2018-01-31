/**
 * BetterDiscord Form Button Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-form-button bd-button" :class="{'bd-disabled': disabled}" @click="!disabled && !loading ? onClick() : null">
        <div v-if="loading" class="bd-spinner-7"></div>
        <slot v-else />
    </div>
</template>
<script>
    export default {
        props: ['loading', 'disabled', 'type', 'onClick']
    }
</script>
