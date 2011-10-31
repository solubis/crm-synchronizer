/**
*    app.js	
*    
*    Created by Jerzy Błaszczyk on 2011-09-13.
*    Copyright 2011 Client and Friends. All rights reserved.
**/

Ext.regApplication({

    name: 'app',
    tabletStartupScreen: 'images/tablet_startup.png',
    phoneStartupScreen: 'images/phone_startup.png',
    icon: 'images/icon.png',
    glossOnIcon: true,

    launch: function() {

        this.launched = true;
        this.mainLaunch();
    },

    mainLaunch: function() {

        Ext.util.Format.defaultDateFormat = "F d, Y, h:i a";

        Ext.is.Phone = true;

        this.logging = false;
        this.openViewport();
    },

    openViewport: function() {

        this.viewport = new app.views.Viewport();
    },

    log: function(message) {
        if (this.logging) console.log(message);
    }
});