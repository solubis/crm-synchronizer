/**
 *    test-synch.js	
 *    
 *    Created by Jerzy Blaszczyk on 2011-11-03.
 *    Copyright 2011 Client and Friends. All rights reserved.
 */

QUnit.testStart = function(test) {
	console.group("Test: " + test.module + " - " + test.name);
};

module("Synchronizer", {
	setup: function() {
		this.db = new solubis.data.Database('timtrak', 'user', 'password');
		this.db.enableSQLLog(true);
		this.sync = new solubis.data.Synchronizer('http://192.168.1.2/synchronizer/db/', this.db);
	}
});

asyncTest("Create database and download changed data", 3, function() {
	var me = this;
	me.sync.createDatabase(function(result) {
		equal(result, 22, "Funkcja powinna zwrócić liczbę obiektów");
		me.sync.download(function(result) {
			equal(result, 4, "Funkcja powinna zwrócić liczbę obiektów");
			me.db.getTableSize('ChangeLog', function(result) {
				equal(result, 0, "Table size should be 0");
				start();
			});
		});
	});

});

asyncTest("Insert record", 1, function() {
	this.db.insertObject({
		name: 'Task Name'
	},
	'Task', function(result) {
		ok(result.id, "Funkcja powinna zwrócić rekord z wypełnionym kluczem głównym");
		start();
	});

});

asyncTest("Delete record", 1, function() {
	var me = this;

	me.db.insertObject({
		name: 'Task Name'
	},
	'Task', function(result) {
		me.db.deleteObject({
			id: result.id
		},
		'Task', function(result) {
			ok(true, "Skasowanie zakończone sukcesem");
			start();
		});
	});
});

asyncTest("Update record", 1, function() {
	var me = this;

	me.db.insertObject({
		name: 'Task Name'
	},
	'Task', function(result) {
		me.db.updateObject({
			id: result.id,
			name: 'Updated by update'
		},
		'Task', function(result) {
			ok(true, "");
			start();
		});
	});
});

asyncTest("Save record", 1, function() {
	var me = this;

	me.db.insertObject({
		name: 'Task Name'
	},
	'Task', function(result) {
		me.db.saveObject({
			id: result.id,
			name: 'Updated by save'
		},
		'Task', function(result) {
			me.db.saveObject({
				name: 'New'
			},
			'Task', function(result) {
				ok(result.id, "Funkcja powinna zwrócić rekord z wypełnionym kluczem głównym");
				start();
			});
		});
	});
});

asyncTest("Check Change Log", 5, function() {
	var me = this,
		id, o = {
		name: 'Change Log Test'
	};

	me.db.insertObject(o, 'Task', function(result) {
		id = result.id;
		me.db.readLogForObject(id, function(result) {
			equal(result.operation, 'I', "Wpis do logu o typie I");

			o = {
				id: id,
				name: 'Updated Change Log Test'
			};

			me.db.saveObject(o, 'Task', function(result) {
				equal(result.id, id, "Po zapisie istniejącego obiektu id powinien być taki sam");

				me.db.readLogForObject(id, function(result) {
					equal(result.count, 1, "Liczba wpisów do logu powinna być 1");
					equal(result.operation, 'I', "Wpis do logu o typie I");

					me.db.deleteObject(o, 'Task', function(result) {
						me.db.readLogForObject(id, function(result) {
							equal(result.count, 0, "Liczba wpisów do logu powinna być 0");

							start();
						})
					});
				})
			});
		})
	});
});

asyncTest("Delete record downloaded form server", 2, function() {
	var me = this,
		o = {
		id: "8ADDD733-DE5F-E011-9845-444553544202"
	};

	me.db.deleteObject(o, 'Task', function(result) {
		me.db.readLogForObject(o.id, function(result) {
			equal(result.count, 1, "Liczba wpisów do logu powinna być 1");
			equal(result.operation, 'D', "Wpis do logu o typie D");
			start();
		})
	});
});

asyncTest("Select record by ID", 1, function() {
	var me = this;

	me.db.insertObject({
		name: 'Task Name'
	},
	'Task', function(result) {
		me.db.selectObjects({
			table: 'Task',
			id: result.id
		},
		function(result) {
			equal(result.length, 1, "Liczba rekordów powinna być 1");
			start();
		});
	});
});

asyncTest("Select records from log", 1, function() {
	var me = this;

	me.db.selectObjects({
		table: 'ChangeLog'
	},
	function(result) {
		equal(result.length, 6, "Liczba rekordów");
		start();
	});
});

asyncTest("Upload changed records", 1, function() {
	var me = this;

	me.sync.upload(
	function(result) {
		ok(result, "Liczba rekordów");
		console.debug(result);
		start();
	});
});
