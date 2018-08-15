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
            <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path>
        </svg>
    </span>
</template>
<script>
    export default {
        props: ['size']
    }
</script>
