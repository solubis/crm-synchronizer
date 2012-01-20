/**
 *    test-synch.js	
 *    
 *    Created by Jerzy Blaszczyk on 2011-11-03.
 *    Copyright 2011 Client and Friends. All rights reserved.
 */

describe("Synchronization", function() {
	var db, isCompleted, proxy, result, ajax, numberOfRecords = 5,
		timeout = 100;

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
	
	var time = function(){
		var t = new Date();
		
		return t.toLocaleTimeString();
	}
	
	beforeEach(function() {
		result = undefined;
		isCompleted = false;
	});

	solubis.data.Synchronizer.setURL('http://192.168.1.2/synchronizer/db/');
	solubis.data.Database.setUser('Jenna Waite');
	solubis.data.Database.setLogging(true);	
	
	xit("Create Database", function() {
		runs(function() {
			console.log('[' + time() + ']' + 'starting download DDL SQL');
			solubis.data.Database.createDatabase(onSuccess);
		});

		waitsFor(requestIsCompleted, "end of download DDL", timeout);

		runs(function() {
			console.log('[' + new Date() + ']' + 'finished downloading and parsing DDL');
		});
	});

	it("Download Data", function() {
		runs(function() {
			console.log('[' + time()  + ']' + 'starting download');
			solubis.data.Synchronizer.download(onSuccess);
		});

		waitsFor(requestIsCompleted, "end of downloading data", timeout);

		runs(function() {
			expect(result).toEqual('success');
			console.log('[' + time()  + ']' + 'finished downloading and inserting to database');
		});
	});
});
