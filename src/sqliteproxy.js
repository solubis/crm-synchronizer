/**
 *    sqliteproxy.js	
 *    
 *    Created by Jerzy Błaszczyk on 2011-10-28.
 *    Copyright 2011 Client and Friends. All rights reserved.
 */

Ext.ns('acrm.data');

acrm.data.Proxy = Ext.extend(Ext.data.Proxy, {

	/**
	 * @cfg {String} version
	 * Database version
	 */
	dbVersion: '1.0',

	/**
	 * @cfg {String} dbName
	 * Name of database
	 */
	dbName: undefined,

	/**
	 * @cfg {String} dbDescription
	 * Description of the database
	 */
	dbDescription: '',

	/**
	 * @cfg {String} dbSize
	 * Max storage size in bytes
	 */
	dbSize: 5 * 1024 * 1024,

	constructor: function(config) {
		var me = this;

		this.addEvents('aftersync');

		Ext.data.Proxy.superclass.constructor.call(me, config);

		me.connect();
		//me.createTable();
	},

	connect: function() {
		var me = this;
		me.db = openDatabase(me.dbName, me.dbVersion, me.dbDescription, me.dbSize);
	},

	//inherit docs
	batch: function(operations, listeners) {
		var me = this;

		var batch = new Ext.data.Batch({
			proxy: me,
			listeners: listeners || {}
		});

		Ext.each(me.batchOrder.split(','), function(action) {
			if (operations[action]) {
				batch.add(new Ext.data.Operation({
					action: action,
					records: operations[action]
				}));
			}
		},
		me);

		batch.on('complete', function() {
			me.fireEvent('aftersync', me);
		},
		me);

		batch.start();

		return batch;
	},

	//inherit docs
	create: function() {
		return this.runOperation.apply(this, arguments);
	},

	//inherit docs
	update: function() {
		return this.runOperation.apply(this, arguments);
	},

	//inherit docs
	destroy: function(operation, callback, scope) {
		return this.runOperation.apply(this, arguments);
	},

	//inherit docs
	read: function(operation, callback, scope) {
		
		if (operation.id) {
			throw 'Reading single record is not implemented';
		}
		
		var me = this;

		var sql = me.dbQuery || 'SELECT * FROM ' + me.getTableName() + '',
			params;

		var onSuccess = function(tx, results) {
			me.applyDataToModel(tx, results, operation, callback, scope);
		};

		var onError = function(tx, err) {
			me.throwDbError(tx, err);
		};

		me.queryDB(sql, onSuccess, onError);
	},

	runOperation: function(operation, callback, scope) {
		var me = this;

		var records = me.getTableFields(operation.records),
			length = records.length,
			count = length,
			id, record, i, idProperty = me.getIdProperty(),
			dbTable = me.getTableName();

		var onSuccess = function() {
			count--;
			if (count === 0) {
				operation.setCompleted();
				operation.setSuccessful();
				if (typeof callback == 'function') {
					callback.call(scope || me, operation);
				}
			}
		};

		operation.setStarted();

		for (i = 0; i < length; i++) {
			record = records[i];
			switch (operation.action) {
			case "create":
				me.createRecord(record, dbTable, idProperty, onSuccess);
				break;
			case "update":
				me.updateRecord(record, dbTable, idProperty, onSuccess);
				break;
			case "destroy":
				me.destroyRecord(record.data[idProperty], dbTable, idProperty, onSuccess);
				break;
			};
		}
	},

	/**
	 * Saves the given record in the Proxy.
	 * @param {Ext.data.Model} record The model instance
	 */
	createRecord: function(record, tablename, primarykey, callback) {
		var me = this,
			rawData = record.data,
			fields = [],
			values = [],
			placeholders = [],
			id = me.getGUID();

		var onSuccess = function(tx, rs) {
			record.data[primarykey] = id;

			if (typeof callback == 'function') {
				callback.call(me);
			}
		};

		var onError = function(tx, err) {
			me.throwDbError(tx, err);
		};

		fields.push(primarykey);
		placeholders.push('?');
		values.push(id);

		//extract data to be inserted
		for (var i in rawData) {
			if (rawData[i]) {
				fields.push(i);
				values.push(rawData[i]);
				placeholders.push('?');
			}
		}

		var sql = 'INSERT INTO ' + tablename + '(' + fields.join(',') + ') VALUES (' + placeholders.join(',') + ')';
		me.queryDB(sql, onSuccess, onError, values);

		return true;
	},

	/**
	 * Updates the given record.
	 * @param {Ext.data.Model} record The model instance
	 */
	updateRecord: function(record, tablename, primarykey, callback) {
		var me = this,
			id = record.get(primarykey),
			key = primarykey,
			modifiedData = record.modified,
			newData = record.data,
			pairs = [],
			values = [];

		var onSuccess = function(tx, rs) {

			//add new record if id doesn't exist
			if (rs.rowsAffected == 0) {
				me.createRecord(record, tablename, primarykey, callback);
			} else {

				if (typeof callback == 'function') {
					callback.call(me);
				}
			}
		};

		var onError = function(tx, err) {
			me.throwDbError(tx, err);
		};

		for (var i in newData) {
			if (i != primarykey) {
				pairs.push(i + ' = ?');
				values.push(newData[i]);
			}
		};

		values.push(id);
		var sql = 'UPDATE ' + tablename + ' SET ' + pairs.join(',') + ' WHERE ' + key + ' = ?';
		me.queryDB(sql, onSuccess, onError, values);
		return true;
	},

	/**
	 * @private
	 * Physically removes a given record from the object store. 
	 * @param {Mixed} id The id of the record to remove
	 */
	destroyRecord: function(id, tablename, primarykey, callback) {
		var me = this,
			values = [];

		var onSuccess = function(tx, rs) {
			if (typeof callback == 'function') {
				callback.call(me);
			}
		};

		var onError = function(tx, err) {
			me.throwDbError(tx, err);
		};

		var sql = 'DELETE FROM ' + tablename + ' WHERE ' + primarykey + ' = ?';
		values.push(id);
		me.queryDB(sql, onSuccess, onError, values);
		return true;
	},

	/**
	 *@private
	 *Creates table if not exists
	 */
	createTable: function() {
		var me = this,
			dbTable = me.getTableName();

		me.db.transaction(function(tx) {

			var onError = function(tx, err) {
				me.throwDbError(tx, err);
			};

			var onSucess = function(tx, results) {};

			var createTable = function() {
				var createsql = 'CREATE TABLE IF NOT EXISTS ' + dbTable + '(' + me.constructFields() + ')';
				console.log(createsql);
				tx.executeSql(createsql, [], onSucess, onError);
			};

			var tablesql = 'SELECT * FROM ' + dbTable + ' LIMIT 1';
			tx.executeSql(tablesql, [], Ext.emptyFn, createTable);
		});

	},

	/**
	 * @private
	 * Get reader data and set up fields accordingly
	 * Used for table creation only
	 * @return {String} fields separated by a comma
	 */
	constructFields: function() {
		var me = this,
			m = me.getModel(),
			fields = m.prototype.fields.items,
			flatFields = [];

		Ext.each(fields, function(f) {
			if (f.isTableField || !Ext.isDefined(f.isTableField)) {
				var name = f.name;
				var type = f.type.type;
				var fieldoption = (f.fieldOption) ? f.fieldOption : '';

				type = type.replace(/int/i, 'INTEGER').replace(/string/i, 'TEXT').replace(/date/i, 'DATETIME');

				flatFields.push(name + ' ' + type + ' ' + fieldoption);
			}
		});

		return flatFields.join(',');
	},

	/**
	 * Function to return records w.r.t to table fields. If model has fields
	 * which is not table field name, it will break create and update functionalitites.
	 * This looks for field property "isTableField"
	 */
	getTableFields: function(records) {
		var me = this;
		var newrecords = [],
			removedField = [],
			length = records.length,
			m = me.getModel(),
			modelFields = m.prototype.fields.items;

		Ext.each(modelFields, function(item, index) {
			if (item.isTableField == false) {
				removedField.push(item.name);
			}
		});

		for (var i = 0; i < length; i++) {
			var record = records[i];
			Ext.each(removedField, function(item, index) {
				delete record.data[item];
			});
			newrecords.push(record);
		}
		return newrecords;
	},

	/**	
	 * Run SQL statement
	 */
	queryDB: function(sql, successcallback, errorcallback, params) {
		console.log('SQLite: ' + sql + ' [' + (params || '') + ']');

		var me = this;

		me.db.transaction(function(tx) {
			tx.executeSql(
			sql, (params ? params : []), successcallback || Ext.emptyFn, errorcallback || Ext.emptyFn);
		});
	},

	/**
	 * @private
	 * Created array of objects, each representing field=>value pair.
	 * @param {Object} tx Transaction
	 * @param {Object} rs Response
	 * @return {Array} Returns parsed data
	 */
	parseData: function(tx, rs) {
		var rows = rs.rows,
			data = [],
			i = 0;

		for (; i < rows.length; i++) {
			data.push(rows.item(i));
		}
		return data;
	},

	/**	
	 * @private
	 * Convert results from SQL query to model structure
	 */
	applyDataToModel: function(tx, results, operation, callback, scope) {
		var me = this;
		var records = me.parseData(tx, results);
		var storedatas = [];

		if (results.rows && records.length) {
			for (var i = 0; i < results.rows.length; i++) {
				var storedata = new me.model(records[i]);
				storedatas.push(storedata);
			}
		}

		operation.resultSet = new Ext.data.ResultSet({
			records: storedatas,
			total: storedatas.length,
			loaded: true
		});

		operation.setSuccessful();
		operation.setCompleted();

		//finish with callback
		if (typeof callback == "function") {
			callback.call(scope || me, operation);
		}
	},

	/**
	 * Output Query Error
	 * @param {Object} tx Transaction
	 * @param {Object} rs Response
	 */
	throwDbError: function(tx, err) {
		console.log('SQLite Proxy Error: ' + err.message);
	},

	/**
	 * Destroys all records stored in the proxy 
	 */
	truncate: function(tablename) {
		var me = this,
			sql = 'DELETE FROM ' + tablename || me.dbTable;

		me.queryDB(sql);
		return true;
	},

	getTableName: function() {
		var me = this,
			model = me.getModel();

		if (!model) {
			throw 'No model associated with proxy - cannot determine database table name';
		}

		return model.modelName;
	},

	getIdProperty: function() {
		var me = this,
			model = me.getModel();

		if (!model) {
			throw 'No model associated with proxy - cannot determine id property';
		}

		return model.prototype.idProperty;
	},

	/**
	 * Create database using generated schema DDL (ddl.js)   	
	 */
	initDatabase: function() {
		var me = this,
			ddl = acrm.data.DDL.ddlObjects;

		var onError = function(tx, err) {
			me.throwDbError(tx, err);
		};

		var createDatabase = function() {
			for (var i = 0; i < ddl.length; i++) {
				console.log('[' + i + ']' + ' Creating ' + ddl[i].objectType + ' : ' + ddl[i].objectName);
				me.queryDB(ddl[i].objectDropScript, Ext.emptyFn, Ext.emptyFn);
				me.queryDB(ddl[i].objectCreateScript, Ext.emptyFn, onError);
			}
		}

		me.queryDB('SELECT * FROM PRODUCT LIMIT 1', Ext.emptyFn, createDatabase);
	},

	getTableSize: function(tablename, callback, scope) {
		var me = this;

		var onSuccess = function(tx, rs) {
			var result = rs.rows.item(0)['COUNT(*)'];

			//finish with callback
			if (typeof callback == "function") {
				callback.call(scope || me, result);
			}
		};

		var onError = function(tx, err) {
			me.throwDbError(tx, err);
		};

		me.queryDB('SELECT COUNT(*) FROM ' + tablename, onSuccess, onError);
	},

	/**	
	 * Helper function for generating GUID   
	 */
	getRandomString: function() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	},

	/**	
	 * Generate GUID   
	 */
	getGUID: function() {
		var me = this;

		return (me.getRandomString() + me.getRandomString() + "-" + me.getRandomString() + "-" + me.getRandomString() + "-" + me.getRandomString() + "-" + me.getRandomString() + me.getRandomString() + me.getRandomString()).toUpperCase();
	}

});

Ext.data.ProxyMgr.registerType("sqlitestorage", acrm.data.Proxy);

/**
 * Override Models' destroy function to make success and   	
 * failure functions work   
 */
// Ext.override(Ext.data.Model, {
// 
// 	destroy: function(options) {
// 
// 		var me = this,
// 			action = 'destroy';
// 		options = options || {};
// 		Ext.apply(options, {
// 			records: [me],
// 			action: action
// 		});
// 
// 		var operation = new Ext.data.Operation(options),
// 			successFn = options.success,
// 			failureFn = options.failure,
// 			callbackFn = options.callback,
// 			scope = options.scope,
// 			record;
// 
// 		var callback = function(operation) {
// 			record = operation.getRecords()[0];
// 			if (operation.wasSuccessful()) {
// 				if (typeof successFn == 'function') {
// 					successFn.call(scope, record, operation);
// 				}
// 			} else {
// 				if (typeof failureFn == 'function') {
// 					failureFn.call(scope, record, operation);
// 				}
// 			}
// 
// 			if (typeof callbackFn == 'function') {
// 				callbackFn.call(scope, record, operation);
// 			}
// 		};
// 
// 		me.getProxy()[action](operation, callback, me);
// 		return me;
// 	}
// });
