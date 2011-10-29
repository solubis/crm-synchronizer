describe("Web SQL Proxy", function() {

	it("Test SQL Proxy", function() {

		var isCompleted = false;

		// Create Proxy
		var proxy = new acrm.data.Proxy({
			dbName: 'acrm',
			dbTable: 'PRODUCT',
			dbVersion: '1.00',
			dbDescription: 'Adaptive CRM Database'
		});
		
		proxy.on('beforesync', function() {
			isCompleted = false;
		});

		proxy.on('aftersync', function() {
			isCompleted = true;
		});

		// Create database (if exists this does nothing except errors on log)
		// proxy.createDatabase();
		// Clear tables
		proxy.truncate('PRODUCT');
		proxy.truncate('CHANGE_TRACKING');

		// Create the Data Store
		var store = new Ext.data.Store({
			proxy: proxy,
			model: 'PRODUCT',
			sorters: [{
				property: 'NAME',
				direction: 'ASC'
			}]
		});

		// Load store
		store.load();

		// Create records
		for (var i = 0; i < 5; i++) {

			var p = Ext.ModelMgr.create({
				NAME: 'Nazwa',
				IS_ACTIVE: true,
				IS_KEY_PRODUCT: true
			},
			'PRODUCT');

			store.add(p);
		};

		// Save records to database

		store.sync();

		waitsFor(function() {
			return isCompleted;
		},
		"end of sync", 1000);

		runs(function() {
			store.each(function(record) {
				var id = record.get('OBJECT_ID');
				expect(id).toBeDefined();
			});
		});

		runs(function() {
			proxy.getTableSize('PRODUCT')
		});

		waitsFor(function() {
			return proxy.count;
		},
		"count rows in table", 1000);

		runs(function() {
			expect(proxy.count).toEqual(5);
		});

		runs(function() {
			store.each(function(record) {
				store.remove(record);
			});
		})

		runs(function() {
			store.sync();
		});

		waitsFor(function() {
			return isCompleted;
		},
		"end of sync", 1000);

		runs(function() {
			proxy.getTableSize('PRODUCT')
		});

		waitsFor(function() {
			return proxy.count != undefined;
		},
		"count rows in table", 1000);

		runs(function() {
			expect(proxy.count).toEqual(0);
		});

	});
});
