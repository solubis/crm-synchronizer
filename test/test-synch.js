describe("Synchronization",
function() {
    var db;

    beforeEach(function() {
        db = acrm.data.Database;
    });


    xit("Test create database from DDL",
    function() {
        db.createDatabase();
    });

    xit("Test Download Records",
    function() {
        runs(function() {
            db.countRecords('PRODUCT')
        });

        waitsFor(function() {
            return db.isComplete;
        },
        "count data", 1000);

        runs(function() {
            expect(db.count).toEqual(5);
        });

        runs(function() {
            db.clearTable('PRODUCT');
        });
        waitsFor(function() {
            return db.isComplete;
        },
        "clear table", 1000);

        runs(function() {
            expect(db.success).toEqual(true);
        });

        runs(function() {
            db.countRecords('PRODUCT');
        });
        waitsFor(function() {
            return db.isComplete;
        },
        "count data", 1000);

        runs(function() {
            expect(db.count).toEqual(0);
        });

        runs(function() {
            db.download();
        });

        waitsFor(function() {
            return db.isComplete;
        },
        "loading data", 1000);

        runs(function() {
            expect(db.count).toEqual(5);
        });
    });
});