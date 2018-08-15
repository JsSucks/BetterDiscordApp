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
            <path d="M 11.9992,19.1982C 9.4952,19.1982 7.2922,17.9193 6.0012,15.9783C 6.0272,13.9913 10.0052,12.8983 11.9992,12.8983C 13.9932,12.8983 17.9712,13.9913 17.9972,15.9783C 16.7062,17.9193 14.5032,19.1982 11.9992,19.1982 Z M 11.9992,4.99823C 13.6552,4.99823 14.9992,6.34222 14.9992,7.99823C 14.9992,9.65625 13.6552,10.9982 11.9992,10.9982C 10.3432,10.9982 8.9992,9.65625 8.9992,7.99823C 8.9992,6.34222 10.3432,4.99823 11.9992,4.99823 Z M 11.9992,1.99823C 6.4762,1.99823 1.9992,6.47424 1.9992,11.9982C 1.9992,17.5212 6.4762,21.9982 11.9992,21.9982C 17.5222,21.9982 21.9992,17.5212 21.9992,11.9982C 21.9992,6.47424 17.5222,1.99823 11.9992,1.99823 Z"></path>
        </svg>
    </span>
</template>
<script>
    export default {
        props: ['size']
    }
</script>
