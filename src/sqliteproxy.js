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

	/**
	 * @cfg {String} dbTable
	 * Name for table where all the data will be stored
	 */
	dbTable: undefined,

	/**
	 * @cfg {String} db
	 * database connection object
	 */
	db: undefined,

	/**
	 * @cfg {String} idProperty
	 * Primary key column name   	   
	 */
	idProperty: 'OBJECT_ID',

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
	create: function(operation, callback, scope) {
		console.log("SQLite Proxy: create");
		var me = this;

		var records = me.getTableFields(operation.records),
			length = records.length,
			count = length,
			id, record, i, tbl_Id = me.getModel().idProperty || me.idProperty;

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
			me.setRecord(record, me.dbTable, tbl_Id, onSuccess);
		}
	},

	/**
	 * Saves the given record in the Proxy.
	 * @param {Ext.data.Model} record The model instance
	 */
	setRecord: function(record, tablename, primarykey, callback) {

		var me = this,
			rawData = record.data,
			fields = [],
			values = [],
			placeholders = [],
			id = me.getGUID();

		var onSuccess = function(tx, rs) {

			record.data[primarykey] = id;
			record.internalId = id;

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

	//inherit docs
	update: function(operation, callback, scope) {
		console.log("SQLite Proxy: update");

		var me = this;
		var records = me.getTableFields(operation.records),
			length = records.length,
			count = length,
			record, id, i, tbl_Id = me.getModel().idProperty || me.idProperty;

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
			me.updateRecord(record, me.dbTable, tbl_Id, onSuccess);
		}
	},

	//inherit docs
	read: function(operation, callback, scope) {
		console.log("SQLite Proxy: read");

		var me = this;

		var sql = me.dbQuery || 'SELECT * FROM ' + me.dbTable + '',
			params;

		var onSuccess = function(tx, results) {
			me.applyDataToModel(tx, results, operation, callback, scope);
		};

		var onError = function(tx, err) {
			me.throwDbError(tx, err);
		};

		me.queryDB(sql, onSuccess, onError);
	},

	//inherit docs
	destroy: function(operation, callback, scope) {
		console.log("SQLite Proxy: destroy");

		var me = this;
		var records = operation.records,
			length = records.length,
			count = length,
			i, tbl_Id = me.getModel().idProperty || me.idProperty;

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
			me.removeRecord(records[i].data[tbl_Id], me.dbTable, tbl_Id, onSuccess);
		}
	},

	/**
	 * @private
	 * Physically removes a given record from the object store. 
	 * @param {Mixed} id The id of the record to remove
	 */
	removeRecord: function(id, tablename, primarykey, callback) {
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
		var me = this;

		me.db.transaction(function(tx) {

			var onError = function(tx, err) {
				me.throwDbError(tx, err);
			};

			var onSucess = function(tx, results) {
				console.log("success");
			};

			var createTable = function() {
				var createsql = 'CREATE TABLE IF NOT EXISTS ' + me.dbTable + '(' + me.constructFields() + ')';
				console.log(createsql);
				tx.executeSql(createsql, [], onSucess, onError);
			};

			var tablesql = 'SELECT * FROM ' + me.dbTable + ' LIMIT 1';
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
		console.log('SQLite Proxy: ' + sql + ' [' + params + ']');

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
				me.setRecord(record, tablename, primarykey);
			}

			if (typeof callback == 'function') {
				callback.call(me);
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
	 * Destroys all records stored in the proxy 
	 */
	truncate: function(tablename) {
		var me = this,
			sql = 'DELETE FROM ' + tablename || me.dbTable;

		me.queryDB(sql);
		return true;
	},

	/**
	 * Create database using generated schema DDL (ddl.js)   	
	 */
	createDatabase: function() {
		var me = this,
			ddl = acrm.data.DDL.ddlObjects;

		var onError = function(tx, err) {
			me.throwDbError(tx, err);
		};

		for (var i = 0; i < ddl.length; i++) {
			console.log('[' + i + ']' + ' Creating ' + ddl[i].objectType + ' : ' + ddl[i].objectName);
			me.queryDB(ddl[i].objectDropScript, Ext.emptyFn, Ext.emptyFn);
			me.queryDB(ddl[i].objectCreateScript, Ext.emptyFn, onError);
		}
	},

	getTableSize: function(tablename) {
		var me = this;

		me.count = undefined;

		var onSuccess = function(tx, rs) {
			me.count = rs.rows.item(0)['COUNT(*)'];
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
Ext.override(Ext.data.Model, {

	destroy: function(options) {

		var me = this,
			action = 'destroy';
		options = options || {};
		Ext.apply(options, {
			records: [me],
			action: action
		});

		var operation = new Ext.data.Operation(options),
			successFn = options.success,
			failureFn = options.failure,
			callbackFn = options.callback,
			scope = options.scope,
			record;

		var callback = function(operation) {
			record = operation.getRecords()[0];
			if (operation.wasSuccessful()) {
				if (typeof successFn == 'function') {
					successFn.call(scope, record, operation);
				}
			} else {
				if (typeof failureFn == 'function') {
					failureFn.call(scope, record, operation);
				}
			}

			if (typeof callbackFn == 'function') {
				callbackFn.call(scope, record, operation);
			}
		};

		me.getProxy()[action](operation, callback, me);
		return me;
	}
});
