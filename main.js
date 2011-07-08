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

	this.autolog = [];
	this.enabled = [];

	this.autolog.default = false;
	this.autolog.stdout = false;
	this.autolog.stderr = false;
	this.autolog.syslog = false;

	this.enabled.debug = false;
	this.enabled.info = false;
	this.enabled.warn = false;
	this.enabled.error = false;
	this.enabled.stdout = false;
	this.enabled.syslog = false;

	this.filenames = options.filenames || {};

	if (typeof options.enable === 'object') {

		var i = options.enable.length;

		while (i--) {

			if (options.enable[i] === "debug")
				this.enabled.debug = true;
			else if (options.enable[i] === "info")
				this.enabled.info = true;
			else if (options.enable[i] === "warn")
				this.enabled.warn = true;
			else if (options.enable[i] === "error")
				this.enabled.error = true;
			else if (options.enable[i] === "stdout")
				this.enabled.stdout = true;
			else if (options.enable[i] === "stderr")
				this.enabled.stderr= true;

		}
	}

	if (typeof options.autolog === 'object') {

		var i = options.autolog.length;

		while (i--) {

			if (options.autolog[i] === "default")
				this.autolog.default = true;
			else if (options.autolog[i] === "stdout")
				this.autolog.stdout= true;
			else if (options.autolog[i] === "stderr")
				this.autolog.stderr= true;
			else if (options.autolog[i] === "syslog") {

				this.autolog.syslog = true;

				if (typeof options.syslogopts === "object") {

					this.syslogopts.tag = options.syslogopts.tag || null;
					this.syslogopts.facility = options.syslogopts.facility || "user";
					this.syslogopts.hostname = options.syslogopts.hostname || "localhost";

				}
			}
		}
	}

	events.EventEmitter.call(this);

}

util.inherits(simplelogger, events.EventEmitter);

simplelogger.prototype.log = function(msg, cb) {

	if (typeof cb !== "function")
		cb = function() {};

	if (this.autolog.default)
		this.filelog(this.filenames.default, msg, cb);

	if (this.autolog.stdout)
		this.stdout(msg);

	if (this.autolog.stderr)
		this.stdout(msg);

	if (this.autolog.syslog)
		this.syslog(msg);

	return this;

}

simplelogger.prototype.error = function(msg, cb) {

	if (this.enabled.error === false)
		return this;

	msg = "ERROR: " + msg;
	this.filelog(this.filenames.errorlog, msg, cb);

	return this;
}

simplelogger.prototype.warn = function(msg, cb) {

	if (this.enabled.warn === false)
		return this;

	msg = "WARN: " + msg;
	this.filelog(this.filenames.warnlog, msg, cb);

	return this;
}

simplelogger.prototype.info = function(msg, cb) {

	if (this.enabled.info === false)
		return this;

	msg = "INFO: " + msg;
	this.filelog(this.filenames.infolog, msg, cb);

	return this;
}

simplelogger.prototype.debug = function(msg, cb) {

	if (this.enabled.debug === false)
		return this;

	msg = "dEBUG: " + msg;
	this.filelog(this.filenames.debuglog, msg, cb);

	return this;

}

simplelogger.prototype.filelog = function(filename, msg, cb) {

	// Nothing to see here, move along
	if (filename.length === 0)
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

	if (this.enabled.stdout === false)
		return this;

	var date = new Date();
	var datestr = date.toDateString().substr(4).bold + " " + date.toTimeString().substr(0, 9).bold;

	process.stdout.write(datestr + msg.blue + "\n");
	return this;

}

simplelogger.prototype.stderr = function(msg) {

	if (this.enabled.stderr === false)
		return this;

	var date = new Date();
	var datestr = date.toDateString().substr(4).bold + " " + date.toTimeString().substr(0, 9).bold;

	process.stderr.write(datestr + msg.red + "\n");
	return this;

}

simplelogger.prototype.enable = function(type) {

	if (type === "debug")
		this.enabled.debug = true;
	else if (type === "info")
		this.enabled.info = true;
	else if (type === "warn")
		this.enabled.warn = true;
	else if (type === "error")
		this.enabled.error = true;
	else if (type === "stdout")
		this.enabled.stdout = true;
	else if (type === "syslog")
		this.enabled.syslog = true;

	return this;

}

simplelogger.prototype.disable = function(type) {

	if (type === "debug")
		this.enabled.debug = false;
	else if (type === "info")
		this.enabled.info = false;
	else if (type === "warn")
		this.enabled.warn = false;
	else if (type === "error")
		this.enabled.error = false;
	else if (type === "stdout")
		this.enabled.stdout = false;
	else if (type === "syslog")
		this.enabled.syslog = false;

	return this;

}

simplelogger.prototype.setsyslogopts = function(opts) {

	this.syslogopts.tag = opts.tag || this.syslogopts.tag;
	this.syslogopts.facility = opts.facility || this.syslogopts.facility;
	this.syslogopts.hostname = opts.hostname || this.syslogopts.hostname;

	return this;

}

exports.simplelogger = simplelogger;
