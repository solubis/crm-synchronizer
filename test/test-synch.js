/**
*    test-synch.js	
*    
*    Created by Jerzy Blaszczyk on 2011-11-03.
*    Copyright 2011 Client and Friends. All rights reserved.
*/

describe("Synchronization", function() {
	var db;

	var isCompleted, proxy, result, ajax, numberOfRecords = 5,
		timeout = 10000;

	var requestIsCompleted = function() {
		return isCompleted;
	};

	var onSuccess = function(rs) {
		if (rs == undefined) {
			throw new Error('Result undefined');
		}
		result = rs;
		isCompleted = true;
	};
	
	// For testing with files instead of services
	acrm.data.useFiles = false;

	// Server URL
	if (acrm.data.useFiles) 
		acrm.data.serverURL = 'http://localhost/acrmsynch/db';
	else 
		acrm.data.serverURL = 'http://10.46.1.5:804/AdaptiveCrmMobileService.svc';

	acrm.data.Database.setUser('Jenna Waite');
	proxy = acrm.data.Database.getProxy();
	
	AOP.object(proxy);
	AOP.enable();
	proxy.logSQL = false;

	proxy.on('complete', function() {
		isCompleted = true;
	});

	beforeEach(function() {
		result = undefined;
		isCompleted = false;
	});

	it("Initialize Database", function() {
		runs(function() {
			console.log('[' + new Date() + ']' + 'initializing database');
			acrm.data.Database.initDatabase(true, onSuccess);
		});

		waitsFor(requestIsCompleted, "end of init database", timeout);

		runs(function() {
			console.log('[' + new Date() + ']' + 'finished - database created')
		});
	});

	it("Download Processing Order", function() {
		runs(function() {
			console.log('[' + new Date() + ']' + 'starting download processing order');
			acrm.data.Synchronizer.getProcessingOrder(onSuccess);
		});

		waitsFor(requestIsCompleted, "end of download processing order", timeout);

		runs(function() {
			console.log('[' + new Date() + ']' + 'finished downloading and parsing processing order');
			expect(result[0]).toEqual('ACTIVITY_TYPE_GROUP');
		});
	});

	it("Download Data", function() {
		runs(function() {
			console.log('[' + new Date() + ']' + 'starting download');
			acrm.data.Synchronizer.download(onSuccess);
		});

		waitsFor(requestIsCompleted, "end of downloading data", timeout);

		runs(function() {
			expect(result).toEqual('success');
			console.log('[' + new Date() + ']' + 'finished downloading and inserting to database');
		});
	});
});
