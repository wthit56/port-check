// port-check

var simpleLog = require("simple-log");

function node_open_port_isOpen(port, callback) {
	var server = net.createServer().listen(port, function (err) {
		server.once("close", function () {
			callback(true);
		}).close();
	}).on("error", function (err) {
		callback(false);
	});
}

function node_open_port_findOpen(from, tries, preferred, callback) {
	if (!(callback instanceof Function)) { return callback(new Error(simpleLog(callback) + " callback is invalid; value must be a function.")); }
	
	if (tries == null) { tries = 10; }
	else if ((typeof tries !== "number") || (tries < 1) || (tries > 100)) {
		callback(new Error(simpleLog(tries) + " tries is invalid; value must be a number between 1 and 100 (inclusive).")); return;
	}

	if (from == null) { from = 80; }
	else if (from < 0) {
		callback(new Error("From port " + simpleLog(from) + " is invalid; value must be null, undefined, or a number 0 or greater.")); return;
	}
	
	var port, tryCount, usedPorts = [];
	function isOpen(open) {
		if (open) { callback(null, port); }
		else {
			if(++tryCount > tries){
				callback(new Error("Could not find open port after " + simpleLog(tries) + " tries.")); return;
			}
			else {
				while (usedPorts.indexOf(port = from + (Math.random() * 1000) | 0) !== -1) { }
				usedPorts.push(port);
				node_open_port_isOpen(port, isOpen);
			}
		}
	}
	
	if (preferred != null) {
		if ((typeof preferred !== "number") || (preferred < 0) || (preferred < from)) {
			callback(new Error("Preferred port " + simpleLog(preferred) + " is invalid; value must be null, undefined, or a number greater than 'from' if it provided, or 80 if it is not.")); return;
		}
		
		port = preferred; usedPorts.push(preferred);
		node_open_port_isOpen(preferred, isOpen);
	}
	else {
		isOpen(false);
	}
}

modules.exports = {
	isOpen: node_open_port_isOpen,
	findOpen: node_open_port_findOpen
};
