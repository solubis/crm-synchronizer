/**
 *  associations.js
 *
 *  Copyright 2011 Client and Friends. All rights reserved.
 */

Ext.ns('acrm.data');

/**
 *    Structure holding all data model associations reflecting database schema
 *  Used by Sencha Stores
 */
acrm.data.Associations = {

    ACTIVITY:{
        associations:[
            {
                type:'belongsTo',
                model:'ACTIVITY_TYPE'
            },
            {
                type:'belongsTo',
                model:'ACTIVITY_STATUS'
            },
            {
                type:'belongsTo',
                model:'ACTIVITY_PURPOSE'
            },
            {
                type:'hasMany',
                model:'ACTIVITY_PRODUCT',
                name:'PRODUCTS'
            },
            {
                type:'hasMany',
                model:'ACTIVITY_PRODUCT',
                name:'COMMENTS'
            },
            {
                type:'hasMany',
                model:'ACTIVITY_PRODUCT',
                name:'CUSTOMERS'
            }
        ]
    },

    ORGANIZATION_TYPE:{
        associations:[
            {
                type:'belongsTo',
                model:'ORGANIZATION_TYPE_GROUP'
            }
        ]
    },

    ORGANIZATION:{
        associations:[
            {
                type:'belongsTo',
                model:'ORGANIZATION_TYPE'
            },
            {
                type:'belongsTo',
                model:'ORGANIZATION_STATUS'
            },
            {
                type:'hasMany',
                model:'ADDRESS_ASSIGNATION',
                foreignKey:'RELATED_OBJECT_ID',
                name:'ADDRESSES'
            }
        ]
    }
};
