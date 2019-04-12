/**
 * BetterDiscord Reflection Modules
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Utils, Filters } from 'common';
import Events from '../events';
import KnownModules from './knownmodules';

class Module {

    /**
     * Finds a module using a filter function.
     * @param {Function} filter A function to use to filter modules
     * @param {Boolean} first Whether to return only the first matching module
     * @param {Array} modules An array of modules to search in
     * @return {Any}
     */
    static getModule(filter, first = true, _modules) {
        const modules = _modules || this.getAllModules();
        const rm = [];
        for (const index in modules) {
            if (!modules.hasOwnProperty(index)) continue;
            const module = modules[index];
            const { exports } = module;
            let foundModule = null;

            if (!exports) continue;
            if (exports.__esModule && exports.default && filter(exports.default)) foundModule = exports.default;
            if (filter(exports)) foundModule = exports;
            if (!foundModule) continue;
            if (first) return foundModule;
            rm.push(foundModule);
        }
        return first ? undefined : rm;
    }

    /**
     * Finds a module by it's name.
     * @param {String} name The name of the module
     * @param {Function} fallback A function to use to filter modules if not finding a known module
     * @return {Any}
     */
    static byName(name, fallback) {
        if (Cache.hasOwnProperty(name)) return Cache[name];
        if (KnownModules.hasOwnProperty(name)) fallback = KnownModules[name];
        if (!fallback) return undefined;
        const module = this.getModule(fallback, true);
        return module ? Cache[name] = module : undefined;
    }

    /**
     * Finds a module by it's display name.
     * @param {String} name The display name of the module
     * @return {Any}
     */
    static byDisplayName(name) {
        return this.getModule(Filters.byDisplayName(name), true);
    }

    /**
     * Finds a module using it's code.
     * @param {RegEx} regex A regular expression to use to filter modules
     * @param {Boolean} first Whether to return the only the first matching module
     * @return {Any}
     */
    static byRegex(regex, first = true) {
        return this.getModule(Filters.byCode(regex), first);
    }

    /**
     * Finds the first module using properties on it's prototype.
     * @param {any} props Properties to use to filter modules
     * @return {Any}
     */
    static byPrototypes(...prototypes) {
        return this.getModule(Filters.byPrototypeFields(prototypes), true);
    }

    /**
     * Finds all modules using properties on it's prototype.
     * @param {any} props Properties to use to filter modules
     * @return {Any}
     */
    static allByPrototypes(...prototypes) {
        return this.getModule(Filters.byPrototypeFields(prototypes), false);
    }

    /**
     * Finds the first module using it's own properties.
     * @param {any} props Properties to use to filter modules
     * @return {Any}
     */
    static byProps(...props) {
        return this.getModule(Filters.byProperties(props), true);
    }

    /**
     * Finds all modules using it's own properties.
     * @param {any} props Properties to use to filter modules
     * @return {Any}
     */
    static allByProps(...props) {
        return this.getModule(Filters.byProperties(props), false);
    }

    /**
     * Discord's __webpack_require__ function.
     */
    static get require() {
        if (this._require) return this._require;

        const __webpack_require__ = this.getWebpackRequire();
        if (!__webpack_require__) return null;

        this.hookWebpackRequireCache(__webpack_require__);
        return this._require = __webpack_require__;
    }

    static getWebpackRequire() {
        const id = 'bd-webpackmodules';

        if (typeof window.webpackJsonp === 'function') {
            const __webpack_require__ = window['webpackJsonp']([], {
                [id]: (module, exports, __webpack_require__) => exports.default = __webpack_require__
            }, [id]).default;
            delete __webpack_require__.m[id];
            delete __webpack_require__.c[id];
            return __webpack_require__;
        } else if (window.webpackJsonp && window.webpackJsonp.push) {
            const __webpack_require__ = window['webpackJsonp'].push([[], {
                [id]: (module, exports, req) => exports.default = req
            }, [[id]]]).default;
            window['webpackJsonp'].pop();
            delete __webpack_require__.m[id];
            delete __webpack_require__.c[id];
            return __webpack_require__;
        }
    }

    static hookWebpackRequireCache(__webpack_require__) {
        __webpack_require__.c = new Proxy(__webpack_require__.c, {
            set(module_cache, module_id, module) {
                // Add it to our emitter cache and emit a module-loading event
                this.moduleLoading(module_id, module);
                Events.emit('module-loading', module);

                // Add the module to the cache as normal
                module_cache[module_id] = module;
            }
        });
    }

    static moduleLoading(module_id, module) {
        if (this.require.c[module_id]) return;

        if (!this.moduleLoadedEventTimeout) {
            this.moduleLoadedEventTimeout = setTimeout(() => {
                this.moduleLoadedEventTimeout = undefined;

                // Emit a module-loaded event for every module
                for (const module of this.modulesLoadingCache) {
                    Events.emit('module-loaded', module);
                }

                // Emit a modules-loaded event
                Events.emit('modules-loaded', this.modulesLoadingCache);

                this.modulesLoadedCache = [];
            }, 0);
        }

        // Add this to our own cache
        if (!this.modulesLoadingCache) this.modulesLoadingCache = [];
        this.modulesLoadingCache.push(module);
    }

    static waitForWebpackRequire() {
        return Utils.until(() => this.require, 10);
    }

    /**
     * Waits for a module to load.
     * This only returns a single module, as it can't guarentee there are no more modules that could
     * match the filter, which is pretty much what that would be asking for.
     * @param {Function} filter The name of a known module or a filter function
     * @return {Any}
     */
    static async waitForModule(filter) {
        const module = this.getModule(filter);
        if (module) return module;

        while (this.require.m.length > this.require.c.length) {
            const additionalModules = await Events.once('modules-loaded');

            const module = this.getModule(filter, true, additionalModules);
            if (module) return module;
        }

        throw new Error('All modules have now been loaded. None match the passed filter.');
    }

    /**
     * Finds a module by it's name.
     * @param {String} name The name of the module
     * @param {Function} fallback A function to use to filter modules if not finding a known module
     * @return {Any}
     */
    static async waitForModuleByName(name, fallback) {
        if (Cache.hasOwnProperty(name)) return Cache[name];
        if (KnownModules.hasOwnProperty(name)) fallback = KnownModules[name];
        if (!fallback) return undefined;
        const module = await this.waitForModule(fallback, true);
        return module ? Cache[name] = module : undefined;
    }

    static waitForModuleByDisplayName(props) {
        return this.waitForModule(Filters.byDisplayName(props));
    }
    static waitForModuleByRegex(props) {
        return this.waitForModule(Filters.byCode(props));
    }
    static waitForModuleByProps(props) {
        return this.waitForModule(Filters.byProperties(props));
    }
    static waitForModuleByPrototypes(props) {
        return this.waitForModule(Filters.byPrototypeFields(props));
    }

    /**
     * Returns all loaded modules.
     * @return {Array}
     */
    static getAllModules() {
        return this.require.c;
    }

    /**
     * Returns an array of known modules.
     * @return {Array}
     */
    static listKnownModules() {
        return Object.keys(KnownModules);
    }

    static get KnownModules() { return KnownModules }

}

const Modules = new Proxy(Module, {
    get(Module, name) {
        return Module.byName(name);
    }
});

export { Module, Modules }
