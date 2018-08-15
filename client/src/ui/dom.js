/**
 * BetterDiscord Client DOM Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Utils, ClientLogger as Logger } from 'common';

class BdNode {
    constructor(tag, className, id) {
        this.element = document.createElement(tag);
        if (className) this.element.className = className;
        if (id) this.element.id = id;
    }

    appendTo(e) {
        const el = DOM.getElement(e);
        if (!el) return null;
        el.append(this.element);
        return this.element;
    }

    prependTo(e) {
        const el = DOM.getElement(e);
        if (!el) return null;
        el.prepend(this.element);
        return this.element;
    }
}

export class DOMObserver {
    constructor(root, options) {
        this.observe = this.observe.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.observerCallback = this.observerCallback.bind(this);

        this.active = false;
        this.root = root || document.getElementById('app-mount');
        this.options = options || { attributes: true, childList: true, subtree: true };

        this.observer = new MutationObserver(this.observerCallback);
        this.observe();
    }

    observerCallback(mutations) {
        for (const sub of this.subscriptions) {
            try {
                const filteredMutations = sub.filter ? mutations.filter(sub.filter) : mutations;

                if (sub.group) {
                    if (!filteredMutations.length) continue;
                    sub.callback.call(sub.bind || sub, filteredMutations);
                } else {
                    for (const mutation of filteredMutations) sub.callback.call(sub.bind || sub, mutation);
                }
            } catch (err) {
                Logger.warn('DOMObserver', [`Error in observer callback`, err]);
            }
        }
    }

    /**
     * Starts observing the element. This will be called when attaching a callback.
     * You don't need to call this manually.
     */
    observe() {
        if (this.active) return;
        this.observer.observe(this.root, this.options);
        this.active = true;
    }

    /**
     * Disconnects this observer. This stops callbacks being called, but does not unbind them.
     * You probably want to use observer.unsubscribeAll instead.
     */
    disconnect() {
        if (!this.active) return;
        this.observer.disconnect();
        this.active = false;
    }

    reconnect() {
        if (this.active) {
            this.disconnect();
            this.observe();
        }
    }

    get root() { return this._root }
    set root(root) { this._root = root; this.reconnect(); }

    get options() { return this._options }
    set options(options) { this._options = options; this.reconnect(); }

    get subscriptions() {
        return this._subscriptions || (this._subscriptions = []);
    }

    /**
     * Subscribes to mutations.
     * @param {Function} callback A function to call when on a mutation
     * @param {Function} filter A function to call to filter mutations
     * @param {Any} bind Something to bind the callback to
     * @param {Boolean} group Whether to call the callback with an array of mutations instead of a single mutation
     * @return {Object}
     */
    subscribe(callback, filter, bind, group) {
        const subscription = { callback, filter, bind, group };
        this.subscriptions.push(subscription);
        this.observe();
        return subscription;
    }

    /**
     * Removes a subscription and disconnect if there are none left.
     * @param {Object} subscription A subscription object returned by observer.subscribe
     */
    unsubscribe(subscription) {
        if (!this.subscriptions.includes(subscription))
            subscription = this.subscriptions.find(s => s.callback === subscription);
        Utils.removeFromArray(this.subscriptions, subscription);
        if (!this.subscriptions.length) this.disconnect();
    }

    unsubscribeAll() {
        this.subscriptions.splice(0, this.subscriptions.length);
        this.disconnect();
    }

    /**
     * Subscribes to mutations that affect an element matching a selector.
     * @param {Function} callback A function to call when on a mutation
     * @param {Function} filter A function to call to filter mutations
     * @param {Any} bind Something to bind the callback to
     * @param {Boolean} group Whether to call the callback with an array of mutations instead of a single mutation
     * @return {Object}
     */
    subscribeToQuerySelector(callback, selector, bind, group) {
        return this.subscribe(callback, mutation => {
            return mutation.target.matches(selector) // If the target matches the selector
                || Array.from(mutation.addedNodes).concat(Array.from(mutation.removedNodes)) // Or if either an added or removed node
                    .find(n => n instanceof Element && (n.matches(selector) || n.querySelector(selector))); // match or contain an element matching the selector
        }, bind, group);
    }
}

class Manip {
    static setText(text, refocus) {
        const activeElement = document.activeElement;
        const txt = document.querySelector('.chat form textarea');
        if (!txt) return;
        txt.focus();
        txt.select();
        document.execCommand('insertText', false, text);
        if (activeElement && refocus) activeElement.focus();
    }

    static getText() {
        const txt = document.querySelector('.chat form textarea');
        if (!txt) return '';
        return txt.value;
    }
}

export { Manip as DOMManip };

export default class DOM {

    static get manip() {
        return Manip;
    }

    static get observer() {
        return this._observer || (this._observer = new DOMObserver());
    }

    static get bdHead() { return this.getElement('bd-head') || this.createElement('bd-head').appendTo('head') }
    static get bdBody() { return this.getElement('bd-body') || this.createElement('bd-body').appendTo('body') }
    static get bdStyles() { return this.getElement('bd-styles') || this.createElement('bd-styles').appendTo(this.bdHead) }
    static get bdThemes() { return this.getElement('bd-themes') || this.createElement('bd-themes').appendTo(this.bdHead) }
    static get bdTooltips() { return this.getElement('bd-tooltips') || this.createElement('bd-tooltips').appendTo(this.bdBody) }
    static get bdModals() { return this.getElement('bd-modals') || this.createElement('bd-modals').appendTo(this.bdBody) }
    static get bdToasts() {
        return this.getElement('bd-toasts') || this.createElement('bd-toasts').appendTo(this.bdBody);
    }

    static getElement(e) {
        if (e instanceof BdNode) return e.element;
        if (e instanceof window.Node) return e;
        if ('string' !== typeof e) return null;
        return document.querySelector(e);
    }

    static getElements(e) {
        return document.querySelectorAll(e);
    }

    static createElement(tag = 'div', className = null, id = null) {
        return new BdNode(tag, className, id);
    }

    static deleteStyle(id) {
        const exists = Array.from(this.bdStyles.children).find(e => e.id === id);
        if (exists) exists.remove();
    }

    static injectStyle(css, id) {
        const style = Array.from(this.bdStyles.children).find(e => e.id === id) || this.createElement('style', null, id).element;
        style.textContent = css;
        this.bdStyles.append(style);
    }

    static getStyleCss(id) {
        const exists = this.bdStyles.children.find(e => e.id === id);
        return exists ? exists.textContent : '';
    }

    static deleteTheme(id) {
        const exists = Array.from(this.bdThemes.children).find(e => e.id === id);
        if (exists) exists.remove();
    }

    static injectTheme(css, id) {
        const style = Array.from(this.bdThemes.children).find(e => e.id === id) || this.createElement('style', null, id).element;
        style.textContent = css;
        this.bdThemes.append(style);
    }

    static createStyle(css, id) {
        const style = document.createElement('style');
        style.id = id;
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        return style;
    }

    static setAttributes(node, attributes) {
        for (const attribute of attributes) {
            node.setAttribute(attribute.name, attribute.value);
        }
    }

}
