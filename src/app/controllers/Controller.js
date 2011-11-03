/**
*    Controller.js
*    	  
*    Created by Jerzy Błaszczyk on 2011-09-01.
*    Copyright 2011 Client and Friends. All rights reserved.
**/


app.controllers.Controller = Ext.extend(Ext.Controller, {

    className: 'Controller',

	constructor: function(view){
		if (view == undefined) {
			throw 'Controller must have view defined- pass it to Conroller constructor';
		}
		this.view = view;
		app.controllers.Controller.superclass.constructor.apply(this, arguments);
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
			AOP.object(this.view.FormPanel);
        }

        this.view.FormPanel.updateWithRecord(record);
        this.showItem(this.view.FormPanel, 'slide', 'left');
    }
});