Ext.ns('acrm.data');

acrm.data.Proxy = function() {

    this.loadingIsComplete = false;
	this.serverURL = 'http://test1/Remote/';

};

acrm.data.Proxy.prototype = {

    request: function(command, callback) {
        var that = this;

        this.loadingIsComplete = false;

        Ext.Ajax.request({
            url: this.serverURL + '/' + command,
            success: function(response, opts) {
                var result = Ext.decode(response.responseText);
                that.loadingIsComplete = true;
                if (typeof callback == 'function') {
                    callback.call(that, result);
                }
            },
            failure: function(response, opts) {
				throw 'Server error with status code : ' + response.status;
            }
        });
    },
};