/**
 *  sqliteproxy.js	
 * 
 *  Local SQLite Proxy 
 *    
 *  Created by Jerzy Błaszczyk on 2011-10-28.
 *  Copyright 2011 Client and Friends. All rights reserved.
 */

Ext.ns('acrm.data');

/**
 *  Class for accesing data in SQLite Web SQL database
 *  @class acrm.data.Proxy
 */

acrm.data.Proxy = Ext.extend(Ext.data.Proxy, {

	/**
	 *  @type {String} version
	 *  Database version
	 */
	dbVersion: '1.0',

	/**
	 *  @type {String} dbName
	 *  Name of database
	 */
	dbName: undefined,

	/**
	 *  @type {String} dbDescription
	 *  Description of the database
	 */
	dbDescription: '',

	/**
	 *  @type {String} dbSize
	 *  Max storage size in bytes
	 */
	dbSize: 5 * 1024 * 1024,

	/**
	 *  @param {Object} config Configuration object
	 *  Constructor method
	 */
	constructor: function(config) {
		var me = this;

		this.addEvents('complete');

		Ext.data.Proxy.superclass.constructor.call(me, config);

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
			me.fireEvent('complete', me);
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
		return this.runOperation.apply(this, arguments);
	},

	/**
	 *  Prepare and run CRUD operation and call back passed function
	 *  @private
	 *  @param {Operation} operation (CRUD)
	 *  @callback {Function} callback function
	 *  @scope {Object} scope of callback function
	 */
	runOperation: function(operation, callback, scope) {
		var me = this;

		var records = (operation.records ? me.getFields(operation.records) : []),
			length = (records ? records.length : 0),
			count = length,
			id, record;

		var onSuccess = function() {
			count--;
			if (count <= 0) {
				operation.setCompleted();
				operation.setSuccessful();
				if (typeof callback == 'function') {
					callback.call(scope || me, operation);
				}
			}
		};

		operation.setStarted();

		if (operation.action === 'read') {
			me.readRecord(operation, onSuccess);
			return;
		}

		for (var i = 0; i < length; i++) {
			record = records[i];
			switch (operation.action) {
			case "create":
				me.createRecord(record, onSuccess);
				break;
			case "update":
				me.updateRecord(record, onSuccess);
				break;
			case "destroy":
				me.destroyRecord(record, onSuccess);
				break;
			};
		}
	},

	/**
	 *  Read all records from table
	 *  @private
	 *  @param {Ext.data.Model} record
	 *  @callback {Function} callback function
	 *  @scope {Object} scope of callback function
	 */
	readRecord: function(operation, callback) {
		var me = this;

		var tablename = me.getTableName(),
			sql = me.dbQuery || 'SELECT * FROM ' + tablename;

		var onSuccess = function(tx, results) {
			var records = [],
				storedatas = [],
				rows = results.rows;

			for (var i = 0; i < rows.length; i++) {
				records.push(rows.item(i));
			}

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

			if (typeof callback == 'function') {
				callback.call(me);
			}
		};

		var onError = function(tx, err) {
			me.throwDbError(tx, err);
		};

		me.queryDB(sql, onSuccess, onError);
	},

	/**
	 *  Saves the given record in the Proxy.
	 *  @param {Ext.data.Model} record the model instance
	 *  @param {Function} callback function
	 *  @private
	 */
	createRecord: function(record, callback) {
		var me = this,
			rawData = record.data,
			fields = [],
			values = [],
			placeholders = [],
			tablename = me.getTableName(),
			primarykey = me.getIdProperty(),
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

		for (var i in rawData) {
			if (rawData[i] !== undefined) {
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
	 *  Updates the given record.
	 *  @param {Ext.data.Model} record the model instance
	 *  @param {Function} callback function
	 *  @private
	 */
	updateRecord: function(record, callback) {
		var me = this,
			primarykey = me.getIdProperty(),
			id = record.get(primarykey),
			modifiedData = record.modified,
			newData = record.data,
			tablename = me.getTableName(),
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
		var sql = 'UPDATE ' + tablename + ' SET ' + pairs.join(',') + ' WHERE ' + primarykey + ' = ?';
		me.queryDB(sql, onSuccess, onError, values);
		return true;
	},

	/**
	 *  Physically removes a given record from the object store. 
	 *  @param {Ext.data.Model} record record to remove
	 *  @param {Function} callback function
	 *  @private
	 */
	destroyRecord: function(record, callback) {
		var me = this,
			tablename = me.getTableName(),
			primarykey = me.getIdProperty(),
			id = record.get(primarykey),
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
	 *  Get reader data and set up fields accordingly
	 *  Used for table creation only
	 *  @return {String} fields separated by a comma
	 *  @private
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
	 *  Function to return records converted to model fields. If model has fields
	 *  which is not table field name, it will break create and update functionalitites.
	 *  This looks for field property "isTableField"
	 *  @param {Array} records Array of records
	 *  @private
	 */
	getFields: function(records) {
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
	 *  Run SQL statement
	 *  @param {String} sql SQL statement
	 *  @param {Function} successcallback function to call after succesfull SQL operation
	 *  @param {Function} errorcallback function to call after error
	 *  @param {Array} params Array of parameters passed to SQL function (when used '?' placeholders)
	 */
	queryDB: function(sql, successcallback, errorcallback, params) {
		if (this.logSQL) console.log('SQLite: ' + sql + ' [' + (params || '') + ']');

		var me = this;

		me.db.transaction(function(tx) {
			tx.executeSql(
			sql, (params ? params : []), successcallback || Ext.emptyFn, errorcallback || Ext.emptyFn);
		});
	},

	/**
	 *  Output Query Error
	 *  @param {Object} tx Transaction
	 *  @param {Object} rs Response
	 */
	throwDbError: function(tx, err) {
		console.log('SQLite Proxy Error: ' + err.message);
	},

	/**
	 *  Destroys all records stored in the proxy 
	 *  @param {String} tablename Name of database table 
	 *  @callback {Function} callback function
	 *  @scope {Object} scope of callback function
	 */
	truncate: function(tablename, callback, scope) {
		var me = this,
			sql = 'DELETE FROM ' + tablename || me.dbTable;

		var onSuccess = function(tx, rs) {
			if (typeof callback == "function") {
				callback.call(scope || me, result);
			}
		};

		var onError = function(tx, err) {
			me.throwDbError(tx, err);
		};

		me.queryDB(sql, onSuccess, onError);
		return true;
	},

	/**
	 *  Get table name based on model name
	 */
	getTableName: function() {
		var me = this,
			model = me.getModel();

		if (!model) {
			throw 'No model associated with proxy - cannot determine database table name';
		}

		return model.modelName;
	},

	/**
	 *  Get id property name based on model idProperty field
	 */
	getIdProperty: function() {
		var me = this,
			model = me.getModel();

		if (!model) {
			throw 'No model associated with proxy - cannot determine id property';
		}

		return model.prototype.idProperty;
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
