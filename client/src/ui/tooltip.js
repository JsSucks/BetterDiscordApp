/**
 * Tooltips that automatically show and hide themselves on mouseenter and mouseleave events.
 * Will also remove themselves if the node to watch is removed from DOM through
 * a DOMObserver.
 *
 * Note: This comes from Zerebos' library.
 *
 * @module Tooltip
 * @version 0.0.1
 */
import { Reflection } from 'modules';
import { Screen } from 'structs';
import DOM from './dom';

export default class Tooltip {
    /**
     *
     * @constructor
     * @param {HTMLElement} node - DOM node to monitor and show the tooltip on
     * @param {string} tip - string to show in the tooltip
     * @param {object} options - additional options for the tooltip
     * @param {string} [options.style=black] - correlates to the discord styling
     * @param {string} [options.side=top] - can be any of top, right, bottom, left
     * @param {boolean} [options.preventFlip=false] - prevents moving the tooltip to the opposite side if it is too big or goes offscreen
     * @param {boolean} [options.disabled=false] - whether the tooltip should be disabled from showing on hover
     */
    constructor(node, text, options = {}) {
        this.node = node;
        const {style = 'black', side = 'top', disabled = false} = options;
        this.label = text;
        this.style = style;
        this.side = side;
        this.disabled = disabled;
        this.id = Reflection.modules.KeyGenerator();
        this.hide = this.hide.bind(this);

        this.node.addEventListener('mouseenter', () => {
            if (this.disabled) return;
            this.show();
            DOM.onUnmount(this.node, this.hide);
        });

        this.node.addEventListener('mouseleave', () => {
            this.hide();
            DOM.observer.unsubscribe(this.hide);
        });
    }

    /**
     * Disabled the tooltip and prevents it from showing on hover.
     */
    disable() {
        this.disabled = true;
    }

    /**
     * Enables the tooltip and allows it to show on hover.
     */
    enable() {
        this.disabled = false;
    }

    /** Hides the tooltip. Automatically called on mouseleave. */
    hide() {
        Reflection.modules.Tooltips.hide(this.id);
    }

    /** Shows the tooltip. Automatically called on mouseenter. */
    show() {
        const {left, top, width, height} = this.node.getBoundingClientRect();
        Reflection.modules.Tooltips.show(this.id, {
            position: this.side,
            text: this.label,
            color: this.style,
            targetWidth: width,
            targetHeight: height,
            windowWidth: Screen.width,
            windowHeight: Screen.height,
            x: left,
            y: top
        });
    }
}