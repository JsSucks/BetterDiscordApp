/**
 * BetterDiscord Modals
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { ClientLogger as Logger, AsyncEventEmitter } from 'common';
import { Settings, Events, PluginManager, ThemeManager } from 'modules';
import BaseModal from './components/common/Modal.vue';
import BasicModal from './components/bd/modals/BasicModal.vue';
import ConfirmModal from './components/bd/modals/ConfirmModal.vue';
import ErrorModal from './components/bd/modals/ErrorModal.vue';
import SettingsModal from './components/bd/modals/SettingsModal.vue';
import PermissionModal from './components/bd/modals/PermissionModal.vue';
import InputModal from './components/bd/modals/InputModal.vue';

let modals = 0;

class Modal extends AsyncEventEmitter {
    constructor(_modal, component) {
        super();

        Object.assign(this, _modal);

        const modal = this;
        this.component = this.component || {
            render(createElement) {
                return createElement(component, {
                    props: {
                        modal,
                        id: modal.id,
                        closing: modal.closing
                    }
                });
            },
            data() { return { modal }; },
            created() { modal.vueInstance = this; },
            mounted() { modal.vue = this.$children[0]; },
            beforeDestroy() { modal.vue = undefined; },
            destroyed() { modal.vueInstance = undefined; }
        };

        this.closing = false;
        this.id = modals++;
        this.vueInstance = undefined;
        this.vue = undefined;

        this.close = this.close.bind(this);
    }

    /**
     * Closes the modal and removes it from the stack.
     * @param {Boolean} force If not true throwing an error in the close hook will stop the modal being closed
     * @return {Promise}
     */
    close(force) {
        return Modals.close(this, force);
    }
}

export default class Modals {

    /**
     * Adds a modal to the open stack.
     * @param {Object} modal A Modal object or options used to create a Modal object
     * @param {Object} component A Vue component that will be used to render the modal (optional if modal is a Modal object or it contains a component property)
     * @return {Modal} The Modal object that was passed or created using the passed options
     */
    static add(_modal, component) {
        const modal = _modal instanceof Modal ? _modal : new Modal(_modal, component);

        if (this.stack.includes(modal)) {
            Logger.log('Modals', ['Trying to show a modal that is already in the modal stack.', modal]);
            throw new Error('Trying to show a modal that is already in the modal stack.');
        }

        modal.closing = false;
        modal.closed = modal.once('closed');

        this.stack.push(modal);
        Events.emit('bd-refresh-modals');
        return modal;
    }

    /**
     * Closes a modal and removes it from the stack.
     * @param {Modal} modal The modal to close
     * @param {Boolean} force If not true throwing an error in the close hook will stop the modal being closed
     * @return {Promise}
     */
    static async close(modal, force) {
        try {
            if (modal.beforeClose) {
                const beforeCloseResult = await modal.beforeClose(force);
                if (beforeCloseResult) throw beforeCloseResult;
            }
            await modal.emit('close', force);
        } catch (err) {
            Logger.err('Modals', ['Error thrown in modal close event:', err]);
            if (!force) throw err;
        }

        modal.closing = true;
        await new Promise(resolve => setTimeout(resolve, 200));

        let index;
        while ((index = this.stack.findIndex(m => m === modal)) > -1)
            this.stack.splice(index, 1);

        Events.emit('bd-refresh-modals');

        try {
            await modal.emit('closed', force);
        } catch (err) {
            Logger.err('Modals', ['Error thrown in modal closed event:', err]);
            if (!force) throw err;
        }
    }

    /**
     * Closes all open modals and removes them from the stack.
     * @param {Boolean} force If not true throwing an error in the close hook will stop that modal and any modals higher in the stack from being closed
     * @return {Promise}
     */
    static closeAll(force) {
        const promises = [];
        for (const modal of this.stack)
            promises.push(modal.close(force));
        return Promise.all(promises);
    }

    /**
     * Closes highest modal in the stack and removes it from the stack.
     * @param {Boolean} force If not true throwing an error in the close hook will stop the modal being closed
     * @return {Promise}
     */
    static closeLast(force) {
        if (!this.stack.length) return Promise.resolve();
        return this.stack[this.stack.length - 1].close(force);
    }

    /**
     * Creates a new basic modal and adds it to the open stack.
     * @param {String} title A string that will be displayed in the modal header
     * @param {String} text A string that will be displayed in the modal body
     * @return {Modal}
     */
    static basic(title, text) {
        return this.add(this.createBasicModal(title, text));
    }

    static createBasicModal(title, text) {
        return new Modal({ title, text }, BasicModal);
    }

    /**
     * Creates a new confirm modal and adds it to the open stack.
     * The modal will have a promise property that will be set to a Promise object that is resolved or rejected if the user clicks the confirm button or closes the modal.
     * @param {String} title A string that will be displayed in the modal header
     * @param {String} text A string that will be displayed in the modal body
     * @return {Modal}
     */
    static confirm(title, text, confirmText, cancelText) {
        return this.add(this.createConfirmModal(title, text, confirmText, cancelText));
    }

