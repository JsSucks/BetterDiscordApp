const Plugin = require('betterdiscord/plugin');

module.exports = class extends Plugin {
    onStart() {
        document.addEventListener('dblclick', this.handler);
        return true;
    }

    onStop() {
        document.removeEventListener('dblclick', this.handler);
        return true;
    }

    handler(e) {
        const message = e.target.closest('[class^=messageCozy]') || e.target.closest('[class^=messageCompact]');
        if (!message) return;
        const btn = message.querySelector('[class^=buttonContainer] [class^=button-]');
        if (!btn) return;
        btn.click();
        const popup = document.querySelector('[class^=container][role=menu]');
        if (!popup) return;
        const rii = popup[Object.keys(popup).find(k => k.startsWith('__reactInternal'))];
        if (!rii || !rii.memoizedProps || !rii.memoizedProps.children || !rii.memoizedProps.children[1] || !rii.memoizedProps.children[1].props || !rii.memoizedProps.children[1].props.onClick) return;
        rii.memoizedProps.children[1].props.onClick();
    }
}
