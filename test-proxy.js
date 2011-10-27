describe("Proxy",
function() {
    var proxy;

    beforeEach(function() {
        proxy = new acrm.data.Proxy();
    });

    it("Test Sencha Ajax Request",
    function() {
        var data;
        proxy.request('product.json',
        function(result) {
            data = result;
        });

        waitsFor(function() {
            return proxy.loadingIsComplete;
        },
        "loading results", 1000);

        runs(function() {
            expect(data.INSERT).toBeDefined();
            expect(data.INSERT[0].values.length).toEqual(5);
        });
    });

});