    static createConfirmModal(title, text, confirmText, cancelText) {
        const modal = { title, text, confirmText, cancelText };
        modal.promise = new Promise((resolve, reject) => {
            modal.confirm = () => resolve(true);
            modal.beforeClose = () => reject();
        });
        return new Modal(modal, ConfirmModal);
    }

    static input(title, text, password = false) {
        return this.add(this.createInputModal(title, text, password));
    }

    static createInputModal(title, text, password = false) {
        const modal = { title, text, password };
        modal.promise = new Promise((resolve, reject) => {
            modal.confirm = value => resolve(value);
            modal.beforeClose = () => reject();
        });
        return new Modal(modal, InputModal);
    }

    /**
     * Creates a new permissions modal and adds it to the open stack.
     * The modal will have a promise property that will be set to a Promise object that is resolved or rejected if the user accepts the permissions or closes the modal.
     * @param {String} title A string that will be displayed in the modal header
     * @param {String} name The requesting plugin's name
     * @param {Array} perms The permissions the plugin is requesting
     * @return {Modal}
     */
    static permissions(title, name, perms) {
        return this.add(this.createPermissionsModal(title, name, perms));
    }

    static createPermissionsModal(title, name, perms) {
        const modal = { title, name, perms };
        modal.promise = new Promise((resolve, reject) => {
            modal.confirm = () => resolve(true);
            modal.beforeClose = () => reject();
        });
        return new Modal(modal, PermissionModal);
    }

    /**
     * Creates a new error modal and adds it to the open stack.
     * @param {Object} event An object containing details about the error[s] to display
     * @return {Modal}
     */
    static error(event) {
        return this.add(this.createErrorModal(event));
    }

    static createErrorModal(event) {
        return new Modal({ event }, ErrorModal);
    }

    /**
     * Creates a new error modal with errors from PluginManager and ThemeManager and adds it to the open stack.
     * @param {Boolean} clear Whether to clear the errors array after opening the modal
     * @return {Modal}
     */
    static showContentManagerErrors(clear = true) {
        // Get any errors from PluginManager and ThemeManager
        const errors = ([]).concat(PluginManager.errors).concat(ThemeManager.errors);
        if (!errors.length) return;

        const pmErrCount = PluginManager.errors.length;
        const tmErrCount = ThemeManager.errors.length;
        const failedModule = pmErrCount && tmErrCount ? 'Content Manager' : pmErrCount ? 'Plugin Manager' : 'Theme Manager';

        const modal = this.error({
            header: `
                    ${failedModule} - 
                    ${pmErrCount ? `${pmErrCount} ${PluginManager.contentType}${pmErrCount !== 1 ? 's' : ''}` : ''}
                    ${pmErrCount && tmErrCount ? ' and ' : ''}
                    ${tmErrCount ? `${tmErrCount} ${ThemeManager.contentType}${tmErrCount !== 1 ? 's' : ''}` : ''} failed to load
                    `,
            module: failedModule,
            type: 'err',
            content: errors
        });

        if (clear) {
            PluginManager._errors = [];
            ThemeManager._errors = [];
        }

        return modal;
    }

    /**
     * Creates a new settings modal and adds it to the open stack.
     * @param {SettingsSet} settingsset The SettingsSet object to [clone and] display in the modal
     * @param {String} headertext A string that will be displayed in the modal header
     * @param {Object} options Additional options that will be passed to the modal
     * @return {Modal}
     */
    static settings(settingsset, headertext, options) {
        return this.add(this.createSettingsModal(settingsset, headertext, options));
    }

    static createSettingsModal(settingsset, headertext, options) {
        return new Modal(Object.assign({
            headertext: headertext ? headertext : settingsset.headertext,
            settings: settingsset,
            schemes: settingsset.schemes
        }, options), SettingsModal);
    }

    /**
     * Creates a new settings modal with one of BetterDiscord's settings sets and adds it to the open stack.
     * @param {SettingsSet} set_id The ID of the SettingsSet object to [clone and] display in the modal
     * @param {String} headertext A string that will be displayed in the modal header
     * @return {Modal}
     */
    static internalSettings(set_id, headertext) {
        const set = Settings.getSet(set_id);
        if (!set) return;
        return this.settings(set, headertext);
    }

    /**
     * Creates a new settings modal with a plugin/theme's settings set and adds it to the open stack.
     * @param {SettingsSet} content The plugin/theme whose settings set is to be [cloned and] displayed in the modal
     * @param {String} headertext A string that will be displayed in the modal header
     * @return {Modal}
     */
    static contentSettings(content, headertext, options) {
        return this.settings(content.settings, headertext ? headertext : `${content.name} Settings`, options);
    }

    /**
     * An array of open modals.
     */
    static get stack() {
        return this._stack || (this._stack = []);
    }

    /**
     * A base Vue component for modals to use.
     */
    static get baseComponent() {
        return BaseModal;
    }

}
