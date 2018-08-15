/**
 * BetterDiscord Setting Switch Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <label class="bd-switchWrapper" @click="$emit('input', !value)">
        <input type="checkbox" class="bd-switchCheckbox" />
        <div class="bd-switch" :class="{'bd-checked': value}" />
    </label>
</template>

<script>
    export default {
        props: ['value']
    }
</script>
