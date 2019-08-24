/*
 * BetterDiscord Context Menus
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Utils, ClientLogger as Logger } from 'common';
import { Reflection, MonkeyPatch } from 'modules';
import { VueInjector, Toasts } from 'ui';
import CMGroup from './components/contextmenu/Group.vue';

export class BdContextMenu {

    /**
     * Show a context menu
     * @param {MouseEvent|Object} e MouseEvent or Object { x: 0, y: 0 }
     * @param {Object[]} groups Groups of items to show in context menu
     */
    static show(e, groups) {
        const x = e.x || e.clientX;
        const y = e.y || e.clientY;
        this.activeMenu.menu = { x, y, groups };
    }

    static get activeMenu() {
        return this._activeMenu || (this._activeMenu = { menu: null });
    }

    static install(Vue) {
        Vue.directive('contextmenu', {
            bind(el, binding) {
                el.addEventListener('contextmenu', event => {
                    Logger.log('BdContextMenu', ['Showing context menu', event, el, binding]);
                    BdContextMenu.show(event, binding.value);
                });
            }
        });
    }

}

export class DiscordContextMenu {

    /**
     * add items to Discord context menu
     * @param {any} id unique id for group
     * @param {any} items items to add
     * @param {Function} [filter] filter function for target filtering
     */
    static add(items, filter) {
        if (!this.patched) this.patch();
        const menu = { items, filter };
        this.menus.push(menu);
        return menu;
    }

    static remove(menu) {
        Utils.removeFromArray(this.menus, menu);
    }

    static get menus() {
        return this._menus || (this._menus = []);
    }

    static async patch() {
        if (this.patched) return;
        this.patched = true;
        const self = this;
        MonkeyPatch('BD:DiscordCMOCM', Reflection.module.byProps('openContextMenu')).instead('openContextMenu', (_, [e, fn], originalFn) => {
            const overrideFn = function () {
                const res = fn.apply(this, arguments);
                if (!res.hasOwnProperty('type')) return res;
                if (!res.type.prototype || !res.type.prototype.render || res.type.prototype.render.__patched) return res;
                MonkeyPatch('BD:DiscordCMRender', res.type.prototype).after('render', (c, a, r) => self.renderCm(c, a, r, res));
                res.type.prototype.render.__patched = true;
                return res;
            }
            return originalFn(e, overrideFn);
        });
    }

    static renderCm(component, args, retVal, res) {
        if (!retVal.props || !retVal.props.style || !res.props) return;
        const { target } = component.props;
        const { top, left } = retVal.props.style;
        if (!target || !top || !left) return;
        if (!retVal.props.children) return;
        if (!(retVal.props.children instanceof Array)) retVal.props.children = [retVal.props.children];

        for (const menu of this.menus.filter(menu => !menu.filter || menu.filter(target))) {
            retVal.props.children.push(VueInjector.createReactElement(CMGroup, {
                target,
                top,
                left,
                closeMenu: () => Reflection.module.byProps('closeContextMenu').closeContextMenu(),
                items: typeof menu.items === 'function' ? menu.items(target) : menu.items
            }));
        }
    }

}
