describe("Ajax",
function() {
    var ajax;

    beforeEach(function() {
        ajax = new acrm.data.Ajax();
    });

    xit("Test Sencha Ajax Request",
    function() {
        var data;
        ajax.request('data.js',
        function(result) {
            data = result;
        });

        waitsFor(function() {
            return ajax.loadingIsComplete;
        },
        "loading results", 1000);

        runs(function() {
            expect(data.rows).toBeDefined();
            expect(data.rows[0].id).toEqual('A1');
        });
    });

});