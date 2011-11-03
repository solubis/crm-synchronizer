/**
 *    synch.js	
 *    
 *    Created by Jerzy Blaszczyk on 2011-10-31.
 *    Copyright 2011 Client and Friends. All rights reserved.
 */

Ext.ns('acrm');

acrm.serverURL = 'http://10.46.1.5:804';

acrm.Ajax = {

	request: function(command, callback, scope) {
		var me = this;

		Ext.Ajax.request({
			url: acrm.serverURL + '/' + command,
			success: function(response, opts) {
				var result = Ext.decode(response.responseText);
				if (typeof callback == 'function') {
					callback.call(scope || me, result);
				}
			},
			failure: function(response, opts) {
				throw 'Server error with status code : ' + response.status;
			}
		});
	},
};

acrm.Synchronizer = {

	getProcessingOrder: function(callback, scope) {
		var me = this,
			ajax;

		var onSuccess = function(result) {
			me.processingOrder = result.Value;
			if (typeof callback == 'function') {
				callback.call(scope || me, me.processingOrder);
			}
		};

		if (this.processingOrder == undefined) {
			acrm.Ajax.request('GetProcessingOrder.json', onSuccess);
		} else {
			callback.call(scope || me, me.processingOrder);
		}
	},

	getInstall: function(callback, scope) {
		var me = this,
			ajax;

		var onSuccess = function(result) {
			me.install = result.Value;
			if (typeof callback == 'function') {
				callback.call(scope || me, me.install);
			}
		};

		if (this.install == undefined) {
			acrm.Ajax.request('TestInstall.json', onSuccess);
		} else {
			callback.call(scope || me, me.install);
		}
	},

	download_OLD: function(callback, scope) {
		var me = this,
			ajax, db;

		db = acrm.database.getProxy();

		acrm.Ajax.request('product.json', function(result) {
			var insert = result.INSERT[0],
				records = 0,
				values = result.INSERT[0].values,
				count = values.length;

			var onSuccess = function(tx, rs) {
				count--;
				if (count === 0) {
					if (typeof callback == 'function') {
						callback.call(scope || me, result);
					}
				}
			};

			var onError = function(tx, err) {
				me.throwDbError(tx, err);
			};

			for (var i = 0; i < values.length; i++) {
				var insertSQL = "INSERT INTO " + insert.table + " (" + insert.columns + ") VALUES (" + values[i] + ")";
				db.queryDB(insertSQL, onSuccess);
			};
		});
	},

	download: function(callback, scope) {
		var me = this,
			ajax, db, count = 0,
			i, j, table, rows, insertSQL, placeholders = [],
			values = [];

		var onSuccess = function(tx, rs) {
			count--;
			//if (count % 1000 == 0) console.log(count);
			if (count === 0) {
				if (typeof callback == 'function') {
					callback.call(scope || me, "success");
				}
			}
		};

		var onError = function(tx, err) {
			db.throwDbError(tx, err);
		};

		var onInstall = function(result) {
			db = acrm.Database.getProxy();

			for (i = 0; i < me.processingOrder.length; i++) {
				table = me.processingOrder[i];
				rows = result[table].Values;
				count = count + rows.length;
			}

			db.db.transaction(function(tx) {

				for (i = 0; i < me.processingOrder.length; i++) {
					table = me.processingOrder[i];
					rows = result[table].Values;
					columns = result[table].Columns.slice(1).join(',');

					for (j = 0; j < rows.length; j++) {
						placeholders = [];
						values = rows[j].slice(1);
						for (k = 0; k < values.length; k++) {
							placeholders.push('?');
						}
						insertSQL = "INSERT INTO " + table + " (" + columns + ") VALUES (" + placeholders.join(',') + ")";
					
						tx.executeSql(insertSQL, values, onSuccess, onError);
					}
				}
			});
		};

		var onProcessingOrder = function() {
			me.getInstall(onInstall);
		};

		me.getProcessingOrder(onProcessingOrder);
	}
};
