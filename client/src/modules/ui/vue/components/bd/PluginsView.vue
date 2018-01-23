<template src="./templates/PluginsView.html"></template>
<script>
    const { PluginManager } = require('../../../../'); //#1 require of 2018~ :3

    /*Imports*/
    import { SettingsWrapper } from './';
    import PluginCard from './PluginCard.vue';
    import Refresh from 'vue-material-design-icons/Refresh.vue';
    const components = { SettingsWrapper, PluginCard, Refresh };

    /*Variables*/

     /*Methods*/
    async function refreshLocalPlugins() {
        try {
            await PluginManager.refreshPlugins();
        } catch (err) {
            
        }
        this.localPlugins = PluginManager.plugins;
    }

    function showLocal() {
        this.local = true;
    }

    function showOnline() {
        this.local = false;
    }

    const methods = { showLocal, showOnline, refreshLocalPlugins };

    export default {
        components,
        data() {
            return {
                localPlugins: [],
                local: true
            }
        },
        methods,
        created: function () {
            this.refreshLocalPlugins();
        }
    }
</script>

<style>
    .bd-spinner-container {
        display: flex;
        flex-grow: 1;
        align-items: center;
        align-content: center;
        justify-content: center;
    }

    .bd-spinner-container .bd-spinner-2 {
        width: 200px;
        height: 200px;
     }

    .bd-pluginsView .bd-button {
        display: flex;
        position: relative;
    }

    .bd-pluginsView .bd-button h3 {
        flex-grow: 1;
    } 
    
    .bd-pluginsView .bd-button .material-design-icon {
        display: flex;
        align-items: center;
        fill: #FFF;
    }

    .bd-material-button {
        border-radius: 3px;
        display: flex;
        align-items: center;
        align-content: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        position: absolute;
        right: 10px;
    }

    .bd-pluginsView .bd-button {
        border-bottom: 2px solid #2b2d31;
        align-items: center;
    }

    .bd-material-button > span {
        display: flex;
    }

    .bd-material-button:hover {
        background: #29569a;
    }
</style>