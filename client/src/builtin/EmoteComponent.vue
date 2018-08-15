<template>
    <span class="bd-emotewrapper" :class="{'bd-emoteFavourite': favourite, 'bd-emoteNoWrapper': !hasWrapper}" v-tooltip="name" :data-emote-name="name">
        <img class="bd-emote" :src="src" :alt="`;${name};`" />

        <div class="bd-emoteFavouriteButton" :class="{'bd-active': favourite}" @click="toggleFavourite">
            <MiStar :size="16" />
        </div>
    </span>
</template>

<script>
    import { ClientLogger as Logger } from 'common';
    import EmoteModule from './EmoteModule';
    import { MiStar } from '../ui/components/common';

    export default {
        components: {
            MiStar
        },
        props: ['src', 'name', 'hasWrapper'],
        data() {
            return {
                EmoteModule
            };
        },
        computed: {
            favourite() {
                return EmoteModule.isFavourite(this.name);
            }
        },
        methods: {
            async toggleFavourite() {
                await EmoteModule.setFavourite(this.name, !this.favourite);
                Logger.log('EmoteComponent', `Set emote ${this.name} as ${this.favourite ? '' : 'un'}favourite`);
            }
        }
    }
</script>
