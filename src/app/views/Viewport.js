/**
*    Viewport.js
*    	
*    Created by Jerzy Błaszczyk on 2011-09-01.
*    Copyright 2011 Client and Friends. All rights reserved.
**/

app.views.Viewport = Ext.extend(Ext.TabPanel, {

    fullscreen: true,
    layout: 'card',
    cardSwitchAnimation: 'slide',
    tabBar: {
        dock: 'bottom',
        ui: 'dark',
        layout: {
            pack: 'center'
        }
    },

    listeners: {
        scope: this,
        cardswitch: function(me, newTab, oldTab) {
            app.currentTab = newTab;
            if (oldTab) {
                oldTab.destroy();
            }
        }
    },

    initComponent: function() {

        app.views.firstTab = new app.views.Tab({
            name: 'FirstTab'
        });
        app.views.secondTab = new app.views.Tab({
            name: 'SecondTab'
        });

        AOP.object(app.views.firstTab);
        AOP.object(app.views.secondTab);

        this.items = [app.views.firstTab, app.views.secondTab];

        app.views.Viewport.superclass.initComponent.apply(this, arguments);

        app.currentTab = app.views.firstTab;
    }

});
