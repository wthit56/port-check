// port-check

var simpleLog = require("simple-log");
var net = require("net");

function isNumber(value){
	return (
		(typeof value === "number") &&
		!isNaN(value) &&
		(value > 0) &&
		(value !== Infinity) &&
		!(value % 1)
	);
}

function portcheck_isOpen(port, callback) {
	if(!(callback instanceof Function)){
		throw new Error("Callback " + simpleLog(callback) + " is invalid; value must be a function.");
	}
	else if (!isNumber(port)) {
		callback(new Error("Port " + simpleLog(port) + " is invalid; value must be (0 <= port(int) < Infinity).")); return;
	}
	else {
		var server = net.createServer().listen(port, function (err) {
			server.once("close", function () {
				callback(null, true);
			}).close();
		}).on("error", function (err) {
			callback(null, false);
		});
	}
}

function portcheck_findOpen(from, tries, preferred, callback) {
	if (!(callback instanceof Function)) { throw new Error(simpleLog(callback) + " callback is invalid; value must be a function."); }
	
	if (tries == null) { tries = 10; }
	else if (!isNumber(tries) || (tries < 1) || (tries > 100)) {
		callback(new Error(simpleLog(tries) + " tries is invalid; value must be (1 <= tries(int) <= 100).")); return;
	}

	if (from == null) { from = 80; }
	else if (!isNumber(from)) {
		callback(new Error("From port " + simpleLog(from) + " is invalid; value must be null, undefined, or (0 <= from(int) < Infinity).")); return;
	}
	
	var port, tryCount, checkedPorts = [];
	function isOpen(error, open) {
		if (open) {
			callback(null, port);
		}
		else {
			if (++tryCount > tries) {
				callback(new Error("Could not find open port after " + tries + " tries.")); return;
			}
			else {
				var i=0;
				while (++i, checkedPorts.indexOf(port = from + (Math.random() * 1000) | 0) !== -1) { }
				checkedPorts.push(port);
				portcheck_isOpen(port, isOpen);
			}
		}
	}
	
	if (preferred != null) {
		if (!isNumber(preferred) || (preferred < from)) {
			callback(new Error("Preferred port " + preferred + " is invalid; value must be null, undefined, or if 'from' is provided (from <= preferred < Infinity), or if 'from' is not provided (80 <= preferred < Infinity).")); return;
		}
		
		port = preferred; checkedPorts.push(preferred);
		portcheck_isOpen(preferred, isOpen);
	}
	else {
		isOpen(false);
	}
}

module.exports = {
	isOpen: portcheck_isOpen,
	findOpen: portcheck_findOpen
};
