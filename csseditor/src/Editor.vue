<template>
    <div class="container">
        <div class="titlebar">
            <div class="draggable"></div>
            <div class="icon">
                <div class="inner"></div>
            </div>
            <div class="title">CSS Editor</div>
            <div class="flex-spacer"></div>
            <div class="controls">
                <button :class="{active: alwaysOnTop}"ref="aot" title="Toggle always on top" @click="toggleaot">P</button>
                <button title="Close CSS Editor" @click="close">X</button>
            </div>
        </div>
        <div id="spinner" v-if="loading">
            <div class="valign">Loading Please Wait...</div>
        </div>
        <div id="editor" class="editor">
            <codemirror 
                ref="mycm" 
                :options="cmOptions"
                @input="cmOnChange"
             />
        </div>
        <div class="tools">
            <div class="flex-row">
                <button @click="save">Save</button>
                <button @click="update">Update</button>
                <div class="flex-spacer"></div>
                <div id="chkboxLiveUpdate">
                    <input type="checkbox" @click="toggleLiveUpdate" :checked="liveUpdate"><span>Live Update</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import '../../node_modules/codemirror/addon/scroll/simplescrollbars.js';
    import '../../node_modules/codemirror/mode/css/css.js';
    import '../../node_modules/codemirror/addon/hint/css-hint.js';
    import '../../node_modules/codemirror/addon/search/search.js';
    import '../../node_modules/codemirror/addon/search/searchcursor.js';
    import '../../node_modules/codemirror/addon/search/jump-to-line.js';
    import '../../node_modules/codemirror/addon/dialog/dialog.js';
    import '../../node_modules/codemirror/addon/hint/show-hint.js';

    const { remote } = window.require('electron');
    const { BDIpc } = require('./bdipc');
    function sendToDiscord(channel, message) {
        BDIpc.send('bd-sendToDiscord', { channel, message });
    }

    const ExcludedIntelliSenseTriggerKeys = {
        '8': 'backspace',
        '9': 'tab',
        '13': 'enter',
        '16': 'shift',
        '17': 'ctrl',
        '18': 'alt',
        '19': 'pause',
        '20': 'capslock',
        '27': 'escape',
        '33': 'pageup',
        '34': 'pagedown',
        '35': 'end',
        '36': 'home',
        '37': 'left',
        '38': 'up',
        '39': 'right',
        '40': 'down',
        '45': 'insert',
        '46': 'delete',
        '91': 'left window key',
        '92': 'right window key',
        '93': 'select',
        '107': 'add',
        '109': 'subtract',
        '110': 'decimal point',
        '111': 'divide',
        '112': 'f1',
        '113': 'f2',
        '114': 'f3',
        '115': 'f4',
        '116': 'f5',
        '117': 'f6',
        '118': 'f7',
        '119': 'f8',
        '120': 'f9',
        '121': 'f10',
        '122': 'f11',
        '123': 'f12',
        '144': 'numlock',
        '145': 'scrolllock',
        '186': 'semicolon',
        '187': 'equalsign',
        '188': 'comma',
        '189': 'dash',
        '190': 'period',
        '191': 'slash',
        '192': 'graveaccent',
        '220': 'backslash',
        '222': 'quote'
    };

    /*Methods*/
    function save() {
        const css = this.codemirror.getValue();
        sendToDiscord('save-css', css);
    }

    function update() {
        const css = this.codemirror.getValue();
        sendToDiscord('update-css', css);
    }

    function toggleaot() {
        this.alwaysOnTop = !this.alwaysOnTop;
        remote.getCurrentWindow().setAlwaysOnTop(this.alwaysOnTop);
    }

    function close() {
        window.close();
    }

    function setCss(css) {
        this.loading = false;
        this.codemirror.setValue(css || '');
    }

    function cmOnChange(value) {
        if(this.liveUpdate) sendToDiscord('update-css', value);
    }

    function cmOnKeyUp(editor, event) {
        if (event.ctrlKey) return;
        if (ExcludedIntelliSenseTriggerKeys[event.keyCode]) return;
        cmCommands.autocomplete(editor, null, { completeSingle: false });
    }

    function toggleLiveUpdate(e) {
        this.liveUpdate = !this.liveUpdate;
    }

    const methods = { save, update, toggleaot, close, setCss, cmOnChange, cmOnKeyUp, toggleLiveUpdate };

    export default {
        methods,
        data() {
            return {
                loading: true,
                codeMirror: null,
                alwaysOnTop: false,
                liveUpdate: false,
                cmOptions: {
                    indentUnit: 4,
                    tabSize: 4,
                    mode: 'css',
                    lineNumbers: true,
                    theme: 'material',
                    scrollbarStyle: 'overlay',
                    extraKeys: {
                        'Ctrl-Space': 'autocomplete'
                    },
                    dialog: {
                        'position': 'bottom'
                    }
                }
            }
        },
        computed: {
            codemirror() {
                return this.$refs.mycm.codemirror;
            },
            CodeMirror() {
                return this.$refs.mycm;
            }
        },
        mounted: function () {
            this.codemirror.on('keyup', this.cmOnKeyUp);
            BDIpc.on('set-css', (_, data) => {
                if (data.error) {
                    console.log(data.error);
                    return;
                }
                console.log(data);
                this.setCss(data.css);
            });

            BDIpc.send('get-css');
        }
    }
