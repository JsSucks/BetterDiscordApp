const { React } = require('betterdiscord/plugin-api/reflection/modules');

module.exports = props => {
    return React.createElement(
        'button',
        { className: 'exampleCustomElement', onClick: props.onClick },
        'r'
    );
}
