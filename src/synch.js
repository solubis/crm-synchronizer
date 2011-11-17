/**
 *  synch.js	
 *    
 *  Synchronizer module used for synchronizing local data with server 
 *
 *  Created by Jerzy Blaszczyk on 2011-10-31.
 *  Copyright 2011 Client and Friends. All rights reserved.
 */

Ext.ns('acrm.data');

/**
 *  Ajax request singleton using Sencha framework
 */
acrm.data.AjaxSencha = {

	request: function(command, callback, scope) {
		var me = this,
			ajax;

		ajax = new Ext.data.Connection({
			useDefaultXhrHeader: false,
			autoAbort: false,
			disableCaching: true
		});

		ajax.request({
			method: 'GET',
			url: acrm.data.serverURL + '/' + command,
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

/**
 *  Ajax request singleton using standard XMLHttpRequest object
 */
acrm.data.Ajax = {

	request: function(command, callback, scope) {
		var me = this;

		var request = new XMLHttpRequest();
		request.open('GET', acrm.data.serverURL + '/' + command, true);
		request.onreadystatechange = function(aEvt) {
			if (request.readyState == 4) {
				if (request.status == 200) {
					var result = Ext.decode(request.responseText);
					if (typeof callback == 'function') {
						callback.call(scope || me, result);
					}
				} else {
					throw 'Server error with status code : ' + response.status;
				}
			}
		};
		request.send(null);
	},
};

/**	
 *  Synchronizer sigleton - proxy to remote data synchronization services
 */
acrm.data.Synchronizer = {


	/**
	 *  Download processing order structure
	 *  @param {Function} function called after succesfull download 
	 *  @scope {Object} object scope for calling callback function
	 */
	getProcessingOrder: function(callback, scope) {
		var me = this,
			ajax;

		var onSuccess = function(result) {
			me.processingOrder = result.GetProcessingOrderResult.Value;
			if (typeof callback == 'function') {
				callback.call(scope || me, me.processingOrder);
			}
		};

		if (me.processingOrder == undefined) {
			acrm.data.Ajax.request('GetProcessingOrder' + (acrm.data.useFiles ? '.json' : ''), onSuccess);
		} else {
			callback.call(scope || me, me.processingOrder);
		}
	},

	/**
	 *  Download data changes from server
	 *  @param {Function} function called after succesfull download 
	 *  @scope {Object} object scope for calling callback function
	 */
	getInstall: function(callback, scope) {
		var me = this,
			ajax;

		var onSuccess = function(result) {
			me.install = result.TestInstallResult.Value;
			if (typeof callback == 'function') {
				callback.call(scope || me, me.install);
			}
		};

		if (this.install == undefined) {
			acrm.data.Ajax.request('TestInstall' + (acrm.data.useFiles ? '.json' : ''), onSuccess);
		} else {
			callback.call(scope || me, me.install);
		}
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
			ajax, conn, count = 0,
			i, j, table, rows, insertSQL, placeholders = [],
			values = [];

		var onSuccess = function(tx, rs) {
			count--;
			if (count === 0) {
				if (typeof callback == 'function') {
					callback.call(scope || me, "success");
				}
			}
		};

		var onError = function(tx, err) {
			conn.throwDbError(tx, err);
		};

		var onInstall = function(result) {
			conn = acrm.data.Database.getProxy();

			for (i = 0; i < me.processingOrder.length; i++) {
				table = me.processingOrder[i];
				rows = result[table].Values;
				count = count + rows.length;
			}

			conn.db.transaction(function(tx) {

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
