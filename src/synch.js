Ext.ns('acrm.data');

acrm.data.Database = {

    isComplete: false,

    openDatabase: function() {
        this.db = openDatabase('acrm', '1.0', 'Adaptive CRM Database', 5 * 1024 * 1024);
    },

    runSQL: function(sql, callback) {
        console.log(sql);
        var that = this;


        if (!this.db) {
            this.openDatabase();
        }

        this.db.transaction(function(tx) {
            tx.executeSql(sql, [],
            function(tx, result) {
                that.success = true;
                if (typeof callback == 'function') {
                    callback.call(that, result);
                };
            },
            function(tx, error) {
                that.success = false;
                that.message = error.message;
                throw 'Database error ' + error.message;
            });
        });
    },

    createDatabase: function() {
        var ddl = acrm.data.DDL.ddlObjects;

        if (!this.db) {
            this.openDatabase();
        }

        for (var i = 0; i < ddl.length; i++) {
            console.log('[' + i + ']' + ' Creating ' + ddl[i].objectType + ' : ' + ddl[i].objectName);
            this.runSQL(ddl[i].objectScript);
        }
    },

    download: function() {
        var that = this;

        this.isComplete = false;
        this.proxy = new acrm.data.Proxy();
        this.proxy.request('product.json',
        function(result) {
            var insert = result.INSERT[0],
            records = 0,
            values = result.INSERT[0].values;

            for (var i = 0; i < values.length; i++) {
                var insertSQL = "INSERT INTO " + insert.table + " (" + insert.columns + ") VALUES (" + values[i] + ")";
                (function(k) {
                    that.runSQL(insertSQL,
                    function(result) {
                        records++;
                        if (k === values.length - 1) {
                            that.success = true;
                            that.count = records;
                            that.isComplete = true;
                        }
                    });
                }) (i);
            };

        });
    },

    clearTable: function(tableName) {
        var that = this;
        this.isComplete = false;
        this.runSQL('DELETE FROM ' + tableName,
        function() {
            that.isComplete = true;
            that.success = true;
        });
    },

    countRecords: function(tableName) {
        var that = this;
        this.isComplete = false;
        this.runSQL('SELECT COUNT(*) FROM ' + tableName,
        function(result) {
            that.success = true;
            that.count = result.rows.item(0)['COUNT(*)'];
            that.isComplete = true;
        });
    },

    disableTriggers: function() {
        var sql = "UPDATE CONFIGURATION SET PARAMETER_VALUE=’FALSE’ WHERE PARAMETER_NAME=’TRIGGERS_ENABLE’";
        var that = this;

        that.runSQL(sql);
    }
};