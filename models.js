


Ext.regModel('PRODUCT', {
	
	idProperty: 'OBJECT_ID',
	proxy: {
		type: 'websql',
		dbName: 'test',
		dbTable: 'PRODUCT',
		objectStoreName: 'product',
		dbVersion: '1.00'
	},

    fields: [
    {
        name: 'OBJECT_ID',
        type: 'string'
    },
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

