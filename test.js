var simpleLog = require("simple-log");
//var pc = require("./index.js");
var pc = require("c:/git/port-check/index.js");

var net = require("net");
var closed = 8765;
var server = net.createServer().listen(closed, function (err) {
}).on("error", function (err) {
	throw "Cannot hook up port 8765 for testing.";
});

function testError(action, message){
	try{
		action();
	}
	catch(error){
		return;
	}
	
	throw "No error thrown when error expected."+(message?" "+message:"");
}
function errorCallback(error) {
	if(!error){
		throw "No error sent to callback when error expected."+(errorCallback.message ? " "+errorCallback.message : "");
	}
}
errorCallback.message = null;

function testBadNumbers(action) {
	errorCallback.message = "Non-number port."; action("string", errorCallback);
	errorCallback.message = "NaN port."; action(+"NaN", errorCallback);
	errorCallback.message = "Non-integer port."; action(1.5, errorCallback);
	errorCallback.message = "Port < 0."; action(-1, errorCallback);
	errorCallback.message = "Port Infinity."; action(Infinity, errorCallback);
}

(function isOpenTests(){
	testError(function() { pc.isOpen(); }, "No callback.");
	testError(function() { pc.isOpen(1); }, "No callback.");

	testBadNumbers(function(port, callback){pc.isOpen(port, callback);});

	pc.isOpen(8765, function(error, isOpen){
		if(isOpen){throw "Port 8765 is closed; isOpen returned "+simpleLog(isOpen)+" (isOpen)";}
	});

	function validCallback(error, isOpen) {
		if(error){throw "Error returned: "+error.message;}
		if((isOpen!==true) && (isOpen!==false)){
			throw "Invalid isOpen ("+simpleLog(isOpen)+")";
		}
	}
	for (var i = 0; i < 10; i++) {
		pc.isOpen(80 + ((Math.random() * 1000) | 0), validCallback);
	}
})();

(function findOpenTests() {
	// (from, tries, preferred, callback)
	testError(function() { pc.findOpen(); }, "No callback.");
	testError(function() { pc.findOpen(1,1,1); }, "No callback.");
	
	testBadNumbers(function(port, callback){pc.findOpen(port, null, null, callback);}, "Invalid 'from' port.");
	var port;
	for(var i=0; i<10; i++){
		port = 80 + ((Math.random()*1000)|0);
		pc.findOpen(port, null, null, (function(port){
			return function(error, foundPort){
				if(error){
					throw simpleLog(port)+" is a valid port; no errors should be returned. Error: "+error.message+" "+simpleLog(error);
				}
				else if(foundPort < port){throw simpleLog(foundPort) + " < "+simpleLog(port);}
			};
		})(port));
	}
	
	testBadNumbers(function(port, callback){pc.findOpen(null, port, null, callback);}, "Invalid 'tries'.");
	testBadNumbers(function(port, callback){pc.findOpen(null, null, port, callback);}, "Invalid 'preffered' port.");
	
	pc.findOpen(null, null, closed, function(error, isOpen){
		if(isOpen===closed){throw "Port 8765 is closed; findOpen returned port "+simpleLog(isOpen);}
	});

})();

server.on("close", function(){
	console.log("Tests passed!");
}).close();
