/**
 * BetterDiscord Plugin API
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { EmoteModule } from 'builtin';
import { SettingsSet, SettingsCategory, Setting, SettingsScheme, Screen } from 'structs';
import { BdMenu, Modals, DOM, DOMObserver, VueInjector, Toasts, Notifications, BdContextMenu, DiscordContextMenu, Tooltip } from 'ui';
import * as CommonComponents from 'commoncomponents';
import { default as Components } from '../ui/components/generic';
import { Utils, Filters, ClientLogger as Logger, ClientIPC, AsyncEventEmitter } from 'common';
import Settings from './settings';
import ExtModuleManager from './extmodulemanager';
import PluginManager from './pluginmanager';
import ThemeManager from './thememanager';
import Events from './events';
import EventsWrapper from './eventswrapper';
import Reflection from './reflection/index';
import DiscordApi from './discordapi';
import { ReactComponents, ReactHelpers } from './reactcomponents';
import { Patcher, MonkeyPatch } from './patcher';
import GlobalAc from '../ui/autocomplete';
import Vue from 'vue';
import path from 'path';
import Globals from './globals';
import { remote } from 'electron';

export default class PluginApi {

    constructor(pluginInfo, pluginPath) {
        this.pluginInfo = pluginInfo;
        this.pluginPath = pluginPath;

        this.Events = new EventsWrapper(Events);
        Utils.defineSoftGetter(this.Events, 'bind', () => this.plugin);

        this._menuItems = undefined;
        this._injectedStyles = undefined;
        this._modalStack = undefined;
    }

    get plugin() {
        return PluginManager.getPluginByPath(this.pluginPath);
    }

    async bridge(plugin_id) {
        const plugin = await PluginManager.waitForPlugin(plugin_id);
        return plugin.bridge;
    }

    get require() { return this.import }
    import(m) {
        const module = ExtModuleManager.findModule(m);
        if (module && module.__require) return module.__require;
        return null;
    }

    get Api() { return this }

    get AsyncEventEmitter() { return AsyncEventEmitter }
    get EventsWrapper() { return EventsWrapper }

    get CommonComponents() { return CommonComponents }
    get Components() { return Components }
    get Filters() { return Filters }
    get Discord() { return DiscordApi }
    get DiscordApi() { return DiscordApi }
    get ReactComponents() { return ReactComponents }
    get ReactHelpers() { return ReactHelpers }
    get Reflection() { return Reflection }
    get DOM() { return DOM }
    get VueInjector() { return VueInjector }
    get Screen() { return Screen }

    get observer() {
        return this._observer || (this._observer = new DOMObserver());
    }

    /**
     * Logger
     */

    get Logger() {
        return {
            log: (...message) => Logger.log(this.plugin.name, message),
            error: (...message) => Logger.err(this.plugin.name, message),
            err: (...message) => Logger.err(this.plugin.name, message),
            warn: (...message) => Logger.warn(this.plugin.name, message),
            info: (...message) => Logger.info(this.plugin.name, message),
            debug: (...message) => Logger.dbg(this.plugin.name, message),
            dbg: (...message) => Logger.dbg(this.plugin.name, message)
        };
    }

    /**
     * Utils
     */

    get Utils() {
        return {
            overload: (...args) => Utils.overload.apply(Utils, args),
            tryParseJson: (...args) => Utils.tryParseJson.apply(Utils, args),
            toCamelCase: (...args) => Utils.toCamelCase.apply(Utils, args),
            compare: (...args) => Utils.compare.apply(Utils, args),
            deepclone: (...args) => Utils.deepclone.apply(Utils, args),
            deepfreeze: (...args) => Utils.deepfreeze.apply(Utils, args),
            removeFromArray: (...args) => Utils.removeFromArray.apply(Utils, args),
            defineSoftGetter: (...args) => Utils.defineSoftGetter.apply(Utils, args),
            wait: (...args) => Utils.wait.apply(Utils, args),
            until: (...args) => Utils.until.apply(Utils, args),
            findInTree: (...args) => Utils.findInTree.apply(Utils, args),
            findInReactTree: (...args) => Utils.findInReactTree.apply(Utils, args),
            formatString: (...args) => Utils.formatString.apply(Utils, args),
            getNestedProp: (...args) => Utils.getNestedProp.apply(Utils, args),
            extend: (...args) => Utils.extend.apply(Utils, args),
            memoizeObject: (...args) => Utils.memoizeObject.apply(Utils, args),
            stableSort: (...args) => Utils.stableSort.apply(Utils, args)
        };
    }

    /**
     * Settings
     */

    createSettingsSet(args, ...merge) {
        return new SettingsSet(args || {}, ...merge);
    }
    createSettingsCategory(args, ...merge) {
        return new SettingsCategory(args, ...merge);
    }
    createSetting(args, ...merge) {
        return new Setting(args, ...merge);
    }
    createSettingsScheme(args) {
        return new SettingsScheme(args);
    }
    get Settings() {
        return {
            createSet: this.createSettingsSet.bind(this),
            createCategory: this.createSettingsCategory.bind(this),
            createSetting: this.createSetting.bind(this),
            createScheme: this.createSettingsScheme.bind(this)
        };
    }

    /**
     * InternalSettings
     */

    getInternalSetting(set, category, setting) {
        return Settings.get(set, category, setting);
    }
    get InternalSettings() {
        return {
            get: this.getInternalSetting.bind(this)
        };
    }

    /**
     * BdMenu
     */

    get BdMenu() {
        return {
            open: BdMenu.open.bind(BdMenu),
            close: BdMenu.close.bind(BdMenu),
            items: this.BdMenuItems,
            BdMenuItems: this.BdMenuItems
        };
    }

    /**
     * BdMenuItems
     */

    get menuItems() {
        return this._menuItems || (this._menuItems = []);
    }
    addMenuItem(item) {
        return BdMenu.items.add(item);
    }
    addMenuSettingsSet(category, set, text) {
        const item = BdMenu.items.addSettingsSet(category, set, text);
        return this.menuItems.push(item);
    }
    addMenuVueComponent(category, text, component) {
        const item = BdMenu.items.addVueComponent(category, text, component);
        return this.menuItems.push(item);
    }
    removeMenuItem(item) {
        BdMenu.items.remove(item);
        Utils.removeFromArray(this.menuItems, item);
    }
    removeAllMenuItems() {
        for (const item of this.menuItems)
            BdMenu.items.remove(item);
    }
    get BdMenuItems() {
        return Object.defineProperty({
            add: this.addMenuItem.bind(this),
            addSettingsSet: this.addMenuSettingsSet.bind(this),
            addVueComponent: this.addMenuVueComponent.bind(this),
            remove: this.removeMenuItem.bind(this),
            removeAll: this.removeAllMenuItems.bind(this)
        }, 'items', {
            get: () => this.menuItems
        });
    }

    /**
     * BdContextMenu
     */

    showContextMenu(event, groups) {
        BdContextMenu.show(event, groups);
        this.activeMenu.menu = BdContextMenu.activeMenu.menu;
    }
    get activeMenu() {
        return this._activeMenu || (this._activeMenu = { menu: null });
    }
    get BdContextMenu() {
        return Object.defineProperty({
            show: this.showContextMenu.bind(this)
        }, 'activeMenu', {
            get: () => this.activeMenu
        });
    }

    /**
     * CssUtils
     */

    get injectedStyles() {
        return this._injectedStyles || (this._injectedStyles = []);
    }
    compileSass(scss, options) {
        return ClientIPC.send('bd-compileSass', Object.assign({ data: scss }, options));
    }
    getConfigAsSCSS(settingsset) {
        return ThemeManager.getConfigAsSCSS(settingsset ? settingsset : this.plugin.settings);
    }
    getConfigAsSCSSMap(settingsset) {
        return ThemeManager.getConfigAsSCSSMap(settingsset ? settingsset : this.plugin.settings);
    }
    injectStyle(id, css) {
        if (id && !css) css = id, id = undefined;
        this.deleteStyle(id);
        const styleid = `plugin-${this.plugin.id}-${id}`;
        this.injectedStyles.push(id);
        DOM.injectStyle(css, styleid);
    }
    async injectSass(id, scss, options) {
        // In most cases a plugin's styles should be precompiled instead of using this
        if (id && !scss && !options) scss = id, id = undefined;
        const css = (await this.compileSass(scss, options)).css.toString();
        this.injectStyle(id, css, options);
    }
    deleteStyle(id) {
        const styleid = `plugin-${this.plugin.id}-${id}`;
        this.injectedStyles.splice(this.injectedStyles.indexOf(styleid), 1);
        DOM.deleteStyle(styleid);
    }
    deleteAllStyles(id) {
        for (const id of this.injectedStyles) {
            this.deleteStyle(id);
        }
    }
    get CssUtils() {
        return {
            compileSass: this.compileSass.bind(this),
            getConfigAsSCSS: this.getConfigAsSCSS.bind(this),
            getConfigAsSCSSMap: this.getConfigAsSCSSMap.bind(this),
            injectStyle: this.injectStyle.bind(this),
            injectSass: this.injectSass.bind(this),
            deleteStyle: this.deleteStyle.bind(this),
            deleteAllStyles: this.deleteAllStyles.bind(this)
        };
    }

    /**
     * Modals
     */

    get modalStack() {
        return this._modalStack || (this._modalStack = []);
    }
    addModal(_modal, component) {
        const modal = Modals.add(_modal, component);
        modal.on('close', () => Utils.removeFromArray(this.modalStack, modal));
        this.modalStack.push(modal);
        return modal;
    }
    closeModal(modal, force) {
        return Modals.close(modal, force);
    }
    closeAllModals(force) {
        const promises = [];
        for (const modal of this.modalStack)
            promises.push(modal.close(force));
        return Promise.all(promises);
    }
    closeLastModal(force) {
        if (!this.modalStack.length) return;
        return this.modalStack[this.modalStack.length - 1].close(force);
    }
    basicModal(title, text) {
        return this.addModal(Modals.createBasicModal(title, text));
    }
    settingsModal(settingsset, headertext, options) {
        return this.addModal(Modals.createSettingsModal(settingsset, headertext, options));
    }
    get Modals() {
        return Object.defineProperties({
            add: this.addModal.bind(this),
            close: this.closeModal.bind(this),
            closeAll: this.closeAllModals.bind(this),
            closeLast: this.closeLastModal.bind(this),
            basic: this.basicModal.bind(this),
            settings: this.settingsModal.bind(this)
        }, {
            stack: {
                get: () => this.modalStack
            },
            baseComponent: {
                get: () => Modals.baseComponent
            }
        });
    }

    /**
     * Toasts
     */

    showToast(message, options = {}) {
        return Toasts.push(message, options);
    }
    showSuccessToast(message, options = {}) {
        return Toasts.success(message, options);
    }
    showInfoToast(message, options = {}) {
        return Toasts.info(message, options);
    }
    showErrorToast(message, options = {}) {
        return Toasts.error(message, options);
    }
    showWarningToast(message, options = {}) {
        return Toasts.warning(message, options);
    }
    get Toasts() {
        return {
            push: this.showToast.bind(this),
            success: this.showSuccessToast.bind(this),
            error: this.showErrorToast.bind(this),
            info: this.showInfoToast.bind(this),
            warning: this.showWarningToast.bind(this),
            get enabled() { return Toasts.enabled }
        };
    }

    /**
     * Tooltips
     */

    addTooltip(node, text, options = {}) {
        return new Tooltip(node, text, options);
    }
    get Tooltip() {
        return Tooltip;
    }

    /**
     * Notifications
     */

    get notificationStack() {
        return this._notificationStack || (this._notificationStack = []);
    }
    addNotification(title, text, buttons = []) {
        if (arguments.length <= 1) text = title, title = undefined;
        if (arguments[1] instanceof Array) [text, buttons] = arguments, title = undefined;

        const notification = Notifications.add(title, text, buttons, () => Utils.removeFromArray(this.notificationStack, notification));
        this.notificationStack.push(notification);
        return notification;
    }
    dismissNotification(index) {
        index = Notifications.stack.indexOf(this.notificationStack[index]);
        if (index) Notifications.dismiss(index);
    }
    dismissAllNotifications() {
        for (const index in this.notificationStack) {
            this.dismissNotification(index);
        }
    }
    get Notifications() {
        return Object.defineProperty({
            add: this.addNotification.bind(this),
            dismiss: this.dismissNotification.bind(this),
            dismissAll: this.dismissAllNotifications.bind(this)
        }, 'stack', {
            get: () => this.notificationStack
        });
    }

    /**
     * Autocomplete
     */

    get autocompleteSets() {
        return this._autocompleteSets || (this._autocompleteSets = new Map());
    }
    addAutocompleteController(prefix, controller) {
        if (!controller) controller = this.plugin;
        if (GlobalAc.validPrefix(prefix)) return;
        GlobalAc.add(prefix, controller);
        this.autocompleteSets.set(prefix, controller);
    }
    removeAutocompleteController(prefix) {
        if (this.autocompleteSets.get(prefix) !== GlobalAc.sets.get(prefix)) return;
        GlobalAc.remove(prefix);
        this.autocompleteSets.delete(prefix);
    }
    removeAllAutocompleteControllers() {
        for (const [prefix] of this.autocompleteSets) {
            this.removeAutocompleteController(prefix);
        }
    }
    validAutocompletePrefix(prefix) {
        return GlobalAc.validPrefix(prefix);
    }
    toggleAutocompleteMode(prefix, sterm) {
        return GlobalAc.toggle(prefix, sterm);
    }
    searchAutocomplete(prefix, sterm) {
        return GlobalAc.items(prefix, sterm);
    }
    get Autocomplete() {
        return Object.defineProperty({
            add: this.addAutocompleteController.bind(this),
            remove: this.removeAutocompleteController.bind(this),
            removeAll: this.removeAllAutocompleteControllers.bind(this),
            validPrefix: this.validAutocompletePrefix.bind(this),
            toggle: this.toggleAutocompleteMode.bind(this),
            search: this.searchAutocomplete.bind(this)
        }, 'sets', {
            get: () => this.autocompleteSets
        });
    }

    /**
     * Emotes
     */

    get emotes() {
        return EmoteModule.database;
    }
    get favouriteEmotes() {
        return EmoteModule.favourites;
    }
    get mostUsedEmotes() {
        return EmoteModule.mostUsed;
    }
    setFavouriteEmote(emote, favourite) {
        return EmoteModule[favourite ? 'removeFavourite' : 'addFavourite'](emote);
    }
    addFavouriteEmote(emote) {
        return EmoteModule.addFavourite(emote);
    }
    removeFavouriteEmote(emote) {
        return EmoteModule.removeFavourite(emote);
    }
    isFavouriteEmote(emote) {
        return EmoteModule.isFavourite(emote);
    }
    getEmote(emote) {
        return EmoteModule.findByName(emote, true);
    }
    getEmoteUseCount(emote) {
        const mostUsed = EmoteModule.mostUsed.find(mu => mu.key === emote.name);
        return mostUsed ? mostUsed.useCount : 0;
    }
    incrementEmoteUseCount(emote) {
        return EmoteModule.addToMostUsed(emote);
    }
    searchEmotes(regex, limit) {
        return EmoteModule.search(regex, limit);
    }
    get Emotes() {
        return Object.defineProperties({
            setFavourite: this.setFavouriteEmote.bind(this),
            addFavourite: this.addFavouriteEmote.bind(this),
            removeFavourite: this.removeFavouriteEmote.bind(this),
            isFavourite: this.isFavouriteEmote.bind(this),
            getEmote: this.getEmote.bind(this),
            getUseCount: this.getEmoteUseCount.bind(this),
            incrementUseCount: this.incrementEmoteUseCount.bind(this),
            search: this.searchEmotes.bind(this)
        }, {
            emotes: {
                get: () => this.emotes
            },
            favourites: {
                get: () => this.favouriteEmotes
            },
            mostused: {
                get: () => this.mostUsedEmotes
            }
        });
    }

    /**
     * Plugins
     */

    async getPlugin(plugin_id) {
        // This should require extra permissions
        return PluginManager.waitForPlugin(plugin_id);
    }
    listPlugins() {
        return PluginManager.localContent.map(plugin => plugin.id);
    }
    get Plugins() {
        return {
            getPlugin: this.getPlugin.bind(this),
            listPlugins: this.listPlugins.bind(this)
        };
    }

    /**
     * Themes
     */

    async getTheme(theme_id) {
        // This should require extra permissions
        return ThemeManager.waitForContent(theme_id);
    }
    listThemes() {
        return ThemeManager.localContent.map(theme => theme.id);
    }
    get Themes() {
        return {
            getTheme: this.getTheme.bind(this),
            listThemes: this.listThemes.bind(this)
        };
    }

    /**
     * ExtModules
     */

    async getModule(module_id) {
        // This should require extra permissions
        return ExtModuleManager.waitForContent(module_id);
    }
    listModules() {
        return ExtModuleManager.localContent.map(module => module.id);
    }
    get ExtModules() {
        return {
            getModule: this.getModule.bind(this),
            listModules: this.listModules.bind(this)
        };
    }

    /**
     * NodeModules
     */

    getNodeModule(module_id) {
        return {}; // Don't give open access, when plugin permissions available remove this line
        // This should require extra permissions
        //return require(module_id);
    }
    listNodeModules() {
        return []; // Don't give open access, when plugin permissions available implement this properly
    }
    get NodeModules() {
        return {
            getModule: this.getNodeModule.bind(this),
            listModules: this.listNodeModules.bind(this)
            // path: path (Perhaps we add this stuff here as well)
        };
    }

    /**
     * Patcher
     */

    get patches() {
        return Patcher.getPatchesByCaller(this.plugin.id);
    }
    patchBefore(...args) { return this.pushChildPatch(...args, 'before') }
    patchAfter(...args) { return this.pushChildPatch(...args, 'after') }
    patchInstead(...args) { return this.pushChildPatch(...args, 'instead') }
    pushChildPatch(...args) {
        return Patcher.pushChildPatch(this.plugin.id, ...args);
    }
    unpatchAll(patches) {
        return Patcher.unpatchAll(patches || this.plugin.id);
    }
    get Patcher() {
        return Object.defineProperty({
            before: this.patchBefore.bind(this),
            after: this.patchAfter.bind(this),
            instead: this.patchInstead.bind(this),
            pushChildPatch: this.pushChildPatch.bind(this),
            unpatchAll: this.unpatchAll.bind(this),
            monkeyPatch: this.monkeyPatch.bind(this)
        }, 'patches', {
            get: () => this.patches
        });
    }
    get monkeyPatch() {
        return m => MonkeyPatch(this.plugin.id, m);
    }

    /**
     * DiscordContextMenu
     */

    get discordContextMenus() {
        return this._discordContextMenus || (this._discordContextMenus = []);
    }
    addDiscordContextMenu(items, filter) {
        const menu = DiscordContextMenu.add(items, filter);
        this.discordContextMenus.push(menu);
        return menu;
    }
    removeDiscordContextMenu(menu) {
        DiscordContextMenu.remove(menu);
        Utils.removeFromArray(this.discordContextMenus, menu);
    }
    removeAllDiscordContextMenus() {
        for (const menu of this.discordContextMenus) {
            this.removeDiscordContextMenu(menu);
        }
    }
    get DiscordContextMenu() {
        return Object.defineProperty({
            add: this.addDiscordContextMenu.bind(this),
            remove: this.removeDiscordContextMenu.bind(this),
            removeAll: this.removeAllDiscordContextMenus.bind(this)
        }, 'menus', {
            get: () => this.discordContextMenus
        });
    }

    Vuewrap(id, component, props) {
        return VueInjector.createReactElement(Vue.component(id, component), props);
    }

    /**
     * Adds a callback to a set of listeners for onSwitch.
     * @param {callable} callback - basic callback to happen on channel switch
     */
    static addOnSwitchListener(callback) {
        remote.getCurrentWebContents().on('did-navigate-in-page', callback);
    }

    /**
     * Removes the listener added by {@link addOnSwitchListener}.
     * @param {callable} callback - callback to remove from the listener list
     */
    static removeOnSwitchListener(callback) {
        remote.getCurrentWebContents().removeListener('did-navigate-in-page', callback);
    }

}

// Stop plugins from modifying the plugin API for all plugins
// Plugins can still modify their own plugin API object
Object.freeze(PluginApi);
Object.freeze(PluginApi.prototype);
