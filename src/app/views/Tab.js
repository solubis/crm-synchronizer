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
			tab.add({
				xtype: 'listpanel'
			});
			tab.doLayout();
		},
		deactivate: function(tab) {
			console.log(tab.name + ' -> deactivate');
			tab.removeAll(true);
		}
	},

	constructor: function(cfg) {
		console.log('Tab ' + cfg.name + '  CREATED');
		AOP.object(this);
		app.views.Tab.superclass.constructor.apply(this, arguments);
	},

	initComponent: function() {

		this.controller = new app.controllers.Controller(this);

		app.views.Tab.superclass.initComponent.apply(this, arguments);
	}
});

Ext.reg('tabview', app.views.Tab);
