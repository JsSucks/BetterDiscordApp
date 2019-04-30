/**
 * This is an example of how you should add custom elements instead of manipulating the DOM directly
 */

// Import custom components
const customVueComponent = require('./components/vuecomponent');
const customReactComponent = require('./components/reactcomponent');

module.exports = (Plugin, Api, Vendor) => {

    // Destructure some apis
    const { Logger, ReactComponents, Patcher, monkeyPatch, Reflection, Utils, CssUtils, VueInjector, Vuewrap, requireUncached } = Api;
    const { Vue } = Vendor;
    const { React } = Reflection.modules; // This should be in vendor

    return class extends Plugin {

        async onStart() {
            this.injectStyle();
            this.patchGuildTextChannel();
            this.patchMessages();
            return true;
        }

        async onStop() {
            // The automatic unpatcher is not there yet
            Patcher.unpatchAll();
            CssUtils.deleteAllStyles();

            // Force update elements to remove our changes
            const GuildTextChannel = await ReactComponents.getComponent('GuildTextChannel');
            GuildTextChannel.forceUpdateAll();
            const MessageContent = await ReactComponents.getComponent('MessageContent', { selector: Reflection.resolve('container', 'containerCozy', 'containerCompact', 'edited').selector }, m => m.defaultProps && m.defaultProps.hasOwnProperty('disableButtons'));
            MessageContent.forceUpdateAll();
            return true;
        }

        /* Inject some style for our custom element */
        async injectStyle() {
            const css = `
                .exampleCustomElement {
                    background: #7a7d82;
                    color: #FFF;
                    border-radius: 5px;
                    font-size: 12px;
                    font-weight: 600;
                    opacity: .5;
                    &:hover {
                        opacity: 1;
                    }
                }
                .exampleBtnGroup {
                    .bd-button {
                        font-size: 14px;
                        padding: 5px;
                    }
                }
                `;
            await CssUtils.injectSass(css);
        }

        async patchGuildTextChannel() {
            // Get the GuildTextChannel component and patch it's render function
            const GuildTextChannel = await ReactComponents.getComponent('GuildTextChannel');
            monkeyPatch(GuildTextChannel.component.prototype).after('render', this.injectCustomElements.bind(this));
            // Force update to see our changes immediatly
            GuildTextChannel.forceUpdateAll();
        }

        async patchMessages() {
            // Get Message component and patch it's render function
            const MessageContent = await ReactComponents.getComponent('MessageContent', { selector: Reflection.resolve('container', 'containerCozy', 'containerCompact', 'edited').selector });
            monkeyPatch(MessageContent.component.prototype).after('render', this.injectGenericComponents.bind(this));
            // Force update to see our changes immediatly
            MessageContent.forceUpdateAll();
        }

        /*
         * Injecting a custom React element using React.createElement
         * https://reactjs.org/docs/react-api.html#createelement
         * Injecting a custom Vue element using Vue.component
         * https://vuejs.org/v2/guide/render-function.html
         **/
        injectCustomElements(that, args, returnValue) {
            // Get the child we want using a treewalker since we know the child we want has a channel property and children.
            const child = Utils.findInReactTree(returnValue, filter => filter.hasOwnProperty('channel') && filter.children);
            if (!child) return;
            // If children is not an array make it into one
            if (!child.children instanceof Array) child.children = [child.children];

            // Add our custom components to children
            child.children.push(customReactComponent(React, { onClick: e => this.handleClick(e, child.channel) }));
            child.children.push(customVueComponent(Vuewrap, { onClick: e => this.handleClick(e, child.channel) }));
        }

        /**
         * Inject generic components provided by BD
         */
        injectGenericComponents(that, args, returnValue) {
            // If children is not an array make it into one
            if (!returnValue.props.children instanceof Array) returnValue.props.children = [returnValue.props.children];
            // Add a generic Button component provided by BD
            returnValue.props.children.push(Api.Components.ButtonGroup({
                class: [ 'exampleBtnGroup' ], // Additional classes for button group
                buttons: [
                    {
                        class: ['exampleBtn'], // Additional classes for button
                        text: 'Hello World!', // Text for button
                        onClick: e => Logger.log('Hello World!') // Button click handler
                    },
                    {
                        class: ['exampleBtn'],
                        text: 'Button',
                        onClick: e => Logger.log('Button!')
                    }
                ]
            }).render()); // Render will return the wrapped component that can then be displayed
        }

        /**
         * Will log the channel object
         */
        handleClick(e, channel) {
            Logger.log('Clicked!', channel);
        }
    }

};
