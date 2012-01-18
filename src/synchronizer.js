/**
 *  synch.js
 *
 *  Synchronizer module used for synchronizing local data with server
 *
 *  Created by Jerzy Blaszczyk on 2011-10-31.
 *  Copyright 2011 Client and Friends. All rights reserved.
 */

Ext.ns('acrm.data');

Date.prototype.toJSON = function (key) {

    function f(n) {
        return n < 10 ? '0' + n : n;
    }

    return isFinite(this.valueOf()) ? this.getFullYear() + '-' + f(this.getMonth() + 1) + '-' + f(this.getDate()) + ' ' + f(this.getHours()) + ':' + f(this.getMinutes()) + ':' + f(this.getSeconds()) : null;
};

/**
 *  Ajax request singleton using Sencha framework
 */
acrm.data.Ajax = {

    request:function (url, command, params, callback, scope) {
        var me = this,
            ajax, user;

        user = acrm.data.Database.getUser();

        Ext.apply(params, {
            login:user
        });

        ajax = new Ext.data.Connection({
            useDefaultXhrHeader:false,
            autoAbort:true,
            disableCaching:false
        });

        ajax.request({
            method:'POST',
            jsonData:params,
            url:url + '/' + command,
            success:function (response, opts) {
                var result = response.responseText;

                try {
                    result = Ext.decode(response.responseText);
                } catch (error) {
                }

                if (typeof callback == 'function') {
                    callback.call(scope || me, result);
                }
            },
            failure:function (response, opts) {
                throw 'Server error with status code : ' + response.status;
            }
        });
    },

};

/**
 *  Ajax request singleton using standard XMLHttpRequest object
 */
acrm.data.AjaxXHR = {

    request:function (url, command, callback, scope) {
        var me = this;

        var request = new XMLHttpRequest();
        request.open('GET', url + '/' + command, true);
        request.onreadystatechange = function (aEvt) {
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

    useFiles:false,
    serverURL:'http://localhost',

    /**
     *  Download processing order structure
     *  @param {Function} function called after succesfull download
     *  @scope {Object} object scope for calling callback function
     */
    getProcessingOrder:function (callback, scope) {
        var me = this,
            ajax;

        var onSuccess = function (result) {

            if (!result.GetProcessingOrderResult.Success) {
                throw new Error(result.GetProcessingOrderResult.ErrorMessage);
            }

            me.processingOrder = result.GetProcessingOrderResult.Value;
            if (typeof callback == 'function') {
                callback.call(scope || me, me.processingOrder);
            }
        };

        if (me.processingOrder == undefined) {
            acrm.data.Ajax.request(me.serverURL, 'GetProcessingOrder' + (me.useFiles ? '.json' : ''), {},
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
    getInstall:function (callback, scope) {
        var me = this,
            ajax, result;

        var onSuccess = function (r) {
            result = r.TestInstallResult;

            if (!result.Success) {
                throw new Error(result.ErrorMessage);
            }

            if (typeof callback == 'function') {
                callback.call(scope || me, result);
            }
        };

        acrm.data.Ajax.request(me.serverURL, 'TestInstall' + (me.useFiles ? '.json' : ''), {},
            onSuccess);
    },

    /**
     *  Download DDL SQL from server
     *  @param {Function} function called after succesfull download
     *  @scope {Object} object scope for calling callback function
     */
    getDDL:function (callback, scope) {
        var me = this,
            ajax, result;

        var onSuccess = function (result) {
            data = result.data;

            if (typeof callback == 'function') {
                callback.call(scope || me, result);
            }
        };

        acrm.data.Ajax.request(me.serverURL, 'main.sql', {},
            onSuccess);
    },

    /**
     *  Update local database with changes from server
     *  Method downloads processing order and data. After download data is inserted into
     *  local SQLite database.
     *  @param {Function} function called after succesfull operation
     *  @scope {Object} object scope for calling callback function
     */
    download:function (callback, scope) {
        var me = this,
            ajax, conn, count = 0,
            total = 0;

        var isDate = function (p) {
            return typeof p == 'string' && p.match(/\/Date\((-?\d+).*/g);
        };

        var convertDate = function (p) {
            return Ext.DateExtras.parseDate(p, "MS").toJSON();
        };

        var onSuccess = function (tx, rs) {
            count--;
            if (count === 0) {
                if (typeof callback == 'function') {
                    callback.call(scope || me, "success");
                }
            }
        };

        var onError = function (sql, params) {
            return function (tx, err) {
                conn.throwDbError(tx, err, sql, params);
            }
        };

        var onInstall = function (result) {
            var tableName, rows, columns, sql, placeholders = [],
                values = [],
                table;

            result = result.Value;
            conn = acrm.data.Database.getProxy();

            for (var i = 0; i < me.processingOrder.length; i++) {
                tableName = me.processingOrder[i];
                table = result[tableName];

                if (table == undefined) {
                    throw 'Table not found in data : ' + tableName;
                }

                rows = table.Values;

                count = count + rows.length;
            }

            total = count;

            conn.db.transaction(function (tx) {

                for (var i = 0; i < me.processingOrder.length; i++) {
                    table = me.processingOrder[i];
                    rows = result[table].Values;
                    columns = result[table].Columns.slice(1).join(',');

                    for (var j = 0; j < rows.length; j++) {
                        placeholders = [];
                        values = rows[j].slice(1);
                        for (var k = 0; k < values.length; k++) {
                            if (isDate(values[k])) {
                                values[k] = convertDate(values[k]);
                            }
                            placeholders.push('?');
                        }
                        sql = "INSERT INTO " + table + " (" + columns + ") VALUES (" + placeholders.join(',') + ")";
                        tx.executeSql(sql, values, onSuccess, onError(sql, values));
                    }
                }
            });
        };

        var onProcessingOrder = function () {
            me.getInstall(onInstall);
        };

        me.getProcessingOrder(onProcessingOrder);
    },

};
