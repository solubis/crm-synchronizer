/**
*    Controller.js
*    	  
*    Created by Jerzy Błaszczyk on 2011-09-01.
*    Copyright 2011 Client and Friends. All rights reserved.
**/


app.controllers.Controller = Ext.extend(Ext.Controller, {

    className: 'Controller',

    setView: function(view) {
	
        this.view = view;
    },

	showPreviousItem: function() {

        this.view.setActiveItem(this.view.getActiveItem().previousItem, {
            type: 'slide',
            direction: 'right'
        });
    },

    showItem: function(view, animation, direction) {

        view.previousItem = this.view.getActiveItem();

        this.view.setActiveItem(view, {
            type: animation,
            direction: direction
        });
    },

    showForm: function(options) {

        var record = options.record;

        if (!this.view.FormPanel) {
            this.view.FormPanel = new app.views.FormPanel({name: 'FormPanel'});
			app.aop(this.view.FormPanel);
        }

        this.view.FormPanel.updateWithRecord(record);
        this.showItem(this.view.FormPanel, 'slide', 'left');
    }
});