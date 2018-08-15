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
            <path d="M 11.9994,17.2708L 18.1794,20.9978L 16.5444,13.9688L 21.9994,9.24277L 14.8084,8.62477L 11.9994,1.99777L 9.1904,8.62477L 1.9994,9.24277L 7.4544,13.9688L 5.8194,20.9978L 11.9994,17.2708 Z " />
        </svg>
    </span>
</template>

<script>
    export default {
        props: ['size']
    }
</script>
