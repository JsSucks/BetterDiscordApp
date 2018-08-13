import { default as EmoteModule } from './EmoteModule';
import { default as ReactDevtoolsModule } from './ReactDevtoolsModule';
import { default as VueDevtoolsModule } from './VueDevToolsModule';
import { default as TrackingProtection } from './TrackingProtection';
import { default as E2EE } from './E2EE';

export default class {
    static initAll() {
        EmoteModule.init();
        ReactDevtoolsModule.init();
        VueDevtoolsModule.init();
        TrackingProtection.init();
        E2EE.init();
    }
}
