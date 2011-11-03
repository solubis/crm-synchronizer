describe("Web SQL Proxy", function() {

	var isCompleted, proxy, result, store, numberOfRecords = 5,
		timeout = 500;

	var requestIsCompleted = function() {
		return isCompleted;
	};

	var onSuccess = function(rs) {
		result = rs;
		isCompleted = true;
	};
	
	var resetResults = function() {
		result = undefined;
		isCompleted = false;	
	};
	
	beforeEach(resetResults);

	proxy = acrm.Database.getProxy();
	proxy.logSQL = true;
	proxy.on('complete', onSuccess);

	it("Initialize Database", function() {
		proxy.initDatabase();
	});

	it("Create DataStore", function() {
		store = acrm.Database.getStore('PRODUCT');

		expect(store.getProxy().getTableName()).toEqual('PRODUCT');
		expect(store.getProxy().getIdProperty()).toEqual('OBJECT_ID');
	});

	it("Load DataStore", function() {
		runs(function() {
			store.load(onSuccess)
		});

		waitsFor(requestIsCompleted, "end of load", timeout);

		runs(function() {
			expect(store.getCount()).toBeGreaterThan(0)
		});
	});

	it("Truncate Tables", function() {
		proxy.truncate('PRODUCT');
		proxy.truncate('CHANGE_TRACKING');

		runs(function() {
			result = undefined;
			proxy.getTableSize('PRODUCT', onSuccess);
		});

		waitsFor(requestIsCompleted, "count rows in table", timeout);

		runs(function() {
			expect(result).toEqual(0);
		});
	});

	it("Load DataStore", function() {
		runs(function() {
			store.load(onSuccess)
		});

		waitsFor(requestIsCompleted, "end of load", timeout);

		runs(function() {
			expect(store.getCount()).toEqual(0);
		});
	});

	it("Create records", function() {
		expect(store.getCount()).toEqual(0);
		for (var i = 0; i < numberOfRecords; i++) {

			var p = Ext.ModelMgr.create({
				NAME: 'Nazwa',
				IS_ACTIVE: true,
				IS_KEY_PRODUCT: true
			},
			'PRODUCT');

			store.add(p);
		};
		expect(store.getCount()).toEqual(numberOfRecords);
	});

	it("Save records", function() {
		expect(store.getCount()).toEqual(numberOfRecords);
		// Save records to database
		runs(function() {
			store.sync();
		});

		waitsFor(requestIsCompleted, "end of sync", timeout * numberOfRecords / 5);

		runs(function() {
			store.each(function(record) {
				var id = record.get('OBJECT_ID');
				expect(id).toBeDefined();
			});
		});
		
		runs(resetResults);

		runs(function() {
			result = undefined;
			proxy.getTableSize('PRODUCT', onSuccess);
		});

		waitsFor(requestIsCompleted, "count rows in table", timeout);

		runs(function() {
			expect(result).toEqual(store.getCount());
		});
	});

	it("Delete records", function() {

		runs(function() {
			store.removeAt(0);
			store.removeAt(1);
			store.sync();
		});

		waitsFor(requestIsCompleted, "end of sync", timeout);
		
		runs(resetResults);

		runs(function() {
			result = undefined;
			proxy.getTableSize('PRODUCT', onSuccess);
		});

		waitsFor(requestIsCompleted, "count rows in table", timeout);

		runs(function() {
			expect(result).toEqual(numberOfRecords - 2);
		});

	});

	it("Update records", function() {
 
		var id1, id2;
		
		runs(function() {
			var r1 = store.getAt(0);
			var r2 = store.getAt(1);
			id1 = r1.get('OBJECT_ID');
			id2 = r2.getId();
			r1.set('NAME', 'NowaNazwa');
			r2.set('NAME', 'NowaNazwa');
			//r1.save();
			//r2.save();
			store.sync();
		});

		waitsFor(requestIsCompleted, "end of sync", timeout);
		
		runs(resetResults);

		runs(function() {
			store.load(onSuccess);
		});

		waitsFor(requestIsCompleted, "and of load", timeout);

		runs(function() {
			var r1 = store.getById(id1);
			var r2 = store.getById(id2);
			expect(r1.get('NAME')).toEqual('NowaNazwa');
			expect(r2.get('NAME')).toEqual('NowaNazwa');
		});

	});

});
