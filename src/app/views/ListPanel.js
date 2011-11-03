/**
 *    ActivitiesList.js
 *    	   
 *    Created by Jerzy Błaszczyk on 2011-09-10.
 *    Copyright 2011 Client and Friends. All rights reserved.
 **/

app.views.ListPanel = Ext.extend(Ext.Panel, {

	layout: 'fit',
	cls: 'list-panel',

	constructor: function(cfg) {
		console.log('List  CREATED');
		AOP.object(this, 'ListPanel');
		app.views.ListPanel.superclass.constructor.apply(this, arguments);
	},

	initComponent: function() {

		Ext.regModel('Contact', {
			fields: ['firstName', 'lastName']
		});

		var store = new Ext.data.JsonStore({
			model: 'Contact',
			sorters: 'lastName',

			getGroupString: function(record) {
				return record.get('lastName')[0];
			},

			data: [{
				firstName: 'Tommy',
				lastName: 'Maintz'
			},
			{
				firstName: 'Dave',
				lastName: 'Kaneda'
			},
			{
				firstName: 'Michael',
				lastName: 'Mullany'
			},
			{
				firstName: 'Abraham',
				lastName: 'Elias'
			},
			{
				firstName: 'Jay',
				lastName: 'Robinson'
			}]
		});

		this.list = new Ext.List({
			xtype: 'list',
			singleSelect: true,
			store: store,
			itemTpl: "{firstName} {lastName}",
			grouped: true,
			indexBar: true,
			listeners: {

				selectionchange: function(model, records) {

					var record = records[0];

					if (record) {
						Ext.dispatch({
							controller: app.currentTab.controller,
							action: 'showForm',
							record: record
						});
					}
				}
			}
		});

		this.items = [this.list];

		app.views.ListPanel.superclass.initComponent.apply(this, arguments);
	}
});

Ext.reg('listpanel', app.views.ListPanel);
