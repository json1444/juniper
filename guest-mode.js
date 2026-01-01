// guest-mode.js - SIMPLIFICADO

window.GuestMode = {
    isGuestUser: function() {
        return window.authManager ? window.authManager.isGuestUser() : false;
    },
    getGuestProfile: function() {
        return window.authManager ? window.authManager.getGuestProfile() : null;
    },
    initGuestMode: function() {
        console.log('GuestMode inicializado');
    },
    setupGuestLogin: function() {
        console.log('Guest login configurado');
    }
};