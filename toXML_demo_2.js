(function() {
    // create a XMLObject constructor function, inheriting from Object
    var XMLObject = (function(Parent) {
        var Temp = function() {};
        var Child = function() {};

        Temp.prototype = Parent.prototype;
        Child.prototype = new Temp();
        Child.parent = Parent.prototype;
        Child.prototype.constructor = Child;

        return Child;
    })(Object);
    
    // inputs: 
    //   options: a option hash
    //     options[root]: xml root tag, "root" if unspecified
    // 
    // output:
    //   -1 if parsing failed
    //   a XML string if parsing successful
    XMLObject.prototype.toXML = function(options) {
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
        var obj_result = obj_to_xml(this);
        if (obj_result === -1) {
            return -1;
        }
        result = result.concat(obj_result);
        result.push("</" + root + ">");

        return result.join("");
    };
    
    var input_1 = {
        name: 'John',
        addr: {
            city: 'San Francisco',
            state: 'CA'
        }
    };
    
    console.log("usage 4: adding the function to child class");
    // use XMLObject.prototype.toXML as if input_1 were a XMLObject
    console.log(XMLObject.prototype.toXML.call(input_1));
})();