/**
*    database.js	
*    
*    Created by Jerzy Blaszczyk on 2011-11-09.
*    Copyright 2011 Client and Friends. All rights reserved.
*/


Ext.ns('acrm');

acrm.Database = {
	
	idProperty: 'OBJECT_ID',

	proxy: new acrm.data.Proxy({
		name: 'proxy',
		dbName: 'acrm',
		dbVersion: '1.00',
		dbDescription: 'Adaptive CRM Database'
	}),
	
	getProxy: function() {
		return this.proxy;
	},

	getModel: function(modelname) {
		var model;

		model = Ext.ModelMgr.getModel(modelname);

		if (model == undefined) {
			this.registerModel(modelname);
			model = Ext.ModelMgr.getModel(modelname);
		};
		
		return model;
	},

	getStore: function(storename) {
		var store;

		store = new Ext.data.Store({
			model: this.getModel(storename)
		});

		return store;
	},

	registerModel: function(tablename) {
		var cfg = {};
		
		cfg.idProperty = this.idProperty;
		cfg.fields = this.getModelFields(tablename);
		cfg.proxy = this.getProxy();
		
		Ext.regModel(tablename, cfg);
	},

	getModelFields: function(tablename) {
		return acrm.data.Tables[tablename].fields;
	}
}


