SynchronizerTest = TestCase("SynchronizerTest", {
    setUp:function () {
    }
});


SynchronizerTest.prototype.testCreateDatabase = function () {
    acrm.data.Database.setUser('Jenna Waite');
    acrm.data.Database.createDatabase(function (result) {
        assertEquals("success", result);
    });
};