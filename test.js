var simplelogger = require("./main.js").simplelogger;

var logfile= "/tmp/exists";
var logger = new simplelogger({
	filename: logfile,
	autolog: ["file", "stdout", "syslog"],
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
.on("check-fail", cb)
.on("log-fail", cb)
.on("check-successful", function() {

	this.stdout("Check was successful");

})
.check();

// I can log to file and stdout by specifying them
// Priorities are: debug, info, notice, warning, err
// which are prefixed to the message
// Priorities make more sense for syslog, really :)
logger
.filelog("This goes to a file", cb)
.stdout("This goes out to stdout in blue")		// Outputs "This goes out to stdout" in fancy blue
.stdout("This goes out to stdout in red", "err")	// Outputs "ERROR: This goes out to stdout" in red (only for err)
.stdout("This goes out to stdout in magenta", "info");	// Outputs "INFO: This goes out to stdout" in magenta (default)


// Or I can log to file and stdout automatically with a single call to log()
// (because syslog, file and stdout autolog output is enabled)
logger.log("This goes out to syslog, file & (stdout in blue)", cb);	// Stdout will be in blue color
logger.error("This goes out to syslog, file & (stdout in red)", cb);	// Stdout will be in red color


