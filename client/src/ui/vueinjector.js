/**
 * BetterDiscord Vue Injector Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Reflection, ReactComponents } from 'modules';
import Vue from 'vue';

export default class {

    /**
     * Creates a new Vue object and mounts it in the passed element.
     * @param {HTMLElement} root The element to mount the new Vue object at
     * @param {Object} options Options to pass to Vue (see https://vuejs.org/v2/api/#Options-Data)
     * @param {BdNode} bdnode The element to append
     * @return {Vue}
     */
    static inject(root, options, bdnode) {
        if (bdnode) bdnode.appendTo(root);

        const vue = new Vue(options);

        vue.$mount(bdnode ? bdnode.element : root);
        return vue;
    }

    /**
     * Returns a React element that will render a Vue component.
     * @param {Object} component A Vue component to render
     * @param {Object} props Props to pass to the Vue component
     * @param {Boolean} mountAtTop Whether to mount the Vue component at the top of the React component instead of mounting it in a container
     * @return {React.Element}
     */
    static createReactElement(component, props, mountAtTop) {
        return Reflection.modules.React.createElement(this.ReactCompatibility, {component, mountAtTop, props});
    }

    static get ReactCompatibility() {
        const { React, ReactDOM } = Reflection.modules;

        /**
         * A React component that renders a Vue component.
         */
        const ReactCompatibility = class VueComponent extends React.Component {
            render() {
                return React.createElement('span', {className: 'bd-reactVueComponent'});
            }

            componentDidMount() {
                this.vueInstance.$mount(this.vueMount);
            }

            componentDidUpdate(oldProps) {
                if (oldProps.options && !this.props.options || !oldProps.options && this.props.options) {
                    this.vueInstance.$destroy();
                    delete this._vueInstance;
                }

                this.vueInstance.$mount(this.vueMount);
            }

            componentWillUnmount() {
                this.vueInstance.$destroy();
                delete this._vueInstance;
            }

            get vueMount() {
                const element = ReactDOM.findDOMNode(this);
                if (!element) return null;
                if (this.props.mountAtTop) return element;
                if (element.firstChild) return element.firstChild;
                const newElement = document.createElement('span');
                element.appendChild(newElement);
                return newElement;
            }

            get vueInstance() {
                return this._vueInstance || (this._vueInstance = new Vue(this.props.options || {
                    data: this.props,
                    render(createElement) {
                        return createElement(this.component, {
                            props: this.props
                        });
                    }
                }));
            }
        };

        // Add a name for ReactComponents
        ReactCompatibility.displayName = 'BD.VueComponent';
        ReactCompatibility[ReactComponents.ReactComponent.important] = {selector: '.bd-reactVueComponent'};

        return Object.defineProperty(this, 'ReactCompatibility', {value: ReactCompatibility}).ReactCompatibility;
    }

    static install(Vue) {
        Vue.component('ReactComponent', ReactComponent);
    }

}

/**
 * A Vue component that renders a React component.
 */
export const ReactComponent = {
    props: ['component', 'component-props', 'component-children', 'react-element'],
    render(createElement) {
        return createElement('div');
    },
    mounted() {
        const { React, ReactDOM } = Reflection.modules;

        ReactDOM.unmountComponentAtNode(this.$el);
        ReactDOM.render(this.reactElement || React.createElement(this.component, this.componentProps, ...(this.componentChildren || [])), this.$el);
    },
    beforeDestroy() {
        Reflection.modules.ReactDOM.unmountComponentAtNode(this.$el);
    }
};
