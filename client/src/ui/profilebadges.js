/**
 * BetterDiscord Developer/Contributor Profile Badges
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Module, ReactComponents, ReactHelpers, MonkeyPatch, Reflection } from 'modules';
import { ClientLogger as Logger } from 'common';
import { BdBadge } from './components/bd';
import VueInjector from './vueinjector';
import contributors from '../data/contributors';

export default class extends Module {

    init() {
        this.patchMessage();
        this.patchChannelMember();
        this.patchNameTag();
        this.patchUserProfileModal();
    }

    get contributors() {
        return contributors;
    }

    /**
     * Patches Message to render profile badges.
     */
    async patchMessage() {
        const Message = await ReactComponents.getComponent('Message');

        this.unpatchMessageRender = MonkeyPatch('ProfileBadges', Message.component.prototype).after('render', (component, args, retVal) => {
            if (!retVal.props || !retVal.props.children) return;
            if (ReactHelpers.findProp(component, 'jumpSequenceId') && ReactHelpers.findProp(component, 'canFlash')) retVal = retVal.props.children;

            const message = ReactHelpers.findProp(component, 'message');
            if (!message || !message.author) return;
            const user = message.author;
            const contributor = contributors.find(c => c.id === user.id);
            if (!contributor) return;

            const username = ReactHelpers.findByProp(retVal, 'type', 'h2');
            if (!username) return;

            username.props.children.splice(1, 0, VueInjector.createReactElement(BdBadge, {
                contributor,
                type: 'nametag'
            }));
        });

        // Rerender all messages
        Message.forceUpdateAll();
    }

    /**
     * Patches ChannelMember to use the extended NameTag.
     * This is because NameTag is also used in places we don't really want any badges.
     */
    async patchChannelMember() {
        const ChannelMember = await ReactComponents.getComponent('ChannelMember');

        this.unpatchChannelMemberRender = MonkeyPatch('ProfileBadges', ChannelMember.component.prototype).after('render', (component, args, retVal) => {
            if (!retVal.props || !retVal.props.children) return;

            const user = ReactHelpers.findProp(component, 'user');
            if (!user) return;
            const c = contributors.find(c => c.id === user.id);
            if (!c) return;

            const nameTag = retVal.props.children[1].props.children[0].props.children[0];
            nameTag.type = this.PatchedNameTag || nameTag.type;
        });

        // Rerender all channel members
        if (this.PatchedNameTag) {
            ChannelMember.forceUpdateAll();
        }
    }

    /**
     * Creates an extended NameTag component that renders message badges.
     */
    async patchNameTag() {
        if (this.PatchedNameTag) return this.PatchedNameTag;

        const NameTag = await ReactComponents.getComponent('NameTag');

        this.PatchedNameTag = function (props) {
            const retVal = NameTag.component.apply(this, arguments);
            try {
                if (!retVal.props || !retVal.props.children) return retVal;

                const user = ReactHelpers.findProp(props, 'user');
                if (!user) return retVal;
                const contributor = contributors.find(c => c.id === user.id);
                if (!contributor) return retVal;

                retVal.props.children.splice(1, 0, VueInjector.createReactElement(BdBadge, {
                    contributor,
                    type: 'nametag'
                }));
            } catch (err) {
                Logger.err('ProfileBadges', ['Error thrown while rendering a NameTag', err]);
            }
            return retVal;
        };

        // Rerender all channel members
        if (this.unpatchChannelMemberRender) {
            const ChannelMember = await ReactComponents.getComponent('ChannelMember');
            ChannelMember.forceUpdateAll();
        }

        return this.PatchedNameTag;
    }

    /**
     * Patches UserProfileModal to render profile badges.
     */
    async patchUserProfileModal() {
        const UserProfileModal = await ReactComponents.getComponent('UserProfileModal');

        this.unpatchUserProfileModal = MonkeyPatch('ProfileBadges', UserProfileModal.component.prototype).after('renderBadges', (component, args, retVal, setRetVal) => {
            const user = ReactHelpers.findProp(component, 'user');
            if (!user) return;
            const contributor = contributors.find(c => c.id === user.id);
            if (!contributor) return;

            const element = VueInjector.createReactElement(BdBadge, {
                contributor,
                type: 'profile-modal'
            });

            if (!retVal) {
                setRetVal(ReactHelpers.React.createElement('div', {
                    className: 'bd-profileBadgesWrap',
                    children: element
                }));
            } else retVal.props.children.splice(0, 0, element);
        });

        UserProfileModal.forceUpdateAll();
    }

}
