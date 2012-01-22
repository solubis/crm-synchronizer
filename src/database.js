/**
 *  database.js
 *
 *  Database helper
 *
 *  Copyright 2011 Client and Friends. All rights reserved.
 */

var solubis = {};
solubis.data = {};

/**
 *  Helper singleton for accesing database structures: model, store, proxy
 */
solubis.data.Database = (function() {

	// Name of database column for primary key
	var user, Database, db, changeLog = true,
		sqlLog = false;

	// Database configuration object
	var dbConfig = {
		name: 'test',
		version: '1.00',
		description: 'SQLite Database',
		size: 5 * 1024 * 1024
	};

	Database = function(name, user, password) {
		db = openDatabase(name || dbConfig.name, dbConfig.version, dbConfig.description, dbConfig.size);

		if (user === undefined || password === undefined) {
			throw new Error("You must provide user credentails to open local SQLite database");
		}
	};

	Database.prototype = {

		primaryKey: 'id',

		constructor: Database,

		enableChangeLog: function(flag) {
			changeLog = flag;
		},

		getConnection: function() {
			return db;
		},

		enableSQLLog: function(flag) {
			sqlLog = flag;
		},

		setPrimaryKey: function(name) {
			this.primaryKey = name;
		},

		/**
		 *  Error callback factory, returns function that knows about SQL and its params
		 *  @param {String} sql SQL statement
		 *  @param {Array} values array of values for SQL statement
		 */
		onSQLError: function(sql, values) {
			var me = this;

			return function(tx, err) {
				me.throwSQLError(err, sql, values);
			};
		},

		/**
		 *  Output Query Error
		 */
		throwSQLError: function(err, sql, params) {
			var error = new Error(err.message + ' in SQL: ' + sql + ' [' + (params || []) + ']');
			error.name = 'SQL Error';
			throw error;
		},

		/**	
		 *  Run SQL statement
		 *  @param {String} sql SQL statement
		 *  @param {Function} successcallback function to call after succesfull SQL operation
		 *  @param {Function} errorcallback function to call after error
		 *  @param {Array} params Array of parameters passed to SQL function (when used '?' placeholders)
		 */
		executeSQL: function(sql, params, success, failure) {
			var me = this;

			me.transaction(function(tx) {
				me.executeSQLTx(tx, sql, params, success, failure);
			});
		},

		executeSQLTx: function(tx, sql, params, success, failure) {
			var me = this;

			if (sqlLog) console.log('[SQL]: ' + sql + ' [' + (params || '') + ']');

			tx.executeSql(sql, params, success ||
			function() {},
			failure || me.onSQLError(sql, params));
		},

		transaction: function(f) {
			db.transaction(f);
		},

		saveObject: function(object, table, success, failure) {
			var me = this;

			me.transaction(function(tx) {
				me.saveObjectTx(tx, object, table, success, failure);
			});
		},

		saveObjectTx: function(tx, object, table, success, failure) {
			var me = this,
				id = object[me.primaryKey],
				sql = "SELECT 1 FROM " + table + " WHERE id = ?";

			if (id === undefined) {
				me.insertObjectTx(tx, object, table, success, failure);
				return;
			}

			me.executeSQLTx(tx, sql, [id], function(tx, rs) {
				if (rs.rows.length > 0) {
					me.updateObjectTx(tx, object, table, success, failure);
				} else {
					me.insertObjectTx(tx, object, table, success, failure);
				}
			},
			me.onSQLError(sql, [id]));
		},

		insertObject: function(object, table, success, failure) {
			var me = this;

			me.transaction(function(tx) {
				me.insertObjectTx(tx, object, table, success, failure);
			});
		},

		insertObjectTx: function(tx, object, table, success, failure) {
			var me = this,
				sql, placeholders = [],
				id = object[me.primaryKey],
				values = [],
				columns = [];

			if (id === undefined) {
				id = me.getGUID();
			}

			var onSuccess = function(tx, rs) {
				object[me.primaryKey] = id;

				me.logChange(table, id, 'I', function() {
					if (typeof success == 'function') {
						success(object);
					}
				});
			};

			columns.push(me.primaryKey);
			placeholders.push('?');
			values.push(id);

			for (var field in object) {
				if (field !== me.primaryKey) {
					placeholders.push('?');
					values.push(object[field]);
					columns.push(field);
				}
			}

			sql = "INSERT INTO " + table + " (" + columns.join(',') + ") VALUES (" + placeholders.join(',') + ")";
			me.executeSQLTx(tx, sql, values, onSuccess, failure);
		},

		deleteObject: function(object, table, success, failure) {
			var me = this;

			me.transaction(function(tx) {
				me.deleteObjectTx(tx, object, table, success, failure);
			});
		},

		deleteObjectTx: function(tx, object, table, success, failure) {
			var me = this,
				id, sql;

			var onSuccess = function(tx, rs) {
				me.logChange(table, id, 'D', function() {
					if (typeof success == 'function') {
						success();
					}
				});
			};

			id = object[me.primaryKey];

			sql = "DELETE FROM " + table + ' WHERE id = ?';
			me.executeSQLTx(tx, sql, [id], onSuccess, failure);
		},

		updateObject: function(object, table, success, failure) {
			var me = this;

			me.transaction(function(tx) {
				me.updateObjectTx(tx, object, table, success, failure);
			});
		},

		updateObjectTx: function(tx, object, table, success, failure) {
			var me = this,
				sql, id, values = [],
				sets = [];

			var onSuccess = function(tx, rs) {
				me.logChange(table, id, 'U', function() {
					if (typeof success == 'function') {
						success();
					}
				});
			};

			for (var field in object) {
				if (field !== me.primaryKey) {
					values.push(object[field]);
					sets.push(field + " = ?");
				}
			}

			id = object[me.primaryKey];
			values.push(id);

			sql = "UPDATE " + table + ' SET ' + sets.join(',') + ' WHERE id = ?';
			me.executeSQLTx(tx, sql, values, onSuccess, failure);
		},

		readLogForObject: function(id, success, failure) {
			var me = this,
				sql;

			var onSuccess = function(tx, rs) {
				var log;

				if (rs.rows.length > 0) {
					log = {
						operation: rs.rows.item(0)['operation'],
						id: rs.rows.item(0)['id']
					}
				}

				if (typeof success == 'function') {
					success(log);
				}
			};

			sql = "SELECT id, operation FROM ChangeLog WHERE object_id = ?";
			me.executeSQL(sql, [id], onSuccess, failure);
		},

		/**
		 *  Destroys all records stored in the proxy
		 *  @param {String} tablename Name of database table
		 *  @callback {Function} callback function
		 *  @scope {Object} scope of callback function
		 */
		clearTable: function(table, success, failure) {
			var me = this,
				sql = 'DELETE FROM ' + table;

			me.executeSQL(sql, [], success, failure);
			return true;
		},

		/**
		 *  Get number of records in table
		 *  @callback {Function} callback function
		 *  @scope {Object} scope of callback function
		 */
		getTableSize: function(table, success, failure) {
			var me = this;

			var onSuccess = function(tx, rs) {
				var result = rs.rows.item(0)['COUNT(*)'];

				if (typeof success == "function") {
					success(result);
				}
			};

			me.executeSQL('SELECT COUNT(*) FROM ' + table, [], onSuccess, failure);
		},

		logChange: function(table, id, operation, success) {
			var me = this, 
				log = {
				object_id: id,
				tablename: table,
				operation: operation,
				timestamp: (new Date()).getTime()
			};

			if (table === 'ChangeLog' || !changeLog) {
				success();
				return;
			};

			me.readLogForObject(id, function(result) {
				if (result) {
					log.id = result.id
				};
				me.saveObject(log, 'ChangeLog', success);
			})
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
	};

	return Database;

} ());
