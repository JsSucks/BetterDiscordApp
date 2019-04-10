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
    constructor(node, attributes) {
        this.element = node;
        DOM.setAttributes(node, attributes);
    }

    get index() { return DOM.index(this.element); }
    get innerWidth() { return DOM.innerWidth(this.element); }
    get innerHeight() { return DOM.innerHeight(this.element); }
    get outerWidth() { return DOM.outerWidth(this.element); }
    get outerHeight() { return DOM.outerHeight(this.element); }
    get offset() { return DOM.offset(this.element); }

    get width() { return DOM.width(this.element); }
    set width(value) { return DOM.width(this.element, value); }
    get height() { return DOM.height(this.element); }
    set height(value) { return DOM.height(this.element, value); }
    get text() { return DOM.text(this.element); }
    set text(value) { return DOM.text(this.element, value); }

    css(attribute, value) { return DOM.css(this.element, attribute, value); }

    addClass(...classes) { return DOM.addClass(this.element, ...classes); }
    removeClass(...classes) { return DOM.removeClass(this.element, ...classes); }
    toggleClass(className, indicator) { return DOM.toggleClass(this.element, className, indicator); }
    replaceClass(oldClass, newClass) { return DOM.replaceClass(this.element, oldClass, newClass); }
    hasClass(className) { return DOM.hasClass(this.element, className); }

    insertAfter(otherNode) { return DOM.insertAfter(this.element, otherNode); }
    after(newNode) { return DOM.after(this.element, newNode); }

    next(selector = '') { return DOM.next(this.element, selector); }
    nextAll() { return DOM.nextAll(this.element); }
    nextUntil(selector) { return DOM.nextUntil(this.element, selector); }

    previous(selector = '') { return DOM.previous(this.element, selector); }
    previousAll() { return DOM.previousAll(this.element); }
    previousUntil(selector) { return DOM.previousUntil(this.element, selector); }

    parent(selector = '') { return DOM.parent(this.element, selector); }
    parents(selector ='') { return DOM.parents(this.element, selector); }
    parentsUntil(selector) { return DOM.parentsUntil(this.element, selector); }

    findChild(selector) { return DOM.findChild(this.element, selector); }
    findChildren(selector) { return DOM.findChildren(this.element, selector); }

    siblings(selector = '*') { return DOM.siblings(this.element, selector); }

    on(event, delegate, callback) { return DOM.on(this.element, event, delegate, callback); }
    once(event, delegate, callback) { return DOM.once(this.element, event, delegate, callback); }
    off(event, delegate, callback) { return DOM.off(this.element, event, delegate, callback); }

    find(selector) { return DOM.find(this.element, selector); }
    findAll(selector) { return DOM.findAll(this.element, selector); }

    appendTo(otherNode) { return DOM.appendTo(this.element, otherNode); }
    prependTo(otherNode) { return DOM.prependTo(this.element, otherNode); }

    onMountChange(callback, onMount = true) { return DOM.onMountChange(this.element, callback, onMount); }
    onMount(callback) { return DOM.onMount(this.element, callback); }
    onAdded(callback) { return DOM.onAdded(this.element, callback); }
    onUnmount(callback) { return DOM.onUnmount(this.element, callback); }
    onRemoved(callback) { return DOM.onRemoved(this.element, callback); }
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
    static get bdToasts() { return this.getElement('bd-toasts') || this.createElement('bd-toasts').appendTo(this.bdBody) }
    static get bdNotifications() { return this.getElement('bd-notifications') || this.createElement('bd-notifications').appendTo(this.bdBody) }
    static get bdContextMenu() { return this.getElement('bd-contextmenu') || this.createElement('bd-contextmenu').appendTo(this.bdBody) }

    /**
     * Essentially a shorthand for `document.querySelector`. If the `baseElement` is not provided
     * `document` is used by default.
     * @param {string} selector - Selector to query
     * @param {Element} [baseElement] - Element to base the query from
     * @returns {(Element|null)} - The found element or null if not found
     */
    static getElement(e, baseElement = document) {
        if (e instanceof BdNode) return e.element;
        if (e instanceof window.Node) return e;
        if ('string' !== typeof e) return null;
        return baseElement.querySelector(e);
    }

    /**
     * Alias for {@link module:DOM.getElement}.
     */
    static query(e, baseElement = document) {return this.getElement(e, baseElement);}

    /**
     * Essentially a shorthand for `document.querySelectorAll`. If the `baseElement` is not provided
     * `document` is used by default.
     * @param {string} selector - Selector to query
     * @param {Element} [baseElement] - Element to base the query from
     * @returns {Array<Element>} - Array of all found elements
     */
    static getElements(e, baseElement = document) {
        return baseElement.querySelectorAll(e);
    }

    /**
     * Alias for {@link module:DOM.getElements}.
     */
    static queryAll(e, baseElement = document) {return this.getElements(e, baseElement);}

    static createElement(tag = 'div', attributes = {}) {
        return new BdNode(document.createElement(tag), attributes);
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

    /**
     * Builds a classname string from any number of arguments. This includes arrays and objects.
     * When given an array all values from the array are added to the list.
     * When given an object they keys are added as the classnames if the value is truthy.
     * Copyright (c) 2018 Jed Watson https://github.com/JedWatson/classnames MIT License
     * @param {...Any} argument - anything that should be used to add classnames.
     */
    static className() {
        const classes = [];
        const hasOwnProp = {}.hasOwnProperty;

        for (let i = 0; i < arguments.length; i++) {
            const arg = arguments[i];
            if (!arg) continue;

            const argType = typeof arg;

            if (argType === 'string' || argType === 'number') {
                classes.push(arg);
            }
            else if (Array.isArray(arg) && arg.length) {
                const inner = this.classNames.apply(null, arg);
                if (inner) classes.push(inner);
            }
            else if (argType === 'object') {
                for (const key in arg) {
                    if (hasOwnProp.call(arg, key) && arg[key]) classes.push(key);
                }
            }
        }

        return classes.join(' ');
    }

    /**
     * Functions below come from Zerebos' library module DOMTools.
     */

    /**
     * Parses a string of HTML and returns the results. If the second parameter is true,
     * the parsed HTML will be returned as a document fragment {@see https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment}.
     * This is extremely useful if you have a list of elements at the top level, they can then be appended all at once to another node.
     *
     * If the second parameter is false, then the return value will be the list of parsed
     * nodes and there were multiple top level nodes, otherwise the single node is returned.
     * @param {string} html - HTML to be parsed
     * @param {boolean} [fragment=false] - Whether or not the return should be the raw `DocumentFragment`
     * @returns {(DocumentFragment|NodeList|HTMLElement)} - The result of HTML parsing
     */
    static parseHTML(html, fragment = false) {
        const template = document.createElement('template');
        template.innerHTML = html;
        const node = template.content.cloneNode(true);
        if (fragment) return node;
        return node.childNodes.length > 1 ? node.childNodes : node.childNodes[0];
    }

    /**
     * Takes a string of html and escapes it using the brower's own escaping mechanism.
     * @param {String} html - html to be escaped
     */
    static escapeHTML(html) {
        const textNode = document.createTextNode('');
        const spanElement = document.createElement('span');
        spanElement.append(textNode);
        textNode.nodeValue = html;
        return spanElement.innerHTML;
    }

    /**
     * This is my shit version of not having to use `$` from jQuery. Meaning
     * that you can pass a selector and it will automatically run {@link module:DOM.query}.
     * It also means that you can pass a string of html and it will perform and return `parseHTML`.
     * @see module:DOM.parseHTML
     * @see module:DOM.query
     * @param {string} selector - Selector to query or HTML to parse
     * @returns {(DocumentFragment|NodeList|HTMLElement)} - Either the result of `parseHTML` or `query`
     */
    static Q(selector) {
        const element = this.parseHTML(selector);
        const isHTML = element instanceof NodeList ? Array.from(element).some(n => n.nodeType === 1) : element.nodeType === 1;
        if (isHTML) return element;
        return this.query(selector);
    }

    /**
     * Adds a list of classes from the target element.
     * @param {Element} element - Element to edit classes of
     * @param {...string} classes - Names of classes to add
     * @returns {Element} - `element` to allow for chaining
     */
    static addClass(element, ...classes) {
        for (let c = 0; c < classes.length; c++) classes[c] = classes[c].toString().split(' ');
        classes = classes.flatten().filter(c => c);
        element.classList.add(...classes);
        return element;
    }

    /**
     * Removes a list of classes from the target element.
     * @param {Element} element - Element to edit classes of
     * @param {...string} classes - Names of classes to remove
     * @returns {Element} - `element` to allow for chaining
     */
    static removeClass(element, ...classes) {
        for (let c = 0; c < classes.length; c++) classes[c] = classes[c].toString().split(' ');
        classes = classes.flatten().filter(c => c);
        element.classList.remove(...classes);
        return element;
    }

    /**
     * When only one argument is present: Toggle class value;
     * i.e., if class exists then remove it and return false, if not, then add it and return true.
     * When a second argument is present:
     * If the second argument evaluates to true, add specified class value, and if it evaluates to false, remove it.
     * @param {Element} element - Element to edit classes of
     * @param {string} classname - Name of class to toggle
     * @param {boolean} [indicator] - Optional indicator for if the class should be toggled
     * @returns {Element} - `element` to allow for chaining
     */
    static toggleClass(element, classname, indicator) {
        classname = classname.toString().split(' ').filter(c => c);
        if (typeof(indicator) !== 'undefined') classname.forEach(c => element.classList.toggle(c, indicator));
        else classname.forEach(c => element.classList.toggle(c));
        return element;
    }

    /**
     * Checks if an element has a specific class
     * @param {Element} element - Element to edit classes of
     * @param {string} classname - Name of class to check
     * @returns {boolean} - `true` if the element has the class, `false` otherwise.
     */
    static hasClass(element, classname) {
        return classname.toString().split(' ').filter(c => c).every(c => element.classList.contains(c));
    }

    /**
     * Replaces one class with another
     * @param {Element} element - Element to edit classes of
     * @param {string} oldName - Name of class to replace
     * @param {string} newName - New name for the class
     * @returns {Element} - `element` to allow for chaining
     */
    static replaceClass(element, oldName, newName) {
        element.classList.replace(oldName, newName);
        return element;
    }

    /**
     * Appends `thisNode` to `thatNode`
     * @param {Node} thisNode - Node to be appended to another node
     * @param {Node} thatNode - Node for `thisNode` to be appended to
     * @returns {Node} - `thisNode` to allow for chaining
     */
    static appendTo(thisNode, thatNode) {
        if (typeof(thatNode) == 'string') thatNode = this.query(thatNode);
        if (!thatNode) return null;
        thatNode.append(thisNode);
        return thisNode;
    }

    /**
     * Prepends `thisNode` to `thatNode`
     * @param {Node} thisNode - Node to be prepended to another node
     * @param {Node} thatNode - Node for `thisNode` to be prepended to
     * @returns {Node} - `thisNode` to allow for chaining
     */
    static prependTo(thisNode, thatNode) {
        if (typeof(thatNode) == 'string') thatNode = this.query(thatNode);
        if (!thatNode) return null;
        thatNode.prepend(thisNode);
        return thisNode;
    }

    /**
     * Insert after a specific element, similar to jQuery's `thisElement.insertAfter(otherElement)`.
     * @param {Node} thisNode - The node to insert
     * @param {Node} targetNode - Node to insert after in the tree
     * @returns {Node} - `thisNode` to allow for chaining
     */
    static insertAfter(thisNode, targetNode) {
        targetNode.parentNode.insertBefore(thisNode, targetNode.nextSibling);
        return thisNode;
    }

    /**
     * Insert after a specific element, similar to jQuery's `thisElement.after(newElement)`.
     * @param {Node} thisNode - The node to insert
     * @param {Node} newNode - Node to insert after in the tree
     * @returns {Node} - `thisNode` to allow for chaining
     */
    static after(thisNode, newNode) {
        thisNode.parentNode.insertBefore(newNode, thisNode.nextSibling);
        return thisNode;
    }

    /**
     * Gets the next sibling element that matches the selector.
     * @param {Element} element - Element to get the next sibling of
     * @param {string} [selector=''] - Optional selector
     * @returns {Element} - The sibling element
     */
    static next(element, selector = '') {
        return selector ? element.querySelector(`+ ${selector}`) : element.nextElementSibling;
    }

    /**
     * Gets all subsequent siblings.
     * @param {Element} element - Element to get next siblings of
     * @returns {NodeList} - The list of siblings
     */
    static nextAll(element) {
        return element.querySelectorAll('~ *');
    }

    /**
     * Gets the subsequent siblings until an element matches the selector.
     * @param {Element} element - Element to get the following siblings of
     * @param {string} selector - Selector to stop at
     * @returns {Array<Element>} - The list of siblings
     */
    static nextUntil(element, selector) {
        const next = [];
        while (element.nextElementSibling && !element.nextElementSibling.matches(selector)) next.push(element = element.nextElementSibling);
        return next;
    }

    /**
     * Gets the previous sibling element that matches the selector.
     * @param {Element} element - Element to get the previous sibling of
     * @param {string} [selector=''] - Optional selector
     * @returns {Element} - The sibling element
     */
    static previous(element, selector = '') {
        const previous = element.previousElementSibling;
        if (selector) return previous && previous.matches(selector) ? previous : null;
        return previous;
    }

    /**
     * Gets all preceeding siblings.
     * @param {Element} element - Element to get preceeding siblings of
     * @returns {NodeList} - The list of siblings
     */
    static previousAll(element) {
        const previous = [];
        while (element.previousElementSibling) previous.push(element = element.previousElementSibling);
        return previous;
    }

    /**
     * Gets the preceeding siblings until an element matches the selector.
     * @param {Element} element - Element to get the preceeding siblings of
     * @param {string} selector - Selector to stop at
     * @returns {Array<Element>} - The list of siblings
     */
    static previousUntil(element, selector) {
        const previous = [];
        while (element.previousElementSibling && !element.previousElementSibling.matches(selector)) previous.push(element = element.previousElementSibling);
        return previous;
    }

    /** Shorthand for {@link module:DOM.indexInParent} */
    static index(node) {return this.indexInParent(node);}

    /**
     * Find which index in children a certain node is. Similar to jQuery's `$.index()`
     * @param {HTMLElement} node - The node to find its index in parent
     * @returns {number} Index of the node
     */
    static indexInParent(node) {
        const children = node.parentNode.childNodes;
        let num = 0;
        for (let i = 0; i < children.length; i++) {
            if (children[i] == node) return num;
            if (children[i].nodeType == 1) num++;
        }
        return -1;
    }

    /**
     * Gets the parent of the element if it matches the selector,
     * otherwise returns null.
     * @param {Element} element - Element to get parent of
     * @param {string} [selector=''] - Selector to match parent
     * @returns {(Element|null)} - The sibling element or null
     */
    static parent(element, selector = '') {
        return !selector || element.parentElement.matches(selector) ? element.parentElement : null;
    }

    /**
     * Gets all ancestors of Element that match the selector if provided.
     * @param {Element} element - Element to get all parents of
     * @param {string} [selector=''] - Selector to match the parents to
     * @returns {Array<Element>} - The list of parents
     */
    static parents(element, selector = '') {
        const parents = [];
        if (selector) while (element.parentElement && element.parentElement.closest(selector)) parents.push(element = element.parentElement.closest(selector));
        else while (element.parentElement) parents.push(element = element.parentElement);
        return parents;
    }

    /**
     * Gets the ancestors until an element matches the selector.
     * @param {Element} element - Element to get the ancestors of
     * @param {string} selector - Selector to stop at
     * @returns {Array<Element>} - The list of parents
     */
    static parentsUntil(element, selector) {
        const parents = [];
        while (element.parentElement && !element.parentElement.matches(selector)) parents.push(element = element.parentElement);
        return parents;
    }

    /**
     * Gets all children of Element that match the selector if provided.
     * @param {Element} element - Element to get all children of
     * @param {string} selector - Selector to match the children to
     * @returns {Array<Element>} - The list of children
     */
    static findChild(element, selector) {
        return element.querySelector(`:scope > ${selector}`);
    }

    /**
     * Gets all children of Element that match the selector if provided.
     * @param {Element} element - Element to get all children of
     * @param {string} selector - Selector to match the children to
     * @returns {Array<Element>} - The list of children
     */
    static findChildren(element, selector) {
        return element.querySelectorAll(`:scope > ${selector}`);
    }

    /**
     * Gets all siblings of the element that match the selector.
     * @param {Element} element - Element to get all siblings of
     * @param {string} [selector='*'] - Selector to match the siblings to
     * @returns {Array<Element>} - The list of siblings
     */
    static siblings(element, selector = '*') {
        return Array.from(element.parentElement.children).filter(e => e != element && e.matches(selector));
    }

    /**
     * Sets or gets css styles for a specific element. If `value` is provided
     * then it sets the style and returns the element to allow for chaining,
     * otherwise returns the style.
     * @param {Element} element - Element to set the CSS of
     * @param {string} attribute - Attribute to get or set
     * @param {string} [value] - Value to set for attribute
     * @returns {Element|string} - When setting a value, element is returned for chaining, otherwise the value is returned.
     */
    static css(element, attribute, value) {
        if (typeof(value) == 'undefined') return global.getComputedStyle(element)[attribute];
        element.style[attribute] = value;
        return element;
    }

    /**
     * Sets or gets the width for a specific element. If `value` is provided
     * then it sets the width and returns the element to allow for chaining,
     * otherwise returns the width.
     * @param {Element} element - Element to set the CSS of
     * @param {string} [value] - Width to set
     * @returns {Element|string} - When setting a value, element is returned for chaining, otherwise the value is returned.
     */
    static width(element, value) {
        if (typeof(value) == 'undefined') return parseInt(getComputedStyle(element).width);
        element.style.width = value;
        return element;
    }

    /**
     * Sets or gets the height for a specific element. If `value` is provided
     * then it sets the height and returns the element to allow for chaining,
     * otherwise returns the height.
     * @param {Element} element - Element to set the CSS of
     * @param {string} [value] - Height to set
     * @returns {Element|string} - When setting a value, element is returned for chaining, otherwise the value is returned.
     */
    static height(element, value) {
        if (typeof(value) == 'undefined') return parseInt(getComputedStyle(element).height);
        element.style.height = value;
        return element;
    }

    /**
     * Sets the inner text of an element if given a value, otherwise returns it.
     * @param {Element} element - Element to set the text of
     * @param {string} [text] - Content to set
     * @returns {string} - Either the string set by this call or the current text content of the node.
     */
    static text(element, text) {
        if (typeof(text) == 'undefined') return element.textContent;
        return element.textContent = text;
    }

    /**
     * Returns the innerWidth of the element.
     * @param {Element} element - Element to retrieve inner width of
     * @return {number} - The inner width of the element.
     */
    static innerWidth(element) {
        return element.clientWidth;
    }

    /**
     * Returns the innerHeight of the element.
     * @param {Element} element - Element to retrieve inner height of
     * @return {number} - The inner height of the element.
     */
    static innerHeight(element) {
        return element.clientHeight;
    }

    /**
     * Returns the outerWidth of the element.
     * @param {Element} element - Element to retrieve outer width of
     * @return {number} - The outer width of the element.
     */
    static outerWidth(element) {
        return element.offsetWidth;
    }

    /**
     * Returns the outerHeight of the element.
     * @param {Element} element - Element to retrieve outer height of
     * @return {number} - The outer height of the element.
     */
    static outerHeight(element) {
        return element.offsetHeight;
    }

    /**
     * Gets the offset of the element in the page.
     * @param {Element} element - Element to get offset of
     * @return {Offset} - The offset of the element
     */
    static offset(element) {
        return element.getBoundingClientRect();
    }

    static get listeners() { return this._listeners || (this._listeners = {}); }

    /**
     * This is similar to jQuery's `on` function and can *hopefully* be used in the same way.
     *
     * Rather than attempt to explain, I'll show some example usages.
     *
     * The following will add a click listener (in the `myPlugin` namespace) to `element`.
     * `DOM.on(element, 'click.myPlugin', () => {console.log('clicked!');});`
     *
     * The following will add a click listener (in the `myPlugin` namespace) to `element` that only fires when the target is a `.block` element.
     * `DOM.on(element, 'click.myPlugin', '.block', () => {console.log('clicked!');});`
     *
     * The following will add a click listener (without namespace) to `element`.
     * `DOM.on(element, 'click', () => {console.log('clicked!');});`
     *
     * The following will add a click listener (without namespace) to `element` that only fires once.
     * `const cancel = DOM.on(element, 'click', () => {console.log('fired!'); cancel();});`
     *
     * @param {Element} element - Element to add listener to
     * @param {string} event - Event to listen to with option namespace (e.g. 'event.namespace')
     * @param {(string|callable)} delegate - Selector to run on element to listen to
     * @param {callable} [callback] - Function to fire on event
     * @returns {module:DOM~CancelListener} - A function that will undo the listener
     */
    static on(element, event, delegate, callback) {
        const [type, namespace] = event.split('.');
        const hasDelegate = delegate && callback;
        if (!callback) callback = delegate;
        const eventFunc = !hasDelegate ? callback : function(event) {
            if (event.target.matches(delegate)) {
                callback(event);
            }
        };

        element.addEventListener(type, eventFunc);
        const cancel = () => {
            element.removeEventListener(type, eventFunc);
        };
        if (namespace) {
            if (!this.listeners[namespace]) this.listeners[namespace] = [];
            const newCancel = () => {
                cancel();
                this.listeners[namespace].splice(this.listeners[namespace].findIndex(l => l.event == type && l.element == element), 1);
            };
            this.listeners[namespace].push({
                event: type,
                element: element,
                cancel: newCancel
            });
            return newCancel;
        }
        return cancel;
    }

    /**
     * Functionality for this method matches {@link module:DOM.on} but automatically cancels itself
     * and removes the listener upon the first firing of the desired event.
     *
     * @param {Element} element - Element to add listener to
     * @param {string} event - Event to listen to with option namespace (e.g. 'event.namespace')
     * @param {(string|callable)} delegate - Selector to run on element to listen to
     * @param {callable} [callback] - Function to fire on event
     * @returns {module:DOM~CancelListener} - A function that will undo the listener
     */
    static once(element, event, delegate, callback) {
        const [type, namespace] = event.split('.');
        const hasDelegate = delegate && callback;
        if (!callback) callback = delegate;
        const eventFunc = !hasDelegate ? function(event) {
            callback(event);
            element.removeEventListener(type, eventFunc);
        } : function(event) {
            if (!event.target.matches(delegate)) return;
            callback(event);
            element.removeEventListener(type, eventFunc);
        };

        element.addEventListener(type, eventFunc);
        const cancel = () => {
            element.removeEventListener(type, eventFunc);
        };
        if (namespace) {
            if (!this.listeners[namespace]) this.listeners[namespace] = [];
            const newCancel = () => {
                cancel();
                this.listeners[namespace].splice(this.listeners[namespace].findIndex(l => l.event == type && l.element == element), 1);
            };
            this.listeners[namespace].push({
                event: type,
                element: element,
                cancel: newCancel
            });
            return newCancel;
        }
        return cancel;
    }

    static __offAll(event, element) {
        const [type, namespace] = event.split('.');
        let matchFilter = listener => listener.event == type, defaultFilter = _ => _;
        if (element) matchFilter = l => l.event == type && l.element == element, defaultFilter = l => l.element == element;
        const listeners = this.listeners[namespace] || [];
        const list = type ? listeners.filter(matchFilter) : listeners.filter(defaultFilter);
        for (let c = 0; c < list.length; c++) list[c].cancel();
    }

    /**
     * This is similar to jQuery's `off` function and can *hopefully* be used in the same way.
     *
     * Rather than attempt to explain, I'll show some example usages.
     *
     * The following will remove a click listener called `onClick` (in the `myPlugin` namespace) from `element`.
     * `DOM.off(element, 'click.myPlugin', onClick);`
     *
     * The following will remove a click listener called `onClick` (in the `myPlugin` namespace) from `element` that only fired when the target is a `.block` element.
     * `DOM.off(element, 'click.myPlugin', '.block', onClick);`
     *
     * The following will remove a click listener (without namespace) from `element`.
     * `DOM.off(element, 'click', onClick);`
     *
     * The following will remove all listeners in namespace `myPlugin` from `element`.
     * `DOM.off(element, '.myPlugin');`
     *
     * The following will remove all click listeners in namespace `myPlugin` from *all elements*.
     * `DOM.off('click.myPlugin');`
     *
     * The following will remove all listeners in namespace `myPlugin` from *all elements*.
     * `DOM.off('.myPlugin');`
     *
     * @param {(Element|string)} element - Element to remove listener from
     * @param {string} [event] - Event to listen to with option namespace (e.g. 'event.namespace')
     * @param {(string|callable)} [delegate] - Selector to run on element to listen to
     * @param {callable} [callback] - Function to fire on event
     * @returns {Element} - The original element to allow for chaining
     */
    static off(element, event, delegate, callback) {
        if (typeof(element) == 'string') return this.__offAll(element);
        const [type, namespace] = event.split('.');
        if (namespace) return this.__offAll(event, element);

        const hasDelegate = delegate && callback;
        if (!callback) callback = delegate;
        const eventFunc = !hasDelegate ? callback : function(event) {
            if (event.target.matches(delegate)) {
                callback(event);
            }
        };

        element.removeEventListener(type, eventFunc);
        return element;
    }

    /**
     * Adds a listener for when the node is added/removed from the document body.
     * The listener is automatically removed upon firing.
     * @param {HTMLElement} node - node to wait for
     * @param {callable} callback - function to be performed on event
     * @param {boolean} onMount - determines if it should fire on Mount or on Unmount
     */
    static onMountChange(node, callback, onMount = true) {
        const wrappedCallback = () => {
            this.observer.unsubscribe(wrappedCallback);
            callback();
        };
        return this.observer.subscribe(wrappedCallback, mutation => {
            const nodes = Array.from(onMount ? mutation.addedNode : mutation.removedNodes);
            const directMatch = nodes.indexOf(node) > -1;
            const parentMatch = nodes.some(parent => parent.contains(node));
            return directMatch || parentMatch;
        });
    }

    /** Shorthand for {@link module:DOM.onMountChange} with third parameter `true` */
    static onMount(node, callback) { return this.onMountChange(node, callback); }

    /** Shorthand for {@link module:DOM.onMountChange} with third parameter `false` */
    static onUnmount(node, callback) { return this.onMountChange(node, callback, false); }

    /** Alias for {@link module:DOM.onMount} */
    static onAdded(node, callback) { return this.onMount(node, callback); }

    /** Alias for {@link module:DOM.onUnmount} */
    static onRemoved(node, callback) { return this.onUnmount(node, callback); }

}
