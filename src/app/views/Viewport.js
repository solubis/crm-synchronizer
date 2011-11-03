/**
 *    Viewport.js
 *    	
 *    Created by Jerzy Błaszczyk on 2011-09-01.
 *    Copyright 2011 Client and Friends. All rights reserved.
 **/

app.views.Viewport = Ext.extend(Ext.TabPanel, {

	className: 'Viewport',

	fullscreen: true,
	layout: 'card',
	cardSwitchAnimation: 'fade',
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
		}
	},

	initComponent: function() {

		AOP.object(this);

		app.views.firstTab = {xtype:'tabview'};//new app.views.Tab({name:1});
		app.views.secondTab = {xtype:'tabview'};//new app.views.Tab({name:2});

		this.items = [app.views.firstTab, app.views.secondTab, {xtype:'tabview'}, {xtype:'tabview'}, {xtype:'tabview'}, {xtype:'tabview'}, {xtype:'tabview'}];

		app.views.Viewport.superclass.initComponent.apply(this, arguments);

		app.currentTab = app.views.firstTab;
	}

});
