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
    <span class="bd-material-design-icon">
        <svg :width="size || 24" :height="size || 24" viewBox="0 0 24 24">
            <path fill-opacity="1" stroke-width="0.2" stroke-linejoin="round" d="M 11.9994,16.998C 13.1044,16.998 13.9994,16.1021 13.9994,14.998C 13.9994,13.894 13.1044,12.998 11.9994,12.998C 10.8954,12.998 9.9994,13.894 9.9994,14.998C 9.9994,16.1021 10.8954,16.998 11.9994,16.998 Z M 17.9994,7.99813C 19.1034,7.99813 19.9994,8.89413 19.9994,9.99813L 19.9994,19.9981C 19.9994,21.1021 19.1034,21.9981 17.9994,21.9981L 5.99938,21.9981C 4.89539,21.9981 3.99938,21.1021 3.99938,19.9981L 3.99938,9.99813C 3.99938,8.89413 4.89539,7.99813 5.99938,7.99813L 6.99938,7.99813L 6.99938,5.99813C 6.99938,3.23714 9.23838,0.998133 11.9994,0.998133C 14.7604,0.998133 16.9994,3.23714 16.9994,5.99813L 16.9994,7.99813L 17.9994,7.99813 Z M 12,3C 10.3431,3 9,4.34315 9,6L 9,8L 15,8L 15,6C 15,4.34315 13.6569,3 12,3 Z " />
        </svg>
    </span>
</template>
<script>
    export default {
        props: ['size']
    }
</script>
