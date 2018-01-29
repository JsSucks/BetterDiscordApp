/**
 * BetterDiscord Contributor Profile Badges
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { shell } = require('electron');

const $ = require('jquery');
const InjectorKit = require('injectorkit');
const { WebpackModules } = require('./webpackmodules');

const injectorkit = new InjectorKit('profilebadges');
injectorkit.start();

class ProfileBadges {

    constructor() {
        this.bd_badges = {
            developer: {
                '81388395867156480': 'Jiiks#5000',
                '125367412370440192': 'Pierce#1337',
                '98003542823944192': 'Pohky#1056',
                '249746236008169473': 'Zerebos#7790'
            },
            contributor: {
                '284056145272766465': 'Samuel Elliott#2764',
                '184021060562321419': 'Lilian Tedone#6223',
                '76052829285916672': 'samfun123#8972',
                '171005991272316937': 'samogot#4379'
            }
        };
        this.badge_actions = {
            developer: () => shell.openExternal('https://github.com/JsSucks/BetterDiscordApp'),
            contributor: () => shell.openExternal('https://github.com/JsSucks/BetterDiscordApp/graphs/contributors')
        };
        this.badge_tooltips = {
            developer: 'BetterDiscord developer',
            contributor: 'BetterDiscord contributor'
        };

        InjectorKit.elements.profilebadges_usermodal_defaultprofilebadges = '.modal-2LIEKY [class*="profileBadges-"]';

        // If any normal profile badges are loaded later, move things around so it works properly
        this.injectorkit.get('profilebadges-usermodal-defaultprofilebadges').callback((injection, $profilebadges) => {
            const $badgeswrap = $profilebadges.parent().find('.bd-profile-badges-wrap');
            if (!$badgeswrap.length) return;

            const $badges = $badgeswrap.find('.bd-profile-badges').detach();
            $badgeswrap.remove();

            $profilebadges.prepend($badges);
        });

        this.patchModuleInterval = setInterval(() => this.patchModule(), 100);
    }

    patchModule() {
        // Replace the UserProfileModals module's open function with our own
        // We need to do this to catch the user's ID
        // Otherwise we don't know who it is
        if (!this.UserProfileModals) return;
        console.log('Patched UserProfileModals module');
        this._originalOpenModal = this.UserProfileModals.open;
        this.UserProfileModals.open = user_id => this.openModal(user_id);
        clearInterval(this.patchModuleInterval);
    }

    openModal(user_id) {
        this._originalOpenModal.call(this.UserProfileModals, user_id);
        const that = this;

        this.injectorkit.get('modal').once((injection, $modal) => {
            // Cleanup incase a previous modal was open
            $modal.find('.bd-profile-badges-wrap, .bd-profile-badges').remove();

            const user_badges = this.getUserBadges(user_id);
            if (user_badges.length < 1) return;

            const $badges = $('<div></div>').addClass('bd-profile-badges');
            $.each(user_badges, (key, badge_type) => $('<div></div>').addClass('bd-profile-badge bd-profile-badge-' + badge_type).on('click', this.badge_actions[badge_type]).on('mouseover', function() {
                const $bdtooltips = $('bdtooltips');
                const $tooltip = $('<div class="bd-tooltip"></div>');
                $('<span class="bd-tooltip-inner"></span>').text(that.badge_tooltips[badge_type]).appendTo($tooltip);

                $(this).data('bd-tooltip', $tooltip.appendTo($bdtooltips));
                $tooltip.css({
                    top: $(this).offset().top - ($tooltip.outerHeight(true)),
                    left: $(this).offset().left - ($tooltip.outerWidth(true) / 2) + ($(this).width() / 2)
                });
            }).on('mouseout', function() {
                $(this).data('bd-tooltip').detach();
            }).appendTo($badges));

            const $header = $modal.find('[class*="headerInfo-"]');
            var $profilebadges = $header.find('[class*="profileBadges-"]');
            if (!$profilebadges.length) {
                // This user doesn't have any badges - or the profile badges container
                // Add it
                $profilebadges = $('<div></div>').addClass('bd-profile-badges-wrap').appendTo($header);
            }

            $profilebadges.prepend($badges);
        });
    }

    getUserBadges(user_id) {
        var badges = [], badge_type;
        for (badge_type in this.bd_badges) {
            if (this.bd_badges[badge_type][user_id])
                badges.push(badge_type);
        }
        return badges;
    }

    get injectorkit() {
        return injectorkit;
    }

    get UserProfileModals() {
        return WebpackModules.getModuleByProps(['fetchMutualFriends', 'setSection']);
    }

}

const instance = new ProfileBadges();
module.exports = { ProfileBadges: instance };
window.pb = instance;