</script>

<style lang="scss">
    @import '../../node_modules/codemirror/lib/codemirror.css';
    @import '../../node_modules/codemirror/theme/material.css';
    @import '../../node_modules/codemirror/addon/scroll/simplescrollbars.css';
    @import '../../node_modules/codemirror/addon/dialog/dialog.css';
    @import '../../node_modules/codemirror/addon/hint/show-hint.css';
    
    html, body {
        margin: 0;
        padding: 0;
        max-height: 100%;
        height: 100%;
        background: #2c383e;
        min-width: 700px;
        min-height: 400px;
    }

    * {
        outline: none;
    }

    .flex-spacer {
        flex-grow: 1;
    }

    .flex-row {
        display: flex;
        flex-direction: row;
    }

    .valign {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .container {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        height: 100%;
    }

    .titlebar {
        display: flex;
        height: 25px;
        padding: 4px 5px;
        background: #292b2f;
        border-bottom: 1px solid hsla(218,5%,47%,.3);
        user-select: none;
        cursor: default;
    }

        .titlebar .icon {
            width: 31px;
            height: 25px;
        }

            .titlebar .icon .inner {
                width: 25px;
                height: 25px;
                background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FscXVlXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjAwMCAyMDAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyMDAwIDIwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxnPjxwYXRoIGZpbGw9IiMzRTgyRTUiIGQ9Ik0xNDAyLjIsNjMxLjdjLTkuNy0zNTMuNC0yODYuMi00OTYtNjQyLjYtNDk2SDY4LjR2NzE0LjFsNDQyLDM5OFY0OTAuN2gyNTdjMjc0LjUsMCwyNzQuNSwzNDQuOSwwLDM0NC45SDU5Ny42djMyOS41aDE2OS44YzI3NC41LDAsMjc0LjUsMzQ0LjgsMCwzNDQuOGgtNjk5djM1NC45aDY5MS4yYzM1Ni4zLDAsNjMyLjgtMTQyLjYsNjQyLjYtNDk2YzAtMTYyLjYtNDQuNS0yODQuMS0xMjIuOS0zNjguNkMxMzU3LjcsOTE1LjgsMTQwMi4yLDc5NC4zLDE0MDIuMiw2MzEuN3oiLz48cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMTI2Mi41LDEzNS4yTDEyNjIuNSwxMzUuMmwtNzYuOCwwYzI2LjYsMTMuMyw1MS43LDI4LjEsNzUsNDQuM2M3MC43LDQ5LjEsMTI2LjEsMTExLjUsMTY0LjYsMTg1LjNjMzkuOSw3Ni42LDYxLjUsMTY1LjYsNjQuMywyNjQuNmwwLDEuMnYxLjJjMCwxNDEuMSwwLDU5Ni4xLDAsNzM3LjF2MS4ybDAsMS4yYy0yLjcsOTktMjQuMywxODgtNjQuMywyNjQuNmMtMzguNSw3My44LTkzLjgsMTM2LjItMTY0LjYsMTg1LjNjLTIyLjYsMTUuNy00Ni45LDMwLjEtNzIuNiw0My4xaDcyLjVjMzQ2LjIsMS45LDY3MS0xNzEuMiw2NzEtNTY3LjlWNzE2LjdDMTkzMy41LDMxMi4yLDE2MDguNywxMzUuMiwxMjYyLjUsMTM1LjJ6Ii8+PC9nPjwvc3ZnPg==);
                background-size: 22px 22px;
                background-repeat: no-repeat;
                background-position: center;
            }

        .titlebar .title {
            color: #bac9d2;
            font-family: Whitney,Helvetica Neue,Helvetica,Arial,sans-serif;
            line-height: 25px;
            font-size: 15px;
        }

        .titlebar .controls {
            margin: 0 0 0 2px;
            font-size: 0;
        }

            .titlebar .controls button {
                -webkit-app-region: no-drag;
                border-radius: 3px;
                width: 25px;
                font-size: 12px;
                font-weight: 600;
                /*background: #263238;*/
                background: #36393f;
                color: #bac9d2;
                font-family: Whitney,Helvetica Neue,Helvetica,Arial,sans-serif;
                transition: background-color .2s ease;
                cursor: default;
                border: 0;
                height: 25px;
                z-index: 900062;
                padding: 0;
                margin: 0 0 0 4px;
            }

                .titlebar .controls button:hover {
                    background: #44474e;
                    color: #FFF;
                }

                .titlebar .controls button.active {
                    background: #3a71c1;
                }

        .titlebar .draggable {
            top: 0;
            left: 0;
            right: 63px;
            position: absolute;
            height: 33px;
            -webkit-app-region: drag;
        }

    #spinner {
        background: rgba(51, 48, 48, 0.41);
        position: absolute;
        top: 34px;
        left: 0;
        right: 0;
        bottom: 0;
        color: #bac9d2;
        font-family: Whitney,Helvetica Neue,Helvetica,Arial,sans-serif;
        font-weight: 600;
        font-size: 2em;
        z-index: 90000;
        user-select: none;
    }

    .editor {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow: hidden;
    }
        .editor .vue-codemirror {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            overflow: hidden;
        }
    .editor .vue-codemirror,
        .editor .vue-codemirror .CodeMirror {
            flex-grow: 1;
        }

    .tools {
        height: 36px;
        background: #292b2f;
        border-top: 1px solid hsla(218,5%,47%,.3);
        display: flex;
        flex-direction: column;
        user-select: none;
    }

        .tools .flex-row {
            flex-grow: 1;
            padding: 4px 5px;
        }

        .tools button {
            border-radius: 3px;
            width: 100px;
            padding: 3px 10px;
            font-size: 12px;
            font-weight: 600;
            background: #36393f;
            color: #bac9d2;
            font-family: Whitney,Helvetica Neue,Helvetica,Arial,sans-serif;
            transition: background-color .2s ease;
            cursor: pointer;
            border: 0;
            margin-right: 4px;
        }

            .tools button:hover {
                background: #44474e;
                color: #FFF;
            }

        .tools #chkboxLiveUpdate {
            padding: 3px 10px;
            line-height: 22px;
        }

            .tools #chkboxLiveUpdate input[type="checkbox"] {
                margin: 0 6px 0 0;
                cursor: pointer;
            }

            .tools #chkboxLiveUpdate span {
                font-size: 12px;
                font-weight: 500;
                color: #bac9d2;
                font-family: Whitney,Helvetica Neue,Helvetica,Arial,sans-serif;
                cursor: default;
            }

    /*CodeMirror styling*/
    .CodeMirror-scroll {
        cursor: text;
    }

    .CodeMirror-overlayscroll .CodeMirror-scrollbar-filler {
        background: #38444a;
    }

    .CodeMirror-overlayscroll-horizontal div,
    .CodeMirror-overlayscroll-vertical div {
        background: rgb(41, 43, 47);
    }

    .CodeMirror-overlayscroll-horizontal,
    .CodeMirror-overlayscroll-horizontal div {
        height: 10px;
    }

    .CodeMirror-overlayscroll-vertical,
    .CodeMirror-overlayscroll-vertical div {
        width: 10px;
    }

    .CodeMirror-scrollbar-filler {
        width: 10px;
        height: 10px;
        background: rgb(41, 43, 47);
    }

    .cm-s-material.CodeMirror {
        background: #36393f;
    }

    .CodeMirror-scroll {
        cursor: text;
    }

    .cm-s-material .CodeMirror-gutters {
        background: #292b2f;
    }

    .CodeMirror-gutter {
        min-width: 34px;
        border-right: 1px solid hsla(218,5%,47%,.3);
        cursor: default;
    }

    .CodeMirror-hints {
        /*background: #1e262a;*/
        background: #292b2f;
        box-shadow: 2px 3px 5px rgba(4, 4, 4, 0.22);
        border: 1px solid #262f33;
    }

        .CodeMirror-hints::-webkit-scrollbar {
            background: transparent;
        }

        .CodeMirror-hints::-webkit-scrollbar-thumb {
            background-color: rgba(0,0,0,.4);
            border-color: transparent;
        }

        .CodeMirror-hints::-webkit-scrollbar-thumb,
        .CodeMirror-hints::-webkit-scrollbar-track {
            background-clip: padding-box;
            border-width: 3px;
            border-style: solid;
            border-radius: 7px;
        }

        .CodeMirror-hints::-webkit-scrollbar-track {
            background-color: transparent;
            border-color: transparent;
        }

    .CodeMirror-linenumber,
    .CodeMirror-line {
        padding: 0 5px !important;
    }

    .CodeMirror-linenumber {
        cursor: text;
    }

    .cm-s-material .CodeMirror-linenumber {
        color: #f6f6f7;
    }

    .CodeMirror-hint {
        color: #bac9d2;
    }

    li.CodeMirror-hint-active {
        color: #bac9d2;
        /*background: #3b4950;*/
        background: #36393f;
    }

    .CodeMirror-dialog-top {
        bottom: 0;
        top: auto;
        border: none;
        background: #1e262a;
    }
</style>