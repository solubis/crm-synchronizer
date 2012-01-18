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
	var idProperty = 'OBJECT_ID',
		user = undefined,
		initialized = false;

	// Database proxy configuration object 
	var dbConfig = {
		dbName: 'acrm',
		dbVersion: '1.00',
		dbDescription: 'Adaptive CRM Database',
		logSQL: false
	};

	var proxy = Ext.create('acrm.data.Proxy', dbConfig);

	/**
	 *  Register model 
	 *  @param {String} model name
	 *  @private
	 */
	var registerModel = function(modelname) {
		var cfg = {extend: 'Ext.data.Model'};

		if (acrm.data.Tables[modelname] === undefined) {
			throw new Error('Model not defined in models.js : ' + modelname);
		}

		cfg.idProperty = idProperty;
		Ext.apply(cfg, acrm.data.Tables[modelname]);
		Ext.apply(cfg, acrm.data.Associations[modelname]);
		cfg.proxy = new module.getProxy(modelname);

		Ext.define(modelname, cfg);
	};

	/**
	 *  Register all models from models.js 
	 *  @private
	 */
	var registerModels = function() {
		for (table in acrm.data.Tables) {
			if (acrm.data.Tables[table].fields) {
				registerModel(table);
			}
		}
	};

	var module = {

		/**
		 *  Initialize database access
		 */
		init: function() {
			console.log('Database module initialization');
			registerModels();
		},

		/**
		 *  Get user currently logged in  
		 *  @return {String}  User login
		 */
		getUser: function() {
			if (user === undefined) {
				throw 'User undefined - first set user by logging in';
			}
			return user;
		},

		/**
		 *  Set user currently logged in  
		 *  @param {String}  User login
		 */
		setUser: function(login) {
			user = login;
		},

		/**
		 *  Get database proxy instance  
		 *  @return {acrm.data.Proxy} Proxy instance
		 */
		getProxy: function(modelname) {
			var cfg = {};
			Ext.apply(cfg, dbConfig);
			if (modelname !== undefined) {
				cfg.name = modelname;
			} else {
				cfg.name = 'SQLiteProxy';
			}
			return new acrm.data.Proxy(cfg);
		},

		/**
		 *  Get model instance or register it if not found
		 *  @param {String} model name
		 *  @return {Ext.data.Model} model instance
		 */
		getModel: function(modelname) {
			var model;

			model = Ext.ModelMgr.getModel(modelname);

			if (model === undefined) {
				throw new Error('Model ' + modelname + ' not registered with Model Manager');
			}

			return model;
		},

		setLogging: function(flag) {
			console.log('Logging');
			dbConfig.logSQL = flag;
			proxy.logSQL = flag;
		},

		load: function(models, callback, scope) {
			var me = this;

			if (!Ext.isArray(models)) {
				models = [models];
			}

			var length = models.length,
				i, model, store, count = length;

			var onSuccess = function() {
				count--;
				if (count === 0) {
					if (typeof callback == 'function') {
						callback.call(scope || me);
					}
				}
			};

			for (var i = 0; i < length; i++) {
				model = models[i];
				store = me.getStore({
					model: model,
					pageSize: null
				});
				store.load(onSuccess);
			}
		},

		/**
		 *  Get store instance or register it if not found
		 *  @param {String} model name
		 *  @return {Ext.data.Store} store instance
		 */
		getStore: function(params) {
			var store, config;

			if (typeof params === "string") {
				params = {
					model: params
				};
			}

			if (!params.model) {
				throw new Error('You have to pass model name with store config');
			}

			store = Ext.StoreMgr.lookup(params.model);

			if (store == undefined) {
				config = {
					storeId: params.model,
					model: this.getModel(params.model)
				};
				Ext.apply(config, params);
				store = new Ext.data.Store(config);
				store.getProxy().setSQL(params.sql);
			}

			return store;
		},

		/**
		 *  Create database using generated schema DDL (ddl.js)  
		 *  @param {Function} callback function
		 *  @param {Object} scope of callback function 	
		 */
		createDatabase: function(callback, scope) {
			var me = this,
				ddl = acrm.data.DDL.ddlObjects,
				count = ddl.length;

			var onSuccess = function() {
				count--;
				if (count === 0) {
					proxy.fireEvent('complete', proxy);
					if (typeof callback == 'function') {
						callback.call(scope || me, "success");
					}
				}
			};

			var onError = function(tx, err) {
				proxy.throwDbError(tx, err);
			};

			for (var i = 0; i < ddl.length; i++) {
				proxy.runSQL(ddl[i].create, [], onSuccess, onError);
			};
		},

		/**
		 *  Drop database using generated schema DDL (ddl.js)  
		 *  @param {Function} callback function
		 *  @param {Object} scope of callback function 	
		 */
		dropDatabase: function(callback, scope) {
			var me = this,
				ddl = acrm.data.DDL.ddlObjects,
				count = ddl.length;

			var onSuccess = function() {
				count--;
				if (count === 0) {
					proxy.fireEvent('complete', proxy);
					if (typeof callback == 'function') {
						callback.call(scope || me, "success");
					}
				}
			};

			for (var i = 0; i < ddl.length; i++) {
				proxy.runSQL(ddl[i].drop, [], onSuccess, onSuccess);
			};
		},

		/**
		 *  Destroys all records stored in the proxy 
		 *  @param {String} tablename Name of database table 
		 *  @callback {Function} callback function
		 *  @scope {Object} scope of callback function
		 */
		truncateTable: function(tablename, callback, scope) {
			var me = this,
				sql = 'DELETE FROM ' + tablename;

			var onSuccess = function(tx, rs) {
				if (typeof callback == "function") {
					callback.call(scope || me, result);
				}
			};

			proxy.runSQL(sql, [], onSuccess);
			return true;
		},

		/**
		 *  Get number of records in table
		 *  @callback {Function} callback function
		 *  @scope {Object} scope of callback function
		 */
		getTableSize: function(tablename, callback, scope) {
			var me = this;

			var onSuccess = function(tx, rs) {
				var result = rs.rows.item(0)['COUNT(*)'];

				if (typeof callback == "function") {
					callback.call(scope || me, result);
				}
			};

			proxy.runSQL('SELECT COUNT(*) FROM ' + tablename, [], onSuccess);
		},
	};
	
	module.init();

	return module;
} ());
