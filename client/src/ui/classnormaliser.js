/**
 * BetterDiscord Class Normaliser
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Module, WebpackModules } from 'modules';

const normalizedPrefix = 'da';
const randClass = new RegExp(`^(?!${normalizedPrefix}-)((?:[A-Za-z]|[0-9]|-)+)-(?:[A-Za-z]|[0-9]|-|_){6}$`);

export default class ClassNormaliser extends Module {

    init() {
        this.patchClassModules(WebpackModules.getModule(this.moduleFilter.bind(this), false));
        this.normalizeElement(document.querySelector('#app-mount'));
    }

    patchClassModules(modules) {
        for (const module of modules) {
            this.patchClassModule(normalizedPrefix, module);
        }
    }

    shouldIgnore(value) {
        if (!isNaN(value)) return true;
        if (value.endsWith('px') || value.endsWith('ch') || value.endsWith('em') || value.endsWith('ms')) return true;
        if (value.startsWith('#') && (value.length == 7 || value.length == 4)) return true;
        if (value.includes('calc(') || value.includes('rgba')) return true;
        return false;
    }

    moduleFilter(module) {
        if (typeof module !== 'object' || Array.isArray(module)) return false;
        if (module.__esModule) return false;
        if (!Object.keys(module).length) return false;
        for (const baseClassName in module) {
            const value = module[baseClassName];
            if (typeof value !== 'string') return false;
            if (this.shouldIgnore(value)) continue;
            if (value.split('-').length === 1) return false;
            if (!randClass.test(value.split(' ')[0])) return false;
        }

        return true;
    }

    patchClassModule(componentName, classNames) {
        for (const baseClassName in classNames) {
            const value = classNames[baseClassName];
            if (this.shouldIgnore(value)) continue;
            const classList = value.split(' ');
            for (const normalClass of classList) {
                const match = normalClass.match(randClass)[1];
                if (!match) continue; // Shouldn't ever happen since they passed the moduleFilter, but you never know
                const camelCase = match.split('-').map((s, i) => i ? s[0].toUpperCase() + s.slice(1) : s).join('');
                classNames[baseClassName] += ` ${componentName}-${camelCase}`;
            }
        }
    }

    normalizeElement(element) {
        if (!(element instanceof Element)) return;

        const classes = element.classList;
        for (let c = 0, clen = classes.length; c < clen; c++) {
            if (!randClass.test(classes[c])) continue;
            const match = classes[c].match(randClass)[1];
            const newClass = match.split('-').map((s, i) => i ? s[0].toUpperCase() + s.slice(1) : s).join('');
            element.classList.add(`${normalizedPrefix}-${newClass}`);
        }

        for (const child of element.children) {
            this.normalizeElement(child);
        }
    }

}
