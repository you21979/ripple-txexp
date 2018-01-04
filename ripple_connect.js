'use strict'; 
const RippleAPI = require('ripple-lib').RippleAPI;

const createRipple = (uri, closeHandler) => {
    const api = new RippleAPI({server: uri});
    api.on('connected', () => {
        console.log('Connection is open now.');
    });
    api.on('disconnected', (code) => {
        if (code !== 1000) {
            console.log('Connection is closed due to error.');
        } else {
            console.log('Connection is closed normally.');
        }
        closeHandler(code)
    });
    return api
}

module.exports = createRipple
