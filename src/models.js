
Ext.ns('acrm.data');

acrm.data.Tables = {
	CHANGE_TRACKING : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'int'
			}, {
				name : 'RELATED_OBJECT_ID',
				type : 'string'
			}, {
				name : 'TABLE_NAME',
				type : 'string'
			}, {
				name : 'CHANGE_TYPE',
				type : 'int'
			}, {
				name : 'DATE',
				type : 'date'
			}
		]
	},
	CONFIGURATION : {
		fields : [{
				name : 'PARAMETER_NAME',
				type : 'string'
			}, {
				name : 'PARAMETER_VALUE',
				type : 'string'
			}
		]
	},
	ORGANIZATION_SALES_TEMP : {
		fields : [{
				name : 'ORGANIZATION_ID',
				type : 'string'
			}, {
				name : 'PRODUCT_ID',
				type : 'string'
			}, {
				name : 'YEAR',
				type : 'int'
			}, {
				name : 'MONTH',
				type : 'int'
			}, {
				name : 'QUANTITY',
				type : 'int'
			}, {
				name : 'VALUE',
				type : 'float'
			}
		]
	},
	ADDRESS_ASSIGNATION : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'ADDRESS_ID',
				type : 'string'
			}, {
				name : 'RALETED_OBJECT_TYPE',
				type : 'int'
			}, {
				name : 'RELATED_OBJECT_ID',
				type : 'string'
			}, {
				name : 'CREATE_USER',
				type : 'string'
			}, {
				name : 'CREATE_DATE',
				type : 'date'
			}, {
				name : 'CHANGE_USER',
				type : 'string'
			}, {
				name : 'CHANGE_DATE',
				type : 'date'
			}
		]
	},
	COMMENT_TYPE : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'NAME',
				type : 'string'
			}
		]
	},
	COMMENT_ASSIGNATION : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'COMMENT_ID',
				type : 'string'
			}, {
				name : 'RELATED_OBJECT_ID',
				type : 'string'
			}, {
				name : 'RALETED_OBJECT_TYPE',
				type : 'int'
			}, {
				name : 'CREATE_USER',
				type : 'string'
			}, {
				name : 'CREATE_DATE',
				type : 'date'
			}, {
				name : 'CHANGE_USER',
				type : 'string'
			}, {
				name : 'CHANGE_DATE',
				type : 'date'
			}
		]
	},
	LOCATION_MOBILE : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'EMPLOYEE_ID',
				type : 'string'
			}, {
				name : 'ID',
				type : 'int'
			}, {
				name : 'USER_NAME',
				type : 'string'
			}, {
				name : 'HOST_NAME',
				type : 'string'
			}
		]
	},
	DOCUMENT_ASSIGNATION : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'DOCUMENT_ID',
				type : 'string'
			}, {
				name : 'RELATED_OBJECT_ID',
				type : 'string'
			}, {
				name : 'RALETED_OBJECT_TYPE',
				type : 'int'
			}, {
				name : 'CREATE_USER',
				type : 'string'
			}, {
				name : 'CREATE_DATE',
				type : 'date'
			}, {
				name : 'CHANGE_USER',
				type : 'string'
			}, {
				name : 'CHANGE_DATE',
				type : 'date'
			}
		]
	},
	PRODUCT_GROUP : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'NAME',
				type : 'string'
			}, {
				name : 'PRODUCT_GROUP_DIVISION_ID',
				type : 'string'
			}
		]
	},
	LOCATION_MOBILE_DATA_RANGE : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'LOCATION_MOBILE_ID',
				type : 'string'
			}, {
				name : 'EMPLOYEE_ID',
				type : 'string'
			}, {
				name : 'ACTIVITY_DATE',
				type : 'date'
			}
		]
	},
	CONTACT : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'VALUE',
				type : 'string'
			}, {
				name : 'COMMENT',
				type : 'string'
			}, {
				name : 'CONTACT_TYPE_ID',
				type : 'string'
			}, {
				name : 'CREATE_USER',
				type : 'string'
			}, {
				name : 'CREATE_DATE',
				type : 'date'
			}, {
				name : 'CHANGE_USER',
				type : 'string'
			}, {
				name : 'CHANGE_DATE',
				type : 'date'
			}, {
				name : 'IS_REMINDER_CONTACT',
				type : 'int'
			}
		]
	},
	ORGANIZATION_EMPLOYEE_FILTER : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'ORGANIZATION_EMPLOYEE_ID',
				type : 'string'
			}, {
				name : 'ORGANIZATION_ID',
				type : 'string'
			}, {
				name : 'EMPLOYEE_ID',
				type : 'string'
			}
		]
	},
	ADDRESS : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'CITY',
				type : 'string'
			}, {
				name : 'POSTAL_CODE',
				type : 'string'
			}, {
				name : 'ADDRESS_LINE',
				type : 'string'
			}, {
				name : 'ADDRESS_TYPE_ID',
				type : 'string'
			}, {
				name : 'IS_MARKETING_ADDRESS',
				type : 'int'
			}, {
				name : 'LATITUDE',
				type : 'float'
			}, {
				name : 'LONGITUDE',
				type : 'float'
			}, {
				name : 'CREATE_USER',
				type : 'string'
			}, {
				name : 'CREATE_DATE',
				type : 'date'
			}, {
				name : 'CHANGE_USER',
				type : 'string'
			}, {
				name : 'CHANGE_DATE',
				type : 'date'
			}
		]
	},
	COMMENT : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'PRIORITY',
				type : 'int'
			}, {
				name : 'TEXT',
				type : 'string'
			}, {
				name : 'EMPLOYEE_ID',
				type : 'string'
			}, {
				name : 'COMMENT_TYPE_ID',
				type : 'string'
			}, {
				name : 'CREATE_USER',
				type : 'string'
			}, {
				name : 'CREATE_DATE',
				type : 'date'
			}, {
				name : 'CHANGE_USER',
				type : 'string'
			}, {
				name : 'CHANGE_DATE',
				type : 'date'
			}, {
				name : 'DATE',
				type : 'date'
			}
		]
	},
	ACTIVITY_EMPLOYEE_FILTER : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'ACTIVITY_EMPLOYEE_ID',
				type : 'string'
			}, {
				name : 'ACTIVITY_ID',
				type : 'string'
			}, {
				name : 'ACTIVITY_DATE',
				type : 'date'
			}, {
				name : 'EMPLOYEE_ID',
				type : 'string'
			}
		]
	},
	DOCUMENT : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'FILENAME',
				type : 'string'
			}, {
				name : 'FILE_SIZE',
				type : 'int'
			}, {
				name : 'DESCRIPTION',
				type : 'string'
			}, {
				name : 'EXTERNAL_URL',
				type : 'string'
			}
		]
	},
	ORGANIZATION : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'OFFICIAL_NAME',
				type : 'string'
			}, {
				name : 'INTERNAL_NAME',
				type : 'string'
			}, {
				name : 'ADDITIONAL_NAME',
				type : 'string'
			}, {
				name : 'CODE',
				type : 'string'
			}, {
				name : 'RATING',
				type : 'string'
			}, {
				name : 'IMPORTANCE',
				type : 'string'
			}, {
				name : 'PENETRATION',
				type : 'string'
			}, {
				name : 'ORGANIZATION_TYPE_ID',
				type : 'string'
			}, {
				name : 'ORGANIZATION_STATUS_ID',
				type : 'string'
			}, {
				name : 'EMPLOYEE_COUNT',
				type : 'int'
			}, {
				name : 'CREATE_USER',
				type : 'string'
			}, {
				name : 'CREATE_DATE',
				type : 'date'
			}, {
				name : 'CHANGE_USER',
				type : 'string'
			}, {
				name : 'CHANGE_DATE',
				type : 'date'
			}
		]
	},
	CUSTOMER : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'FIRST_NAME',
				type : 'string'
			}, {
				name : 'LAST_NAME',
				type : 'string'
			}, {
				name : 'CODE',
				type : 'string'
			}, {
				name : 'GENDER',
				type : 'string'
			}, {
				name : 'MARITAL_STATUS',
				type : 'int'
			}, {
				name : 'BIRTH_DATE',
				type : 'date'
			}, {
				name : 'SPOUSE_NAME',
				type : 'string'
			}, {
				name : 'CHILDREN_AMOUNT',
				type : 'int'
			}, {
				name : 'CHILDREN_NAMES',
				type : 'string'
			}, {
				name : 'IS_ACTIVE',
				type : 'int'
			}, {
				name : 'IS_KOL',
				type : 'int'
			}, {
				name : 'CREATE_USER',
				type : 'string'
			}, {
				name : 'CREATE_DATE',
				type : 'date'
			}, {
				name : 'CHANGE_USER',
				type : 'string'
			}, {
				name : 'CHANGE_DATE',
				type : 'date'
			}
		]
	},
	ACTIVITY : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'SUBJECT',
				type : 'string'
			}, {
				name : 'VENUE',
				type : 'string'
			}, {
				name : 'START_DATE',
				type : 'date'
			}, {
				name : 'END_DATE',
				type : 'date'
			}, {
				name : 'ACTIVITY_TYPE_ID',
				type : 'string'
			}, {
				name : 'ACTIVITY_STATUS_ID',
				type : 'string'
			}, {
				name : 'ACTIVITY_PURPOSE_ID',
				type : 'string'
			}, {
				name : 'CREATE_USER',
				type : 'string'
			}, {
				name : 'CREATE_DATE',
				type : 'date'
			}, {
				name : 'CHANGE_USER',
				type : 'string'
			}, {
				name : 'CHANGE_DATE',
				type : 'date'
			}
		]
	},
	PRODUCT : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'NAME',
				type : 'string'
			}, {
				name : 'PICTURE',
				type : 'string'
			}, {
				name : 'IS_ACTIVE',
				type : 'int'
			}, {
				name : 'IS_KEY_PRODUCT',
				type : 'int'
			}, {
				name : 'POSITIONING',
				type : 'string'
			}, {
				name : 'REASON_FOR_USE',
				type : 'string'
			}, {
				name : 'EMPLOYEE_ID',
				type : 'string'
			}, {
				name : 'ADVANTAGES',
				type : 'string'
			}, {
				name : 'DISADVANTAGES',
				type : 'string'
			}
		]
	},
	ORGANIZATION_EMPLOYEE : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'ORGANIZATION_ID',
				type : 'string'
			}, {
				name : 'EMPLOYEE_ID',
				type : 'string'
			}
		]
	},
	ORGANIZATION_CUSTOMER : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'IS_MAIN_ORGANIZATION',
				type : 'int'
			}, {
				name : 'CUSTOMER_ID',
				type : 'string'
			}, {
				name : 'CUSTOMER_IMPORTANCE_ID',
				type : 'string'
			}, {
				name : 'CUSTOMER_TYPE_ID',
				type : 'string'
			}, {
				name : 'CUSTOMER_POSITION_ID',
				type : 'string'
			}, {
				name : 'ORGANIZATION_ID',
				type : 'string'
			}, {
				name : 'CUSTOMER_STATUS_ID',
				type : 'string'
			}, {
				name : 'FULL_PART_TIME',
				type : 'int'
			}, {
				name : 'CREATE_USER',
				type : 'string'
			}, {
				name : 'CREATE_DATE',
				type : 'date'
			}, {
				name : 'CHANGE_USER',
				type : 'string'
			}, {
				name : 'CHANGE_DATE',
				type : 'date'
			}
		]
	},
	ACTIVITY_CUSTOMER : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'ACTIVITY_ID',
				type : 'string'
			}, {
				name : 'CUSTOMER_ID',
				type : 'string'
			}, {
				name : 'CREATE_USER',
				type : 'string'
			}, {
				name : 'CREATE_DATE',
				type : 'date'
			}, {
				name : 'CHANGE_USER',
				type : 'string'
			}, {
				name : 'CHANGE_DATE',
				type : 'date'
			}
		]
	},
	ACTIVITY_PRODUCT : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'ACTIVITY_ID',
				type : 'string'
			}, {
				name : 'PRODUCT_ID',
				type : 'string'
			}, {
				name : 'SEQUENCE',
				type : 'int'
			}, {
				name : 'CREATE_USER',
				type : 'string'
			}, {
				name : 'CREATE_DATE',
				type : 'date'
			}, {
				name : 'CHANGE_USER',
				type : 'string'
			}, {
				name : 'CHANGE_DATE',
				type : 'date'
			}
		]
	},
	ACTIVITY_EMPLOYEE : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'ACTIVITY_ID',
				type : 'string'
			}, {
				name : 'ACTIVITY_ROLE_ID',
				type : 'string'
			}, {
				name : 'EMPLOYEE_ID',
				type : 'string'
			}, {
				name : 'CREATE_USER',
				type : 'string'
			}, {
				name : 'CREATE_DATE',
				type : 'date'
			}, {
				name : 'CHANGE_USER',
				type : 'string'
			}, {
				name : 'CHANGE_DATE',
				type : 'date'
			}
		]
	},
	ACTIVITY_ORGANIZATION : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'ACTIVITY_ID',
				type : 'string'
			}, {
				name : 'ORGANIZATION_ID',
				type : 'string'
			}, {
				name : 'ACTIVITY_ORGANIZATION_TYPE_ID',
				type : 'string'
			}, {
				name : 'CREATE_USER',
				type : 'string'
			}, {
				name : 'CREATE_DATE',
				type : 'date'
			}, {
				name : 'CHANGE_USER',
				type : 'string'
			}, {
				name : 'CHANGE_DATE',
				type : 'date'
			}
		]
	},
	PRODUCT_PRODUCT_GROUP : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'PRODUCT_GROUP_ID',
				type : 'string'
			}, {
				name : 'PRODUCT_ID',
				type : 'string'
			}
		]
	},
	ACTIVITY_TYPE_GROUP : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'NAME',
				type : 'string'
			}
		]
	},
	ORGANIZATION_TYPE_GROUP : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'NAME',
				type : 'string'
			}, {
				name : 'DESCRIPTION',
				type : 'string'
			}
		]
	},
	PRODUCT_GROUP_DIVISION : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'NAME',
				type : 'string'
			}
		]
	},
	EMPLOYEE : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'USER_ID',
				type : 'string'
			}, {
				name : 'CODE',
				type : 'string'
			}, {
				name : 'FIRST_NAME',
				type : 'string'
			}, {
				name : 'LAST_NAME',
				type : 'string'
			}, {
				name : 'IS_ACTIVE',
				type : 'int'
			}, {
				name : 'MIDDLE_INITIAL',
				type : 'string'
			}, {
				name : 'DEPARTMENT',
				type : 'string'
			}
		]
	},
	ACTIVITY_PURPOSE : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'NAME',
				type : 'string'
			}, {
				name : 'DESCRIPTION',
				type : 'string'
			}, {
				name : 'ACTIVITY_TYPE_GROUP_ID',
				type : 'string'
			}
		]
	},
	ACTIVITY_STATUS : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'NAME',
				type : 'string'
			}, {
				name : 'DESCRIPTION',
				type : 'string'
			}, {
				name : 'ACTIVITY_STATUS_ID',
				type : 'string'
			}, {
				name : 'ACTIVITY_TYPE_GROUP_ID',
				type : 'string'
			}
		]
	},
	ACTIVITY_TYPE : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'NAME',
				type : 'string'
			}, {
				name : 'DESCRIPTION',
				type : 'string'
			}, {
				name : 'ACTIVITY_TYPE_GROUP_ID',
				type : 'string'
			}
		]
	},
	ACTIVITY_ROLE : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'NAME',
				type : 'string'
			}, {
				name : 'ACTIVITY_TYPE_GROUP_ID',
				type : 'string'
			}
		]
	},
	ADDRESS_TYPE : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'NAME',
				type : 'string'
			}
		]
	},
	CONTACT_TYPE : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'NAME',
				type : 'string'
			}, {
				name : 'DESCRIPTION',
				type : 'string'
			}, {
				name : 'TYPE',
				type : 'int'
			}
		]
	},
	CONTACT_ASSIGNATION : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'CONTACT_ID',
				type : 'string'
			}, {
				name : 'RELATED_OBJECT_ID',
				type : 'string'
			}, {
				name : 'RALETED_OBJECT_TYPE',
				type : 'int'
			}, {
				name : 'CREATE_USER',
				type : 'string'
			}, {
				name : 'CREATE_DATE',
				type : 'date'
			}, {
				name : 'CHANGE_USER',
				type : 'string'
			}, {
				name : 'CHANGE_DATE',
				type : 'date'
			}
		]
	},
	CUSTOMER_IMPORTANCE : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'NAME',
				type : 'string'
			}
		]
	},
	CUSTOMER_POSITION : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'NAME',
				type : 'string'
			}, {
				name : 'DESCRIPTION',
				type : 'string'
			}
		]
	},
	CUSTOMER_STATUS : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'NAME',
				type : 'string'
			}
		]
	},
	CUSTOMER_TYPE : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'NAME',
				type : 'string'
			}, {
				name : 'DESCRIPTION',
				type : 'string'
			}
		]
	},
	ORGANIZATION_TYPE : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'NAME',
				type : 'string'
			}, {
				name : 'DESCRIPTION',
				type : 'string'
			}, {
				name : 'ORGANIZATION_TYPE_GROUP_ID',
				type : 'string'
			}
		]
	},
	ORGANIZATION_STATUS : {
		fields : [{
				name : 'OBJECT_ID',
				type : 'string'
			}, {
				name : 'NAME',
				type : 'string'
			}, {
				name : 'DESCRIPTION',
				type : 'string'
			}, {
				name : 'IS_ACTIVE',
				type : 'int'
			}
		]
	}
};
 