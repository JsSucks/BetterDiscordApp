/**
 * BetterDiscord Refresh Button
 * Copyright (c) 2018 Lilian Tedone http://beard-design.com/
 * All rights reserved.
*/

<template>
    <div class="bd-refreshButton" :class="{'bd-refreshed': state === 'refreshed', 'bd-refreshing': state === 'refreshing'}" @click="$emit('click')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g class="bd-svgRefresh">
                <g class="bd-svgCircle">
                    <path d="M0,0H24V24H0Z" style="fill:none" />
                    <path d="M16.948,7.048A7,7,0,1,1,12,5a6.978,6.978,0,0,1,4.948,2.048" style="fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:2px" />
                </g>
                <g class="bd-svgArrow">
                    <path d="M0,0H24V24H0Z" style="fill:none" />
                    <polygon class="bd-svgArrowTriangle" style="fill:#fff" points="13 11 20 4 20 11 13 11" />
                </g>
            </g>
            <g class="bd-svgCancel">
                <line class="bd-svgCancelLine" x1="12" y1="3.098" x2="12" y2="20.902" style="fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:2px" />
                <line class="bd-svgCancelLine" x1="20.902" y1="12" x2="3.098" y2="12" style="fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:2px" />
            </g>
        </svg>
    </div>
</template>

<script>
    export default {
        props: ['state']
    }
</script>
