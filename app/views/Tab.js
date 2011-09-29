/**
*    Activities.js	
*    
*    Created by Jerzy Błaszczyk on 2011-09-01.
*    Copyright 2011 Client and Friends. All rights reserved.
**/

app.views.Tab = Ext.extend(Ext.Panel, {

    className: 'Tab',

    iconCls: 'time',
    title: 'Tab',
    layout: 'card',

    listeners: {
        scope: this,
        activate: function(tab) {
            console.log(tab.name + ' -> activate');
        },
        deactivate: function(tab) {
            console.log(tab.name + ' -> deactivate');
        }
    },

    initComponent: function() {

        this.controller = new app.controllers.Controller({
            name: 'Controller'
        });

        app.aop(this.controller);

        this.controller.setView(this);

        this.listPanel = new app.views.ListPanel({
            name: 'ListPanel'
        });

        app.aop(this.listPanel);

        this.items = [this.listPanel];

        app.views.Tab.superclass.initComponent.apply(this, arguments);
    }
});

Ext.reg('tabview', app.views.Tab);


