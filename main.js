var fs = require("fs");
var ain = require("ain");
var util = require("util");
var path = require("path");
var events = require("events");
var colors = require("./colors");

function simplelogger(options) {

	this.syslogopts = {
		tag: null,
		facility: "user",
		hostname: "localhost",
	};

	// Default method activation settings
	this.enabled = [];
	this.enabled.debug = false;
	this.enabled.info = false;
	this.enabled.warn = false;
	this.enabled.error = false;
	this.enabled.stdout = false;
	this.enabled.stderr = false;
	this.enabled.syslog = false;

	// Whether date should be printed
	this.printdate = true;

	this.destinations = {};
	this.destinations.error = ["stderr"];
	this.destinations.warn = ["stdout"];
	this.destinations.info = ["stdout"];
	this.destinations.debug = ["stdout"];
	this.destinations.default = ["stdout"];

	this.parseOptions(options);
	events.EventEmitter.call(this);

}

util.inherits(simplelogger, events.EventEmitter);

simplelogger.prototype.parseOptions = function(options) {

	if (typeof options !== "object") return;

	if (typeof options.enable === 'object') {

		var i = options.enable.length;

		while (i--) {

			if (options.enable[i] === "debug") this.enabled.debug = true;
			else if (options.enable[i] === "info") this.enabled.info = true;
			else if (options.enable[i] === "warn") this.enabled.warn = true;
			else if (options.enable[i] === "error") this.enabled.error = true;
			else if (options.enable[i] === "stdout") this.enabled.stdout = true;
			else if (options.enable[i] === "stderr") this.enabled.stderr= true;

		}
	}

	if (typeof options.syslogopts === "object") {

		this.syslogopts.tag = options.syslogopts.tag || null;
		this.syslogopts.facility = options.syslogopts.facility || "user";
		this.syslogopts.hostname = options.syslogopts.hostname || "localhost";

	}

	// Destinations
	if (typeof options.destinations === 'object') {

		this.destinations.debug = options.destinations.debug;
		this.destinations.info = options.destinations.info;
		this.destinations.warn = options.destinations.warn;
		this.destinations.error = options.destinations.error;
		this.destinations.default = options.destinations.default;

	}
}


simplelogger.prototype.log = function(msg, cb) {

	if (typeof cb !== "function")
		cb = function() {};

	var destination="";

	for (var i=0; i < this.destinations.default.length; i++) {

		destination = this.destinations.default[i];

		if (destination === "stdout") this.stdout(msg);
		else if (destination === "stderr") this.stderr(msg);
		else if (destination === "syslog") this.syslog(msg);
		else this.filelog(destination, msg, cb);

	}

	return this;

}

simplelogger.prototype.error = function(msg, cb) {

	if (this.enabled.error === false) return this;

	msg = "ERROR: " + msg;
	var destination="";

	for (var i=0; i < this.destinations.error.length; i++) {

		destination = this.destinations.error[i];

		if (destination === "stdout") this.stdout(msg);
		else if (destination === "stderr") this.stderr(msg);
		else this.filelog(destination, msg, cb);

	}

	return this;
}

simplelogger.prototype.warn = function(msg, cb) {

	if (this.enabled.warn === false)
		return this;

	msg = "WARN: " + msg;
	var destination="";

	for (var i=0; i < this.destinations.warn.length; i++) {

		destination = this.destinations.warn[i];

		if (destination === "stdout")
			this.stdout(msg);
		else if (destination === "stderr")
			this.stderr(msg);
		else if (destination === "syslog")
			this.syslog(msg);
		else
			this.filelog(destination, msg, cb);

	}

	return this;

}

simplelogger.prototype.info = function(msg, cb) {

	if (this.enabled.info === false)
		return this;

	msg = "INFO: " + msg;
	var destination="";

	for (var i=0; i < this.destinations.info.length; i++) {

		destination = this.destinations.info[i];

		if (destination === "stdout")
			this.stdout(msg);
		else if (destination === "stderr")
			this.stderr(msg);
		else if (destination === "syslog")
			this.syslog(msg);
		else
			this.filelog(destination, msg, cb);

	}

	return this;

}

simplelogger.prototype.debug = function(msg, cb) {

	if (this.enabled.debug === false)
		return this;

	msg = "DEBUG: " + msg;
	var destination="";

	for (var i=0; i < this.destinations.debug.length; i++) {

		destination = this.destinations.debug[i];

		if (destination === "stdout")
			this.stdout(msg);
		else if (destination === "stderr")
			this.stderr(msg);
		else if (destination === "syslog")
			this.syslog(msg);
		else
			this.filelog(destination, msg, cb);

	}

	return this;

}

simplelogger.prototype.filelog = function(filename, msg, cb) {

	// Nothing to see here, move along
	if (filename === undefined)
		return this;

	var self=this;

	// If no functions are provided, we provide an empty function
	// This may not be the best idea
	if (typeof cb !== "function")
		cb = function() {};

	if (filename.length > 0) {

		fs.createWriteStream(filename, {flags: "a"})
		.on("error", function(err) {
			self.emit("log-fail");
			cb({

				errno: 5,
				message: "Cannot write to file",
				oerror: err

			});
		})
		.on("open", function(fd) {

			var date = new Date();
			this.write(date.toDateString().substr(4) + " " + date.toTimeString().substr(0, 9) + msg + "\n", "utf8")
			this.end();

		});
	}

	return this;

}

simplelogger.prototype.syslog = function(msg) {

	if (this.enabled.syslog === false)
		return this;

	var tag = this.syslogopts.tag;
	var facility = this.syslogopts.facility;
	var hostname = this.syslogopts.hostname;
	ain.set(tag, facility, hostname);
	ain.log(msg);

	return this;

}

simplelogger.prototype.stdout = function(msg) {

	var datestr = "";

	if (msg === undefined || msg === null) msg = "";

	if (this.enabled.stdout !== false) {

		if (this.printdate) {

			var date = new Date();
			datestr = date.toDateString().substr(4).bold + " " + date.toTimeString().substr(0, 9).bold;

		}

		process.stdout.write(datestr + msg.blue + "\n");

	}

	return this;

}

simplelogger.prototype.stderr = function(msg) {

	var datestr = "";

	if (this.enabled.stdout !== false) {

		if (this.printdate) {

			var date = new Date();
			datestr = date.toDateString().substr(4).bold + " " + date.toTimeString().substr(0, 9).bold;

		}

		process.stderr.write(datestr + msg.red + "\n");

	}

	return this;

}

simplelogger.prototype.enable = function(type) {

	if (type === "debug") this.enabled.debug = true;
	else if (type === "info") this.enabled.info = true;
	else if (type === "warn") this.enabled.warn = true;
	else if (type === "error") this.enabled.error = true;
	else if (type === "stdout") this.enabled.stdout = true;
	else if (type === "syslog") this.enabled.syslog = true;
	return this;

}

simplelogger.prototype.disable = function(type) {

	if (type === "debug") this.enabled.debug = false;
	else if (type === "info") this.enabled.info = false;
	else if (type === "warn") this.enabled.warn = false;
	else if (type === "error") this.enabled.error = false;
	else if (type === "stdout") this.enabled.stdout = false;
	else if (type === "syslog") this.enabled.syslog = false;
	return this;

}

simplelogger.prototype.disableDate = function() {
	this.printdate = false;
	return this;
}

simplelogger.prototype.enableDate = function() {
	this.printdate = true;
	return this;
}

simplelogger.prototype.printDate= function() {
	console.log(this.printdate);
	return this;
}

exports.simplelogger = simplelogger;
