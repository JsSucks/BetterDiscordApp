const { Vuewrap } = require('betterdiscord/plugin-api');

module.exports = props => {
    return Vuewrap('somecomponent', {
        render: function (createElement) {
            return createElement('button', {
                class: 'exampleCustomElement',
                on: {
                    click: this.onClick
                }
            }, 'v');
        },
        props: ['onClick']
    }, props);
}
