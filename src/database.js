/**
 *  database.js
 *
 *  Database helper
 *  
 *  Copyright 2011 Client and Friends. All rights reserved.
 */

Ext.ns('acrm.data');

/**
 *  Helper singleton for accesing database structures: model, store, proxy
 */
acrm.data.Database = (function() {

	// Name of database column for primary key
	var idProperty = 'OBJECT_ID';
	var user = undefined;

	// Instance of database proxy object 
	var proxy = new acrm.data.Proxy({
		name: 'proxy',
		dbName: 'acrm',
		dbVersion: '1.00',
		dbDescription: 'Adaptive CRM Database'
	});

	/**
	 *  Register model 
	 *  @param {String} model name
	 *  @private
	 */
	var registerModel = function(modelname) {
		var cfg = {};

		cfg.idProperty = idProperty;
		cfg.fields = getModelFields(modelname);
		cfg.proxy = proxy;

		Ext.regModel(modelname, cfg);
	};

	/**
	 *  Read model fields from structures declared in 'models.js' file 
	 *  @param {String} model name
	 *  @private
	 */
	var getModelFields = function(modelname) {
		return acrm.data.Tables[modelname].fields;
	};

	var module = {

		/**
		 *  Get user currently logged in  
		 *  @return {String}  User login
		 */
		getUser: function(){
			
			if (user === undefined){
				throw 'User undefined - first set user by logging in';
			}
			
			return user;
		},
		
		/**
		 *  Set user currently logged in  
		 *  @param {String}  User login
		 */
		setUser: function(login){
			user = login;
		},
		
		/**
		 *  Get database proxy instance  
		 *  @return {acrm.data.Proxy} Proxy instance
		 */
		getProxy: function() {
			return proxy;
		},

		/**
		 *  Get model instance or register it if not found
		 *  @param {String} model name
		 *  @return {Ext.data.Model} model instance
		 */
		getModel: function(modelname) {
			var model;

			model = Ext.ModelMgr.getModel(modelname);

			if (model == undefined) {
				registerModel(modelname);
				model = Ext.ModelMgr.getModel(modelname);
			};

			return model;
		},

		/**
		 *  Get store instance or register it if not found
		 *  @param {String} model name
		 *  @return {Ext.data.Store} store instance
		 */
		getStore: function(modelname) {
			var store;

			store = Ext.StoreMgr.lookup(modelname);

			if (store == undefined) {
				store = new Ext.data.Store({
					storeId: modelname,
					model: this.getModel(modelname)
				});
			}
			return store;
		},
		
		/**
		 *  Create database using generated schema DDL (ddl.js)  
		 *  @param {Boolean} force If true database is always created without checking if exists
		 *  @param {Function} callback function
		 *  @param {Object} scope of callback function 	
		 */
		initDatabase: function(force, callback, scope) {
			var me = this,
				ddl = acrm.data.DDL.ddlObjects,
				count = ddl.length,
				proxy = me.getProxy();

			var onSuccess = function() {
				count--;
				if (count === 0) {
					proxy.fireEvent('complete', proxy);
					if (typeof callback == 'function') {
						callback.call(scope || me, "success");
					}
				}
			};

			var onSkip = function() {
				proxy.fireEvent('complete', proxy);
			};

			var onError = function(tx, err) {
				proxy.throwDbError(tx, err);
			};

			var createDatabase = function() {
				for (var i = 0; i < ddl.length; i++) {
					proxy.queryDB(ddl[i].drop, [], Ext.emptyFn, Ext.emptyFn);
					proxy.queryDB(ddl[i].create, [], onSuccess, onError);
				}
			}

			if (force) {
				createDatabase();
			} else {
				proxy.queryDB('SELECT * FROM PRODUCT LIMIT 1', [], onSkip, createDatabase);
			}
		}

	};

	return module;
}());
