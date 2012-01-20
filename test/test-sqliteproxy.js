xdescribe("Web SQL Proxy", function() {
	var proxy, result, store, organizationStore, organizationTypeGroupStore, organizationTypeStore, numberOfRecords = 5,
		timeout = 10000,
		test = '';

	var requestIsCompleted = function() {
		return isCompleted;
	};

	var onSuccess = function(operation) {
		var start = new Date(),
			end;
		console.log(operation + ' started');
		return function(rs) {
			result = rs;
			isCompleted = true;
			end = new Date();
			console.log(operation + ' completed in ' + (end - start) / 1000 + 's');
		};
	};

	var resetResults = function() {
		result = undefined;
		isCompleted = false;
	};

	beforeEach(resetResults);

	it('Drop database', function() {
		desc = 'Drop database';
		runs(function() {
			solubis.data.Database.setLogging(true);
			solubis.data.Database.init();
			solubis.data.Database.dropDatabase(onSuccess(desc));
		});
		waitsFor(requestIsCompleted, desc, timeout);
	});

	it('Create database', function() {
		desc = 'Create database';
		runs(function() {
			solubis.data.Database.createDatabase(onSuccess(desc));
		});

		waitsFor(requestIsCompleted, desc, timeout);
	});

	it("Create DataStores", function() {
		store = solubis.data.Database.getStore({
			model: 'PRODUCT'
		});

		organizationStore = solubis.data.Database.getStore({
			model: 'ORGANIZATION'
		//	sql: 'SELECT ' +'ORGANIZATION.ORGANIZATION_TYPE_ID, ' + 'ORGANIZATION.INTERNAL_NAME, ' + 'ORGANIZATION.OBJECT_ID AS TYPE_ID, ' + 'ORGANIZATION_TYPE.NAME AS TYPE_NAME, ' + 'ORGANIZATION_TYPE.OBJECT_ID, '+ 'ORGANIZATION_TYPE_GROUP.NAME AS TYPE_GROUP_NAME ' + 'FROM ORGANIZATION INNER JOIN ORGANIZATION_TYPE ON ORGANIZATION.ORGANIZATION_TYPE_ID = ORGANIZATION_TYPE.OBJECT_ID ' + 'INNER JOIN ORGANIZATION_TYPE_GROUP ON ORGANIZATION_TYPE.ORGANIZATION_TYPE_GROUP_ID = ORGANIZATION_TYPE_GROUP.OBJECT_ID',
		});
		
		organizationTypeGroupStore = solubis.data.Database.getStore({
			model: 'ORGANIZATION_TYPE_GROUP'
		});
		organizationTypeStore = solubis.data.Database.getStore({
			model: 'ORGANIZATION_TYPE'
		});

		expect(store.getProxy().getTableName()).toEqual('PRODUCT');
		expect(store.getProxy().getIdProperty()).toEqual('OBJECT_ID');

		expect(organizationStore.getProxy().getTableName()).toEqual('ORGANIZATION');
		expect(organizationStore.getProxy().getIdProperty()).toEqual('OBJECT_ID');
	});

	xit("Load DataStore", function() {
		desc = 'Load DataStore';

		runs(function() {
			store.load(onSuccess(desc));
		});

		waitsFor(requestIsCompleted, desc, timeout);

		runs(function() {
			expect(store.getCount()).toEqual(0);
		});
	});

	xit("Truncate Tables", function() {
		runs(function() {
			solubis.data.Database.truncateTable('PRODUCT');
			solubis.data.Database.truncateTable('CHANGE_TRACKING');
		});

		runs(function() {
			solubis.data.Database.getTableSize('PRODUCT', onSuccess('GetTableSize'));
		});

		waitsFor(requestIsCompleted, "count rows in table", timeout);

		runs(function() {
			expect(result).toEqual(0);
		});
	});

	xit("Load DataStore Again", function() {
		desc = "Load store";
		runs(function() {
			store.load(onSuccess(desc));
		});

		waitsFor(requestIsCompleted, desc, timeout);

		runs(function() {
			expect(store.getCount()).toEqual(0);
		});
	});

	xit("Create records", function() {
		expect(store.getCount()).toEqual(0);
		for (var i = 0; i < numberOfRecords; i++) {

			store.add({
				NAME: 'Nazwa',
				IS_ACTIVE: 0,
				IS_KEY_PRODUCT: 0
			});
		};
		expect(store.getCount()).toEqual(numberOfRecords);
	});

	xit("Save records", function() {
		desc = 'Save record';
		expect(store.getCount()).toEqual(numberOfRecords);

		runs(function() {
			store.getProxy().on('updated', onSuccess('Update operation'));
			store.sync();
		});

		waitsFor(requestIsCompleted, desc, timeout * numberOfRecords / 5);

		runs(function() {
			store.each(function(record) {
				var id = record.get('OBJECT_ID');
				expect(id).toBeDefined();
			});
		});

		runs(resetResults);

		runs(function() {
			result = undefined;
			solubis.data.Database.getTableSize('PRODUCT', onSuccess('GetTableSize'));
		});

		waitsFor(requestIsCompleted, "count rows in table", timeout);

		runs(function() {
			expect(result).toEqual(store.getCount());
		});
	});

	xit("Delete records", function() {

		runs(function() {
			store.removeAt(0);
			store.removeAt(1);
			store.sync();
		});

		waitsFor(requestIsCompleted, "end of sync", timeout);

		runs(resetResults);

		runs(function() {
			result = undefined;
			solubis.data.Database.getTableSize('PRODUCT', onSuccess('GetTableSize'));
		});

		waitsFor(requestIsCompleted, "count rows in table", timeout);

		runs(function() {
			expect(result).toEqual(numberOfRecords - 2);
		});

	});

	xit("Update records", function() {

		var id1, id2;

		runs(function() {
			var r1 = store.getAt(0);
			var r2 = store.getAt(1);
			id1 = r1.get('OBJECT_ID');
			id2 = r2.getId();
			r1.set('NAME', 'NowaNazwa');
			store.sync();
			r2.set('NAME', 'NowaNazwa');
			r2.save();
		});

		waitsFor(requestIsCompleted, "end of sync", timeout);

		runs(resetResults);

		runs(function() {
			store.load(onSuccess('Loading store'));
		});

		waitsFor(requestIsCompleted, "and of load", timeout);

		runs(function() {
			var r1 = store.getById(id1);
			var r2 = store.getById(id2);
			expect(r1.get('NAME')).toEqual('NowaNazwa');
			expect(r2.get('NAME')).toEqual('NowaNazwa');
		});

	});

	////////////////////////////////
	//////    ASSOCIATIONS    //////
	////////////////////////////////
	it("Create records", function() {

		expect(organizationStore.getCount()).toEqual(0);

		runs(resetResults);

		runs(function() {

			var typeGroup = organizationTypeGroupStore.add({
				NAME: 'FARM'
			})[0];

			var type = organizationTypeStore.add({
				NAME: 'Type1'
			})[0];

			typeGroup.save({
				callback: function(r) {
					type.set('ORGANIZATION_TYPE_GROUP_ID', r.get('OBJECT_ID'));
					type.save({
						callback: function(t) {
							for (var i = 0; i < numberOfRecords; i++) {
								var r = organizationStore.add({
									INTERNAL_NAME: 'Nazwa'
								})[0];
								r.setType(t.get('OBJECT_ID'));
							};
							organizationStore.getProxy().on('updated', onSuccess('Store 2 Updated'));
							organizationStore.sync();
						}
					});
				}
			});

		});

		waitsFor(requestIsCompleted, "saving", timeout);
		runs(function() {
			expect(organizationStore.getCount()).toEqual(numberOfRecords);
		});
	});
	
	it("Load DataStore Again", function() {
		desc = "Load store";
		runs(function() {
			organizationStore.load(onSuccess(desc));
		});

		waitsFor(requestIsCompleted, desc, timeout);

		runs(function() {
			expect(organizationStore.getCount()).toEqual(numberOfRecords);
		});
	});

	xit("Update records", function() {

		var id1, id2;

		runs(function() {
			var r1 = organizationStore.getAt(0);
			var r2 = organizationStore.getAt(1);
			id1 = r1.get('OBJECT_ID');
			id2 = r2.getId();
			r1.set('INTERNAL_NAME', 'NowaNazwa');
			organizationStore.sync();
			r2.set('INTERNAL_NAME', 'NowaNazwa');
			r2.save();
		});

		waitsFor(requestIsCompleted, "end of sync", timeout);

		runs(resetResults);

		runs(function() {
			organizationStore.load(onSuccess('Loading store'));
		});

		waitsFor(requestIsCompleted, "end of load", timeout);

		runs(function() {
			var r1 = organizationStore.getById(id1);
			var r2 = organizationStore.getById(id2);
			expect(r1.get('INTERNAL_NAME')).toEqual('NowaNazwa');
			expect(r2.get('INTERNAL_NAME')).toEqual('NowaNazwa');
		});

	});

});
