<template>
    <svg xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 12 12">
        <g fill="none" fill-rule="evenodd">
            <path d="M0 0h12v12H0"></path>
            <path class="fill" fill="#dcddde" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
        </g>
    </svg>
</template>
<script>
    export default {
        props: ['size']
    }
</script>
