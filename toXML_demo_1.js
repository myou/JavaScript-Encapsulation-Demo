// module namespace
var MyApp = {
    "util": {}
};

// inputs: 
//   options: a option hash
//     options[root]: xml root tag, "root" if unspecified
//   obj: the hash to be converted
//     obj cannot contain functions at any level
// 
// output:
//   -1 if parsing failed
//   a XML string if parsing successful
MyApp.util.toXML = function(options, obj) {
    // inner function for recursion
    var obj_to_xml = function(obj) {
        var result = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                result.push("<" + key + ">");

                var val = obj[key];
                if (val instanceof Function) {
                    return -1;
                } else if (val != null && val instanceof Object) {
                    // since null is also an object, avoid passing it to recursion
                    var val_result = obj_to_xml(val);
                    if (val_result === -1) {
                        return -1;
                    }
                    result = result.concat(val_result);
                } else {
                    result.push(val + "");
                }

                result.push("</" + key + ">");
            }
        }
        return result;
    };

    var options = options || {};
    var root = options["root"] || "root";

    // uses an array of strings and joining only in the end to reduce memory usage        
    var result = [];
    result.push("<" + root + ">");
    var obj_result = obj_to_xml(obj);
    if (obj_result === -1) {
        return -1;
    }
    result = result.concat(obj_result);
    result.push("</" + root + ">");

    return result.join("");
};

// uses function currying to attach MyApp.util.toXML to Object prototype
// caches original toXML inside the closure to allow retrieval via unload
(function(toXML) {
    var savedToXML;

    toXML.load = function() {
        savedToXML = Object.prototype.toXML;
        Object.prototype.toXML = function(options) {
            return toXML(options, this);
        };
    };

    toXML.unload = function() {
        Object.prototype.toXML = savedToXML;
    };
})(MyApp.util.toXML);

// cherrypick modules for custom sandbox
MyApp.util.use = function() {
    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop();
    
    var modules;
    if (args[0] && (args[0] instanceof String || typeof(args[0]) === "string")) {
        modules = args;
    } else {
        modules = args[0];
    }

    var lib = {};

    for (var i = 0; i < modules.length; i++) {
        if (MyApp.util[modules[i]]) {
            lib[modules[i]] = MyApp.util[modules[i]];
        }
    }
    
    callback(lib);
};

// usage 1: direct module usage
(function() {
    var input_1 = {
        name: 'John',
        addr: {
            city: 'San Francisco',
            state: 'CA'
        }
    };
	
	console.log("usage 1: direct module usage");
	console.log(input_1);
    console.log(MyApp.util.toXML({
        "root": "user"
    }, input_1));
	console.log("");
})();

// usage 2: using load and unload
(function() {
    var input_1 = {
        name: 'John',
        addr: {
            city: 'San Francisco',
            state: 'CA',
			zip:{
				first:12345,
				second:6789
			}
        }
    };

	console.log("usage 2: using load and unload");
    MyApp.util.toXML.load();
	console.log(input_1);
    console.log(input_1.toXML());
    MyApp.util.toXML.unload();
    console.log("");
})();

// usage 3: custom sandbox
MyApp.util.use("toXML", function(lib) {
    var input_1 = {
        name: null,
        addr: {
            city: undefined,
            state: 5
        }
    };
	
	console.log("usage 3: custom sandbox");
	console.log(input_1);
    console.log(lib.toXML({
        "root": "user"
    }, input_1));
	console.log("");
});