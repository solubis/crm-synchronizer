/**
 *    ActivityForm.js	
 *    
 *    Created by Jerzy Błaszczyk on 2011-09-01.
 *    Copyright 2011 Client and Friends. All rights reserved.
 **/

app.views.FormPanel = Ext.extend(Ext.form.FormPanel, {

	className: 'ActivityForm',

	iconCls: 'info',
	title: 'Activity',
	scroll: 'vertical',
	submitOnAction: false,

	initComponent: function() {

		AOP.object(this);

		this.dockedItems = [{
			xtype: 'toolbar',
			title: 'Edit Activity',
			items: [{
				text: 'Cancel',
				ui: 'back',
				scope: this,
				handler: function() {

					Ext.dispatch({
						controller: app.currentTab.controller,
						action: 'showPreviousItem'
					});
				}
			}]
		}];

		this.items = [{
			name: 'firstName',
			label: 'First Name',
			xtype: 'textfield'
		},
		{
			name: 'lastName',
			label: 'Last Name',
			xtype: 'textfield'
		}];

		app.views.FormPanel.superclass.initComponent.apply(this, arguments);
	},

	updateWithRecord: function(record) {

		this.load(record);
	}

});

Ext.reg('formpanel', app.views.FormPanel);
