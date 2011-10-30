
Ext.regModel('PRODUCT', {
		
	idProperty: 'OBJECT_ID',
	
	proxy: new acrm.data.Proxy({
		name: 'proxy',
		dbName: 'acrm',
		dbVersion: '1.00',
		dbDescription: 'Adaptive CRM Database'
	}),

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

