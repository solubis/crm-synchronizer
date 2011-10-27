describe("Web SQL Proxy",
function() {


    xit("Test SQL Proxy",
    function() {

	    // create the Data Store
	    var store = Ext.create('Ext.data.Store', {
	        autoDestroy: false,
			autoSync: true,
			autoLoad: true,
	        model: 'PRODUCT',
	        sorters: [{
	            property: 'name',
	            direction:'ASC'
	        }]
	    });
      
    });

   
});