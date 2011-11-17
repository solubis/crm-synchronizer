/**
 *    aop.js	
 *    
 *    Created by Jerzy Blaszczyk on 2011-10-30.
 *    Copyright 2011 Jerzy Blaszczyk. All rights reserved.
 *    File used only in development environement for debugging
 */

InvalidAspect = new Error("Missing a valid aspect. Aspect is not a function.");
InvalidObject = new Error("Missing valid object or an array of valid objects.");
InvalidMethod = new Error("Missing valid method to apply aspect on.");

function doBefore(beforeFunc, func) {
	return function() {
		beforeFunc.apply(this, arguments);
		return func.apply(this, arguments);
	};
}

function doAfter(func, afterFunc) {
	return function() {
		var res = func.apply(this, arguments);
		afterFunc.apply(this, arguments);
		return res;
	};
}

var AOP = {

    isEnabled: false,

    disable: function() {
        this.isEnabled = false;
    },

    enable: function() {
        this.isEnabled = true;
    },

    _addIntroduction: function(intro, obj) {
        for (var m in intro.prototype) {
            obj.prototype[m] = intro.prototype[m];
        }
    },

    addIntroduction: function(aspect, objs) {
        var oType = typeof(objs);

        if (typeof(aspect) != 'function') throw (InvalidAspect);

        if (oType == 'function') {
            this._addIntroduction(aspect, objs);
        } else if (oType == 'object') {
            for (var n = 0; n < objs.length; n++) {
                this._addIntroduction(aspect, objs[n]);
            }
        } else {
            throw InvalidObject;
        }
    },

    addBefore: function(aspect, obj, funcs) {
        var fType = typeof(funcs);

        if (typeof(aspect) != 'function') throw (InvalidAspect);

        if (fType != 'object') funcs = Array(funcs);

        for (var n = 0; n < funcs.length; n++) {
            var fName = funcs[n];
            var old = obj[fName];

            if (!old) throw InvalidMethod;

            var res = doBefore(aspect, old);
            obj[fName] = res;
        }
    },

    addAfter: function(aspect, obj, funcs) {
        if (typeof(aspect) != 'function') throw InvalidAspect;

        if (typeof(funcs) != 'object') funcs = Array(funcs);

        for (var n = 0; n < funcs.length; n++) {
            var fName = funcs[n];
            var old = obj.prototype[fName];

            if (!old) throw InvalidMethod;

            var res = doAfter(old, aspect);
            obj.prototype[fName] = res;
        }
    },

    addAround: function(aspect, obj, funcs) {
        if (typeof(aspect) != 'function') throw InvalidAspect;

        if (typeof(funcs) != 'object') funcs = Array(funcs);

        for (var n = 0; n < funcs.length; n++) {
            var fName = funcs[n];
            var old = obj.prototype[fName];
            if (!old) throw InvalidMethod;

            var res = aspect(old);
            obj.prototype[fName] = res;
        }

        return true;
    },

    object: function(object, name) {

        if (!this.isEnabled) return;

        for (i in object) {
            var member = object[i];
            if (typeof member === 'function') {
                AOP.addBefore(function() {
                    var obj = name || object.className || object.name || 'Object',
                        method = i;
                    return function() {
                        var args = Array.prototype.slice.call(arguments);

                        for (var i = 0; i < args.length; i++) {
                            var a = args[i];
                            if (a === null) {
                                args[i] = 'null';
                            } else {
                                if (typeof a === 'object') {
                                    args[i] = (a.name ? a.name : '') || (a.className ? a.className : '') || a.id || 'o';
                                }
                            }
                        }
                        console.log(obj + ' -> ' + method + '[' + args.join(', ') + ']')
                    }
                }(), object, i);
            }
        }
    }
};
