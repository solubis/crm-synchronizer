/**
 *  database.js
 *
 *  Database helper
 *
 *  Copyright 2011 Client and Friends. All rights reserved.
 */

solubis = {};
solubis.data = {};

/**
 *  Helper singleton for accesing database structures: model, store, proxy
 */
solubis.data.Database = (function() {

	// Name of database column for primary key
	var idProperty = 'OBJECT_ID',
		user = undefined;

	// Database proxy configuration object
	var dbConfig = {
		dbName: 'timtrak',
		dbVersion: '1.00',
		dbDescription: 'SQLite Database',
		dbSize: 5 * 1024 * 1024,
	};
	
	var db, logSQL;

	var module = {

		/**
		 *  Initialize database access
		 */
		init: function() {
			db = openDatabase(dbConfig.dbName, dbConfig.dbVersion, dbConfig.dbDescription, dbConfig.dbSize);
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

		getConnection: function() {
			return db;
		},

		setLogging: function(flag) {
			logSQL = flag;
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
		 *  Run SQL statement
		 *  @param {String} sql SQL statement
		 *  @param {Function} successcallback function to call after succesfull SQL operation
		 *  @param {Function} errorcallback function to call after error
		 *  @param {Array} params Array of parameters passed to SQL function (when used '?' placeholders)
		 */
		executeSQL: function(sql, params, successcallback, errorcallback) {
			var me = this;

			db.transaction(function(tx) {
				me.executeSQLInTransaction(tx, sql, params, successcallback || function(){}, errorcallback || me.onError(sql, params));
			});
		},

		executeSQLInTransaction: function(tx, sql, params, success, failure) {
			if (logSQL) console.log('[SQL]: ' + sql + ' [' + (params || '') + ']');
			tx.executeSql(sql, params, success, failure);
		},
		
		transaction: function(f){
			db.transaction(f);
		},

		/**
		 *  Create database using generated schema DDL (ddl.js)
		 *  @param {Function} callback function
		 *  @param {Object} scope of callback function
		 */
		createDatabase: function(callback, scope) {
			var me = this,
				ddls, count;

			var onSuccess = function() {
				count--;
				if (count === 0) {
					if (typeof callback == 'function') {
						callback.call(scope || me, "success");
					}
				}
			};

			var onError = function(tx, err) {
				me.throwDbError(tx, err);
			};

			var onDownload = function(result) {
				count = result.length;

				for (var i = 0; i < result.length; i++) {
					me.executeSQL(result[i], [], onSuccess, onError);
				}
			};

			solubis.data.Synchronizer.getDDL(onDownload);
		},

		/**
		 *  Destroys all records stored in the proxy
		 *  @param {String} tablename Name of database table
		 *  @callback {Function} callback function
		 *  @scope {Object} scope of callback function
		 */
		clearTable: function(tablename, callback, scope) {
			var me = this,
				sql = 'DELETE FROM ' + tablename;

			var onSuccess = function(tx, rs) {
				if (typeof callback == "function") {
					callback.call(scope || me, result);
				}
			};

			me.executeSQL(sql, [], onSuccess);
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

			me.executeSQL('SELECT COUNT(*) FROM ' + tablename, [], onSuccess);
		},
	};

	module.init();

	return module;

} ());
