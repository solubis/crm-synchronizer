describe("Web SQL Proxy",
function() {

    it("Test SQL Proxy",
    function() {

        // create the Data Store
        var store = new Ext.data.Store({
            model: 'PRODUCT',
            sorters: [{
                property: 'NAME',
                direction: 'ASC'
            }]
        });

        expect(store.getCount()).toEqual(0);

        for (var i = 0; i < 5; i++) {

            var p = Ext.ModelMgr.create({
                NAME: 'Nazwa',
                IS_ACTIVE: true,
                IS_KEY_PRODUCT: true
            },
            'PRODUCT');

            store.add(p);
        };

        expect(store.getCount()).toEqual(5);

        store.sync();
    });
});