var fs = require("fs");
var util = require("util");
var path = require("path");
var events = require("events");
var colors = require("./colors");

function simplelogger(options) {

	this.filename = "";
	this.autolog = [];
	this.autolog.file = false;
	this.autolog.stdout = false;

	if (options.filename.length > 0)
		this.filename = path.normalize(options.filename);

	if (typeof options.autolog === 'object') {

		this.autolog.file = options.autolog.file || false;
		this.autolog.stdout = options.autolog.stdout || false;

	}

	events.EventEmitter.call(this);

}

util.inherits(simplelogger, events.EventEmitter);

simplelogger.prototype.check = function(cb) {

	var self = this;
	var filename = this.filename;

	// If no functions are provided, we provide an empty function
	// This may not be the best idea
	if (typeof cb !== "function")
		cb = function() {};

	if (filename.length > 0) {

		// Not the best approach, really
		fs.stat(filename, function(err, stats) {

			if (err === null) {

				if (stats.isFile()) {

					fs.createWriteStream(filename, {flags: "a", mode: 0600})
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

	// Maintaining chainability
	return this;

}

// check() should have already been called
simplelogger.prototype.log = function(msg, cb) {

	var autolog = this.autolog;

	if (autolog.file)
		this.filelog(msg,cb);

	if (autolog.stdout)
		this.stdout(msg,cb);


}

// check() should have already been called
simplelogger.prototype.filelog = function(msg, cb) {

	var filename = this.filename;

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

simplelogger.prototype.stdout = function(msg) {

	var date = new Date();
	util.puts(date.toDateString().substr(4).bold + " " + date.toTimeString().substr(0, 9).bold + msg.blue);

	// Maintaining chainability
	return this;

}

exports.simplelogger = simplelogger;
