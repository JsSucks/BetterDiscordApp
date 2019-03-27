module.exports = class {

    constructor() {
        console.warn('[Example Module] Using deprecated synchronous API');
    }

    get foo() {
        return 'Bar';
    }

    add(i1, i2) {
        return i1 + i2;
    }

}
