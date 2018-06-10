/**
 * BetterDiscord Client DOM Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

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

class DOMObserver {

    constructor() {
        this.observe = this.observe.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.observerCallback = this.observerCallback.bind(this);
        this.observer = new MutationObserver(this.observerCallback);
        this.observe();
    }

    observerCallback(mutations) {
        for (let sub of this.subscriptions) {
            try {
                const f = sub.type && sub.type === 'filter' ? mutations.filter(sub.filter) : mutations.find(sub.filter);
                if (!f) continue;
                if (sub.type && sub.type === 'filter' && !f.length) continue;
                sub.callback(f);
            } catch(err) {}
        }
    }

    observe() {
        this.observer.observe(this.root, this.options);
    }

    get root() {
        return document.getElementById('app-mount');
    }

    get options() {
        return { attributes: true, childList: true, subtree: true };
    }

    get subscriptions() {
        return this._subscriptions || (this._subscriptions = []);
    }

    subscribe(id, filter, callback, type) {
        if (this.subscriptions.find(sub => sub.id === id)) return;
        this.subscriptions.push({
            id,
            filter,
            callback,
            type
        });
    }

    unsubscribe(id) {
        const index = this.subscriptions.find(sub => sub.id === id);
        if (index < 0) return;
        this.subscriptions.splice(index, 1);
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

export default class DOM {

    static get manip() {
        return Manip;
    }

    static get observer() {
        return this._observer || (this._observer = new DOMObserver());
    }

    static get bdHead() {
        return this.getElement('bd-head') || this.createElement('bd-head').appendTo('head');
    }
    static get bdBody() {
        return this.getElement('bd-body') || this.createElement('bd-body').appendTo('body');
    }
    static get bdStyles() {
        return this.getElement('bd-styles') || this.createElement('bd-styles').appendTo(this.bdHead);
    }
    static get bdThemes() {
        return this.getElement('bd-themes') || this.createElement('bd-themes').appendTo(this.bdHead);
    }
    static get bdTooltips() {
        return this.getElement('bd-tooltips') || this.createElement('bd-tooltips').appendTo(this.bdBody);
    }
    static get bdModals() {
        return this.getElement('bd-modals') || this.createElement('bd-modals').appendTo(this.bdBody);
    }
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
        for (let attribute of attributes) {
            node.setAttribute(attribute.name, attribute.value);
        }
    }

}
