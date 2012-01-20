/**
 *  synch.js
 *
 *  Synchronizer module used for synchronizing local data with server
 *
 *  Created by Jerzy Blaszczyk on 2011-10-31.
 *  Copyright 2011 Client and Friends. All rights reserved.
 */

/**
 *  Ajax request singleton using standard XMLHttpRequest object
 */
solubis.data.Ajax = {

	request: function(url, command, params, callback, scope) {
		var me = this;

		var request = new XMLHttpRequest();
		request.open('GET', url + '/' + command, true);
		request.onreadystatechange = function(aEvt) {
			if (request.readyState == 4) {
				if (request.status == 200) {
					var result = request.responseText;

					try {
						result = JSON.parse(request.responseText);
					}
					catch(e) {
						console.log("Not s JSON string : " + e);
					}
					if (typeof callback === 'function') {
						callback.call(scope || me, result);
					}
				} else {
					throw 'Server error with status code : ' + request.status;
				}
			}
		};
		request.send(null);
	}
};

/**
 *  Synchronizer sigleton - proxy to remote data synchronization services
 */
solubis.data.Synchronizer = (function() {

	var db = solubis.data.Database,
		ajax = solubis.data.Ajax;

	var module = {

		serverURL: '',
		primaryKey: 'id',

		init: function() {

		},

		setURL: function(url) {
			this.serverURL = url;
		},

		/**
		 *  Download processing order structure
		 *  @param {Function} function called after succesfull download
		 *  @scope {Object} object scope for calling callback function
		 */
		getProcessingOrder: function(callback, scope) {
			var me = this;

			var onSuccess = function(result) {
				if (!result.success) {
					throw new Error(result.errorMessage);
				}

				me.processingOrder = result.processingOrder;
				if (typeof callback == 'function') {
					callback.call(scope || me, me.processingOrder);
				}
			};

			if (me.processingOrder == undefined) {
				ajax.request(me.serverURL, 'order.json', {},
				onSuccess);
			} else {
				callback.call(scope || me, me.processingOrder);
			}
		},

		/**
		 *  Download data changes from server
		 *  @param {Function} function called after succesfull download
		 *  @scope {Object} object scope for calling callback function
		 */
		getData: function(callback, scope) {
			var me = this;

			var onSuccess = function(result) {
				if (!result.success) {
					throw new Error(result.errorMessage);
				}

				if (typeof callback == 'function') {
					callback.call(scope || me, result);
				}
			};

			ajax.request(me.serverURL, 'data.json', {},
			onSuccess);
		},

		/**
		 *  Download DDL SQL from server
		 *  @param {Function} function called after succesfull download
		 *  @scope {Object} object scope for calling callback function
		 */
		getDDL: function(callback, scope) {
			var me = this;

			var onSuccess = function(result) {

				var commands = result.split(";");
				commands.splice(commands.length - 1, commands.length - 1);

				if (typeof callback == 'function') {
					callback.call(scope || me, commands);
				}
			};

			ajax.request(me.serverURL, 'main.sql', {},
			onSuccess);
		},

		/**
		 *  Update local database with changes from server
		 *  Method downloads processing order and data. After download data is inserted into
		 *  local SQLite database.
		 *  @param {Function} function called after succesfull operation
		 *  @scope {Object} object scope for calling callback function
		 */
		download: function(callback, scope) {
			var me = this,
				count = 0,
				total = 0;

			var onSuccess = function(tx, rs) {
				count--;
				if (count === 0) {
					if (typeof callback == 'function') {
						callback.call(scope || me, "success");
					}
				}
			};

			var onError = function(sql, params) {
				return function(tx, err) {
					db.throwDbError(tx, err, sql, params);
				}
			};

			var onDataDownloaded = function(result) {
				for (var i = 0; i < result.tables.length; i++) {
					count = count + result.tables[i].objects.length;
				}

				total = count;

				db.transaction(function(tx) {
					var table, object, id;

					for (var i = 0; i < result.tables.length; i++) {
						table = result.tables[i];

						for (var j = 0; j < table.objects.length; j++) {
							object = table.objects[j];

							if (me.isDeletedObject(object)) {
								me.deleteObject(tx, object, table.name, onSuccess, onError);
							} else {
								me.saveObject(tx, object, table.name, onSuccess, onError);
							}
						}
					}
				});
			};

			var onProcessingOrderDownloaded = function() {
				me.getData(onDataDownloaded);
			};

			me.getProcessingOrder(onProcessingOrderDownloaded);
		},

		isDeletedObject: function(object) {
			return Object.keys(object).length == 1 && object[this.primaryKey] !== undefined;
		},

		saveObject: function(tx, object, table, success, failure) {
			var me = this,
				id = object[me.primaryKey],
				sql = "SELECT 1 FROM " + table + " WHERE id = ?";

			var onError = function(sql, params) {
				return function(tx, err) {
					db.throwDbError(tx, err, sql, params);
				}
			};
			db.executeSQLInTransaction(tx, sql, [id], function(tx, rs) {
				if (rs.rows.length > 0) {
					me.updateObject(tx, object, table, success, failure);
				} else {
					me.insertObject(tx, object, table, success, failure);
				}
			},
			onError(sql, [id]));
		},

		insertObject: function(tx, object, table, success, failure) {
			var me = this,
				sql, placeholders = [],
				values = [],
				columns = [];

			for (var field in object) {
				placeholders.push('?');
				values.push(object[field]);
				columns.push(field);
			}

			sql = "INSERT INTO " + table + " (" + columns.join(',') + ") VALUES (" + placeholders.join(',') + ")";
			db.executeSQLInTransaction(tx, sql, values, success, failure(sql, values));
		},

		deleteObject: function(tx, object, table, success, failure) {
			var me = this,
				id, sql;

			id = object[me.primaryKey];

			sql = "DELETE FROM " + table + ' WHERE id = ?';
			db.executeSQLInTransaction(tx, sql, [id], success, failure(sql, [id]));
		},

		updateObject: function(tx, object, table, success, failure) {
			var me = this,
				sql, id, values = [],
				sets = [];

			for (var field in object) {
				if (field !== me.primaryKey) {
					values.push(object[field]);
					sets.push(field + " = ?");
				}
			}

			id = object[me.primaryKey];
			values.push(id);

			sql = "UPDATE " + table + ' SET ' + sets.join(',') + ' WHERE id = ?';
			db.executeSQLInTransaction(tx, sql, values, success, failure(sql, values));
		}
	};

	module.init();

	return module;

})();

/**
 *  Ajax request singleton using Sencha framework
 
 solubis.data.AjaxSencha = {
 
 request: function(url, command, params, callback, scope) {
 var me = this,
 ajax, user;
 
 user = solubis.data.Database.getUser();
 
 Ext.apply(params, {
 login: user
 });
 
 ajax = new Ext.data.Connection({
 useDefaultXhrHeader: false,
 autoAbort: true,
 disableCaching: false
 });
 
 ajax.request({
 method: 'POST',
 jsonData: params,
 url: url + '/' + command,
 success: function(response, opts) {
 var result = response.responseText;
 
 try {
 result = Ext.decode(response.responseText);
 } catch(error) {}
 
 if (typeof callback == 'function') {
 callback.call(scope || me, result);
 }
 },
 failure: function(response, opts) {
 throw 'Server error with status code : ' + response.status;
 }
 });
 }
 
 }; */
