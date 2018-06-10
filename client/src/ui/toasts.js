/**
 * BetterDiscord Modals
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

export default class Toasts {

    /**
     * This shows a popup message at the bottom of the screen similar to Android Toasts. This is useful for small user feedback.
     * 
     * @param {string} message The message to be displayed in the toast
     * @param {Object} options Options object. Optional parameter.
     * @param {string} options.type Changes the type of the toast stylistically and semantically. Choices: "basic", "info", "success", "error", "warning". Default: "basic"
     * @param {string} options.icon URL to custom icon to show in the toast. Having this overrides the default icon for the toast type.
     * @param {number} options.timeout Adjusts the time (in ms) the toast should be shown for before disappearing automatically. Default: 3000
     * @returns {Promise} This promise resolves when the toast is removed from the DOM.
     */
    static async push(message, options = {}) {
        const {type = "basic", icon, timeout = 3000} = options;
        const toast = {id: Math.random(), message, type, icon, closing: false};
        this.stack.push(toast);
        await new Promise(resolve => setTimeout(resolve, timeout));
        toast.closing = true;
        await new Promise(resolve => setTimeout(resolve, 300));
        this.stack.splice(this.stack.indexOf(toast), 1);
    }

    /**
     * This is a shortcut for `type = "success"` in {@link Toasts#push}. The parameters and options are the same.
     */
    static async success(message, options = {}) {
        options.type = "success";
        return this.push(message, options);
    }

    /**
     * This is a shortcut for `type = "error"` in {@link Toasts#push}. The parameters and options are the same.
     */
    static async error(message, options = {}) {
        options.type = "error";
        return this.push(message, options);
    }

    /**
     * This is a shortcut for `type = "info"` in {@link Toasts#push}. The parameters and options are the same.
     */
    static async info(message, options = {}) {
        options.type = "info";
        return this.push(message, options);
    }

    /**
     * This is a shortcut for `type = "warning"` in {@link Toasts#push}. The parameters and options are the same.
     */
    static async warning(message, options = {}) {
        options.type = "warning";
        return this.push(message, options);
    }

    /**
     * An array of active toasts.
     */
    static get stack() {
        return this._stack || (this._stack = []);
    }

}
