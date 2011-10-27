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


Ext.regModel('PRODUCT', {

    proxy: {
        type: 'sqlitestorage',
        dbName: 'acrm',
        dbTable: 'PRODUCT',
        dbVersion: '1.00',
		dbDescription: 'Adaptive CRM Database'
    },

    idProperty: 'OBJECT_ID',

    fields: [
    {
        name: 'NAME',
        type: 'string'
    },
    {
        name: 'IS_ACTIVE',
        type: 'boolean'
    },
    {
        name: 'IS_KEY_PRODUCT',
        type: 'boolean'
    }]

});

