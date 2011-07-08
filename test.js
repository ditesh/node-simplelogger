var simplelogger = require("./main.js").simplelogger;

var logfile= "/var/log/messages";
var logger = new simplelogger({
	filenames: {
		"default": "default.log",
		debuglog: "debug.log",
		infolog: "info.log",
		warnlog: "warn.log",
		errorlog: "error.log",
	},

	enable: ["default", "error", "warn", "info", "syslog", "stdout", "stderr"],

	autolog: ["default", "stdout", "stderr", "syslog"],

	syslogopts: {
		tag: "node-test",
		facility: "user",
		hostname: "localhost"
	}
});

// A basic callback function
var cb = function(err) { console.log(err); };

// Perhaps check() should be called automatically in constructor
// Should check() be synchronous? Hmm.
logger
.on("log-fail", cb);

// Default logging (you'd be using this most of the time)
logger
.log("This goes out to default.log, syslog, stderr and stdout", cb); // Outputs "This goes out ..."

// Error and stream (stdout, stderr) logging
logger
.error("This goes out to error.log")			// Outputs "ERROR: This goes out to error.log"
.stderr("This goes out to stderr")			// Outputs "This goes out to stderr"
.stdout("This goes out to stdout");			// Outputs "This goes out to stdout"

// Logging specific types
logger
.warn("This goes out to warn.log")			// Outputs "WARN: This goes out to warn.log"
.info("This goes out to info.log")			// Outputs "INFO: This goes out to info.log"
.debug("This goes out to debug.log")			// Outputs "DEBUG: This goes out to debug.log"

// Enabling/disabling logger types
logger
.disable("error")
.error("This goes out to error.log")			// No output
.enable("error")
.error("This goes out to error.log");			// Outputs "ERROR: This goes out to error.log"
