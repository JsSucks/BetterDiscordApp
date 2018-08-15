/**
 * BetterDiscord Material Design Icon
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Material Design Icons
 * Copyright (c) 2014 Google
 * Apache 2.0 LICENSE
 * https://www.apache.org/licenses/LICENSE-2.0.txt
*/

<template>
    <span class="bd-materialDesignIcon">
        <svg :width="size || 24" :height="size || 24" viewBox="0 0 24 24">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path>
        </svg>
    </span>
</template>
<script>
    export default {
        props: ['size']
    }
</script>
