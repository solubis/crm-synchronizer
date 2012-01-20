/**
 *  sqliteproxy.js	
 * 
 *  Local SQLite Proxy 
 *    
 *  Created by Jerzy Błaszczyk on 2011-10-28.
 *  Copyright 2011 Client and Friends. All rights reserved.
 */

Ext.ns('solubis.data');

/**
 *  Class for accesing data in SQLite Web SQL database
 *  @class solubis.data.Proxy
 */

Ext.define('solubis.data.Proxy', {
	extend: 'Ext.data.Proxy', 
	xtype: 'sqliteproxy',

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
	
	logSQL: false,

	/**
	 *  @param {Object} config Configuration object
	 *  Constructor method
	 */
	constructor: function(config) {
		var me = this;

		//this.addEvents('updated');

		this.callParent(arguments);

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
			me.fireEvent('updated', me);
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
				console.log('operation completed : ' + operation.action + ' ' + operation.id);
				operation.setCompleted();
				operation.setSuccessful();
				if (typeof callback == 'function') {
					callback.call(scope || me, operation);
				}
			}
		};

		operation.setStarted();

		if (operation.action === 'read') {
			me.readRecords(operation, onSuccess);
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
			}
		}
	},

	/**
	 *  Read single records or all records from table
	 *  @private
	 *  @param {Ext.data.Model} record
	 *  @callback {Function} callback function
	 *  @scope {Object} scope of callback function
	 */
	readRecords: function(operation, callback) {
		var me = this;

		var tablename = me.getTableName(),
			orderBy = [],
			sql = me.sql || 'SELECT * FROM ' + tablename,
			where = '',
			limit = '',
			store, record;

		if (operation.id !== undefined) {
			if (operation.id === '') {
				operation.resultSet = new Ext.data.ResultSet({
					records: [],
					total: 0,
					loaded: true
				});
				if (typeof callback == 'function') {
					callback.call(me);
				}
				return;
			}

			store = Ext.StoreMgr.lookup(tablename);

			if (store) {
				record = store.getById(operation.id);

				if (record) {
					operation.resultSet = new Ext.data.ResultSet({
						records: [record],
						total: 1,
						loaded: true
					});
					if (typeof callback == 'function') {
						callback.call(me);
					}
					return;
				}
			}

			where = ' WHERE ' + me.getIdProperty() + ' = "' + operation.id + '" ';
		}

		if (operation.limit) {
			limit = ' LIMIT ' + operation.limit + ' OFFSET ' + operation.start;
		}

		if (operation.sorters && operation.sorters.length > 0) {
			sql = sql + ' ORDER BY ';

			for (var i = 0; i < operation.sorters.length; i++) {
				orderBy.push(operation.sorters[i].property + ' ' + operation.sorters[i].direction);
			}

			sql = sql + orderBy.join(',');
		}

		sql = sql + where + limit;

		var onSuccess = function(tx, results) {
			var records = [],
				record, rows = results.rows,
				length = rows.length,
				count = length;

			for (var i = 0; i < length; i++) {
				record = new me.model(rows.item(i));
				records.push(record);
			}

			operation.resultSet = new Ext.data.ResultSet({
				records: records,
				total: records.length,
				size: 666,
				loaded: true
			});

			if (length === 0) {
				if (typeof callback == 'function') {
					callback.call(me);
				}
			}

			var onRecordLoaded = function() {
				count--;
				if (count <= 0) {
					if (typeof callback == 'function') {
						callback.call(me);
					}
				}
			};

			for (i = 0; i < length; i++) {
				record = records[i];
				me.getAssociatedRecords(record, onRecordLoaded);
			}
		};

		me.runSQL(sql, [], onSuccess);
	},

	getAssociatedRecords: function(record, callback) {
		var me = this;

		var data = {},
			associations = record.associations,
			count = associations.getCount();

		if (count === 0) {
			if (typeof callback == 'function') {
				callback.call(me);
			}
			return;
		}



		function checkCounter() {
			count--;
			if (count <= 0) {
				if (typeof callback == 'function') {
					callback.call(me);
				}
			}
		};

		associations.each(function(association) {
			if (association.type === "belongsTo") {
				var store, name = association.associatedName,
					child = record.data[name],
					childId = record.data[name + '_ID'],
					getterName = association.getterName;

				if (!childId) {
					checkCounter();
					return;
				}

				if (!child) {
					child = me.getRecordById(name, childId);

					if (child === undefined) {
						child = {};
						me.cache.add(childId, child);
						record.data[name] = child;
						record[getterName].call(record, function(result) {
							var id;
							if (result !== undefined) {
								id = result.getId();
								Ext.apply(me.cache.getByKey(id), result.data);
								checkCounter();
							}
						});
						return;
					}
				}

				if (child) {
					record.data[name] = child;
					checkCounter();
				}
			}

			if (association.type === "hasMany") {
				var store = record[association.name].call(record);
				store.load.call(store, function(records, operation, success) {
					record.data[association.name] = records;
					checkCounter();
				});
			}
		},
		this);
	},

	getRecordById: function(modelname, id) {
		var me = this,
			store, record;

		if (id == undefined) {
			return;
		}

		me.cache = me.cache || new Ext.util.MixedCollection();

		if (me.cache.containsKey(id)) {
			record = me.cache.get(id);
		} else {
			store = Ext.StoreMgr.lookup(modelname);
			if (store) {
				record = store.getById(id);
				if (record) {
					me.cache.add(id, record.data);
				}
			}
		}

		return record;
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
		me.runSQL(sql, values, onSuccess);

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
			fields = me.getModel().prototype.fields,
			newData = record.data,
			tablename = me.getTableName(),
			pairs = [],
			values = [];

		var onSuccess = function(tx, rs) {
			if (typeof callback == 'function') {
				callback.call(me);
			}
		};

		for (var field in newData) {
			if (field != primarykey && fields.containsKey(field)) {
				pairs.push(field + ' = ?');
				values.push(newData[field]);
			}
		}

		values.push(id);

		var sql = 'UPDATE ' + tablename + ' SET ' + pairs.join(',') + ' WHERE ' + primarykey + ' = ?';
		me.runSQL(sql, values, onSuccess);

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

		var sql = 'DELETE FROM ' + tablename + ' WHERE ' + primarykey + ' = ?';
		values.push(id);
		me.runSQL(sql, values, onSuccess);
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
			if (item.isTableField === false) {
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
	runSQL: function(sql, params, successcallback, errorcallback) {
		if (this.logSQL) console.log('[SQL]: ' + sql + ' [' + (params || '') + ']');

		var me = this;

		me.db.transaction(function(tx) {
			tx.executeSql(
			sql, params, successcallback || Ext.emptyFn, errorcallback || me.onError(sql, params));
		});
	},

	/**
	 *  Error callback factory, returns function that knows about SQL and its params
	 *  @param {String} sql SQL statement
	 *  @param {Array} values array of values for SQL statement
	 *  @return {Function} callback function with sql and params 
	 */
	onError: function(sql, values) {
		var me = this;

		return function(tx, err) {
			me.throwDbError(tx, err, sql, values);
		};
	},

	/**
	 *  Output Query Error
	 *  @param {Object} tx Transaction
	 *  @param {Object} rs Response
	 */
	throwDbError: function(tx, err, sql, params) {
		var error = new Error(err.message + ' in SQL: ' + sql + ' [' + (params || []) + ']');
		error.name = 'Database Error';
		throw error;
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
	},

	setSQL: function(sql) {
		this.sql = sql;
	}

});