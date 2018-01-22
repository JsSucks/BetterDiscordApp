import Vue from 'vue';
import Editor from './Editor.vue';
import VueCodemirror from 'vue-codemirror'

Vue.use(VueCodemirror, {});

window.cmCommands = VueCodemirror.CodeMirror.commands;

new Vue({
    el: '#root',
    template: '<Editor/>',
    components: { Editor }
});