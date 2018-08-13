/**
 * BetterDiscord Image Plus Icon
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
    <span class="bd-material-design-icon">
        <svg :width="size || 24" :height="size || 24" viewBox="0 0 24 24">
            <path d="M 5,3C 3.89543,3 3,3.8954 3,5L 3,19C 3,20.1046 3.89543,21 5,21L 14.0859,21C 14.0294,20.6696 14.0007,20.3351 14,20C 14.0027,19.3182 14.1216,18.6418 14.3516,18L 5,18L 8.5,13.5L 11,16.5L 14.5,12L 16.7285,14.9727C 17.7019,14.3386 18.8383,14.0007 20,14C 20.3353,14.002 20.6698,14.032 21,14.0898L 21,5C 21,3.89 20.1,3 19,3L 5,3 Z M 19,16L 19,19L 16,19L 16,21L 19,21L 19,24L 21,24L 21,21L 24,21L 24,19L 21,19L 21,16L 19,16 Z " />
        </svg>
    </span>
</template>
<script>
    export default {
        props: ['size']
    }
</script>
