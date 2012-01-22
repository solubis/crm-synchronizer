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
			ok(true, "");
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

asyncTest("Check Change Log Rows", 1, function() {
	var me = this,
		id, o = {
		name: 'ChangeLog'
	};

	me.db.insertObject(o, 'Task', function(result) {
		id = result.id;
		me.db.readLogForObject(id, function(result) {
			ok(result && result.id && result.operation === 'I');
			start();
		})
	});
});
