var fs = require("fs");
var ain = require("ain");
var util = require("util");
var path = require("path");
var events = require("events");
var colors = require("./colors");

function simplelogger(options) {

	this.logfile = "";
	this.syslogopts = {
		tag: null,
		facility: "user",
		hostname: "localhost",
	};
	this.autolog = [];
	this.autolog.file = false;
	this.autolog.stdout = false;
	this.autolog.syslog = false;

	if (options.filename.length > 0)
		this.logfile = path.normalize(options.filename);

	if (typeof options.autolog === 'object') {

		var i = options.autolog.length;

		while (i--) {

			if (options.autolog[i] === "file")
				this.autolog.file = true;
			else if (options.autolog[i] === "stdout")
				this.autolog.stdout = true;
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

simplelogger.prototype.check = function(cb) {

	var self = this;
	var filename = this.logfile;

	// If no functions are provided, we provide an empty function
	// This may not be the best idea
	if (typeof cb !== "function")
		cb = function() {};

	if (filename.length > 0) {

		// Not the best approach, really
		fs.stat(filename, function(err, stats) {

			if (err === null) {

				if (stats.isFile()) {

					fs.createWriteStream(filename, {flags: "a"})
					.on("error", function(err) {

						self.emit("check-fail");
						cb({

							errno: 1,
							message: "Cannot open file",
							oerror: err

						});
					})
					.on("close", function() {

						self.emit("check-successful");
						cb(null);

					})
					.end();

				// It's not a file - could be a directory or even a symbolic link!
				} else {

					self.emit("check-fail");
					cb({

						errno: 2,
						message: "Not a file",
						oerror: null

					});

				}

			// File does not exist, lets try creating the file
			} else if (err.errno === 2) {

				fs.createWriteStream(filename, {flags: "w", mode: 0600})
				.on("error", function(err) {

					self.emit("check-fail");
					cb({

						errno: 3,
						message: "Cannot touch file",
						oerror: err

					});
				})
				.on("close", function() {

					self.emit("check-successful");
					cb(null);

				})
				.end();

			} else {

				self.emit("check-fail");
				cb({

					errno: 4,
					message: "Cannot stat file",
					oerror: err

				});
			}
		});
	}

	if (filename.length > 0) {

	}

	// Maintaining chainability
	return this;

}

// check() should have already been called
// Is this being done asynchronously correctly?
simplelogger.prototype.log = function(msg, cb) {

	if (typeof cb !== "function")
		cb = function() {};

	var autolog = this.autolog;

	if (autolog.file)
		this.filelog(msg, cb);

	if (autolog.stdout)
		this.stdout(msg);

	if (autolog.syslog)
		this.syslog(msg);


}

// check() should have already been called
simplelogger.prototype.error = function(msg, cb) {

	msg = "ERROR: " + msg;
	var autolog = this.autolog;

	if (autolog.file)
		this.filelog(msg, cb);

	if (autolog.stdout)
		this.stdout(msg, "err");


}


// check() should have already been called
simplelogger.prototype.filelog = function(msg, cb) {

	var filename = this.logfile;

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

	// Maintaining chainability
	return this;

}

simplelogger.prototype.syslog = function(msg) {

	var tag = this.syslogopts.tag;
	var facility = this.syslogopts.facility;
	var hostname = this.syslogopts.hostname;
	ain.set(tag, facility, hostname);
	ain.log(msg);

	// Maintaining chainability
	return this;

}

simplelogger.prototype.stdout = function(msg, priority) {

	var date = new Date();
	var datestr = date.toDateString().substr(4).bold + " " + date.toTimeString().substr(0, 9).bold;

	if (priority === "err")
		util.puts(datestr + msg.red);
	else if (priority === undefined)
		util.puts(datestr + msg.blue);
	else
		util.puts(datestr + msg.magenta);

	// Maintaining chainability
	return this;

}

exports.simplelogger = simplelogger;
