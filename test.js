var simplelogger = require("./main.js").simplelogger;

var exists = "/tmp/exists";
var noexists = "/tmp/noexist";
var logger = new simplelogger({
	filename: exists,
	autolog: ["file", "stdout"]
});

// A basic callback function
var cb = function(err) { console.log(err); };

// Perhaps check() should be called automatically in constructor
// Should check() be synchronous? Hmm.
logger
.on("check-fail", cb)
.on("log-fail", cb)
.on("check-successful", function() {

	this.stdout("<stdout> Check was successful");

})
.check();

// I can log to file and stdout by specifying them
logger
.filelog("<file>Feeling like a champ", cb)
.stdout("<stdout>Feeling like a champ")
.stdout("<stdout>Feeling like a champ", true);

// Or I can log to file and stdout automatically
// (because file and stdout autolog output is enabled)
logger.log("<stdout & file>Feeling like a champ", cb); // Stdout in standard blue color
logger.error("<stdout & file>Feeling like a champ", cb); // Stdout is in red color now

// Perhaps I should work on this:
// "Some log message".filelog().stdout().syslog();
