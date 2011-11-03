Ext.ns('acrm.data');

acrm.data.Tables = {
	PRODUCT: {
		fields: [{
			name: 'NAME',
			type: 'string',
			persist: true
		},
		{
			name: 'IS_ACTIVE',
			type: 'boolean'
		},
		{
			name: 'IS_KEY_PRODUCT',
			type: 'boolean'
		}]
	}
};
