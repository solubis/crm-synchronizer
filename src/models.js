/**
 *  models.js
 *  
 *  FILE GENERATED - DO NOT MODIFY!!!
 *  
 *  Copyright 2011 Client and Friends. All rights reserved.
 */

Ext.ns('solubis.data');

/**
 *	Structure holding all data model definitions reflecting database schema
 *  Used by Sencha Stores
 */
solubis.data.Tables = {
	CHANGE_TRACKING: {
		fields: [{
			name: 'OBJECT_ID',
			type: 'int'
		},
		{
			name: 'RELATED_OBJECT_ID',
			type: 'string'
		},
		{
			name: 'TABLE_NAME',
			type: 'string'
		},
		{
			name: 'CHANGE_TYPE',
			type: 'int'
		},
		{
			name: 'DATE',
			type: 'date'
		}]
	},
	ADDRESS_ASSIGNATION: {
		fields: [{
			name: 'OBJECT_ID',
			type: 'string'
		},
		{
			name: 'ADDRESS_ID',
			type: 'string'
		},
		{
			name: 'RALETED_OBJECT_TYPE',
			type: 'int'
		},
		{
			name: 'RELATED_OBJECT_ID',
			type: 'string'
		},
		{
			name: 'CREATE_USER',
			type: 'string'
		},
		{
			name: 'CREATE_DATE',
			type: 'date'
		},
		{
			name: 'CHANGE_USER',
			type: 'string'
		},
		{
			name: 'CHANGE_DATE',
			type: 'date'
		}]
	},

	ADDRESS: {
		fields: [{
			name: 'OBJECT_ID',
			type: 'string'
		},
		{
			name: 'CITY',
			type: 'string'
		},
		{
			name: 'POSTAL_CODE',
			type: 'string'
		},
		{
			name: 'ADDRESS_LINE',
			type: 'string'
		},
		{
			name: 'ADDRESS_TYPE_ID',
			type: 'string'
		},
		{
			name: 'IS_MARKETING_ADDRESS',
			type: 'int'
		},
		{
			name: 'LATITUDE',
			type: 'float'
		},
		{
			name: 'LONGITUDE',
			type: 'float'
		},
		{
			name: 'CREATE_USER',
			type: 'string'
		},
		{
			name: 'CREATE_DATE',
			type: 'date'
		},
		{
			name: 'CHANGE_USER',
			type: 'string'
		},
		{
			name: 'CHANGE_DATE',
			type: 'date'
		}]
	},

	ORGANIZATION: {
		fields: [{
			name: 'OBJECT_ID',
			type: 'string'
		},
		{
			name: 'OFFICIAL_NAME',
			type: 'string'
		},
		{
			name: 'INTERNAL_NAME',
			type: 'string'
		},
		{
			name: 'ADDITIONAL_NAME',
			type: 'string'
		},
		{
			name: 'CODE',
			type: 'string'
		},
		{
			name: 'RATING',
			type: 'string'
		},
		{
			name: 'IMPORTANCE',
			type: 'string'
		},
		{
			name: 'PENETRATION',
			type: 'string'
		},
		{
			name: 'ORGANIZATION_TYPE_ID',
			type: 'string'
		},
		{
			name: 'ORGANIZATION_STATUS_ID',
			type: 'string'
		},
		{
			name: 'EMPLOYEE_COUNT',
			type: 'int'
		},
		{
			name: 'CREATE_USER',
			type: 'string'
		},
		{
			name: 'CREATE_DATE',
			type: 'date'
		},
		{
			name: 'CHANGE_USER',
			type: 'string'
		},
		{
			name: 'CHANGE_DATE',
			type: 'date'
		}]
	},

	ORGANIZATION_TYPE_GROUP: {
		fields: [{
			name: 'OBJECT_ID',
			type: 'string'
		},
		{
			name: 'NAME',
			type: 'string'
		},
		{
			name: 'DESCRIPTION',
			type: 'string'
		}]
	},

	ADDRESS_TYPE: {
		fields: [{
			name: 'OBJECT_ID',
			type: 'string'
		},
		{
			name: 'NAME',
			type: 'string'
		}]
	},

	ORGANIZATION_TYPE: {
		fields: [{
			name: 'OBJECT_ID',
			type: 'string'
		},
		{
			name: 'NAME',
			type: 'string'
		},
		{
			name: 'DESCRIPTION',
			type: 'string'
		},
		{
			name: 'ORGANIZATION_TYPE_GROUP_ID',
			type: 'string'
		}]
	},

	ORGANIZATION_STATUS: {
		fields: [{
			name: 'OBJECT_ID',
			type: 'string'
		},
		{
			name: 'NAME',
			type: 'string'
		},
		{
			name: 'DESCRIPTION',
			type: 'string'
		},
		{
			name: 'IS_ACTIVE',
			type: 'int'
		}]
	},

	ACTIVITY: {
		fields: [{
			name: 'OBJECT_ID',
			type: 'string'
		},
		{
			name: 'SUBJECT',
			type: 'string'
		},
		{
			name: 'VENUE',
			type: 'string'
		},
		{
			name: 'START_DATE',
			type: 'date'
		},
		{
			name: 'END_DATE',
			type: 'date'
		},
		{
			name: 'ACTIVITY_TYPE_ID',
			type: 'string'
		},
		{
			name: 'ACTIVITY_STATUS_ID',
			type: 'string'
		},
		{
			name: 'ACTIVITY_PURPOSE_ID',
			type: 'string'
		},
		{
			name: 'CREATE_USER',
			type: 'string'
		},
		{
			name: 'CREATE_DATE',
			type: 'date'
		},
		{
			name: 'CHANGE_USER',
			type: 'string'
		},
		{
			name: 'CHANGE_DATE',
			type: 'date'
		}]
	},

	ACTIVITY_ORGANIZATION: {
		fields: [{
			name: 'OBJECT_ID',
			type: 'string'
		},
		{
			name: 'ACTIVITY_ID',
			type: 'string'
		},
		{
			name: 'ORGANIZATION_ID',
			type: 'string'
		},
		{
			name: 'ACTIVITY_ORGANIZATION_TYPE_ID',
			type: 'string'
		},
		{
			name: 'CREATE_USER',
			type: 'string'
		},
		{
			name: 'CREATE_DATE',
			type: 'date'
		},
		{
			name: 'CHANGE_USER',
			type: 'string'
		},
		{
			name: 'CHANGE_DATE',
			type: 'date'
		}]
	},

	ACTIVITY_PURPOSE: {
		fields: [{
			name: 'OBJECT_ID',
			type: 'string'
		},
		{
			name: 'NAME',
			type: 'string'
		},
		{
			name: 'DESCRIPTION',
			type: 'string'
		},
		{
			name: 'ACTIVITY_TYPE_GROUP_ID',
			type: 'string'
		}]
	},
	
	ACTIVITY_STATUS: {
		fields: [{
			name: 'OBJECT_ID',
			type: 'string'
		},
		{
			name: 'NAME',
			type: 'string'
		},
		{
			name: 'DESCRIPTION',
			type: 'string'
		},
		{
			name: 'ACTIVITY_STATUS_ID',
			type: 'string'
		},
		{
			name: 'ACTIVITY_TYPE_GROUP_ID',
			type: 'string'
		}]
	},

	ACTIVITY_TYPE: {
		fields: [{
			name: 'OBJECT_ID',
			type: 'string'
		},
		{
			name: 'NAME',
			type: 'string'
		},
		{
			name: 'DESCRIPTION',
			type: 'string'
		},
		{
			name: 'ACTIVITY_TYPE_GROUP_ID',
			type: 'string'
		}]
	},
	ACTIVITY_ROLE: {
		fields: [{
			name: 'OBJECT_ID',
			type: 'string'
		},
		{
			name: 'NAME',
			type: 'string'
		},
		{
			name: 'ACTIVITY_TYPE_GROUP_ID',
			type: 'string'
		}]
	},
};
