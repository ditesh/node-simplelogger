var simplelogger = require("./main.js").simplelogger;

var exists = "/tmp/exists";
var noexists = "/tmp/noexist";
var logger = new simplelogger({"filename": exists});

// A basic callback function
var cb = function(err) { console.log(err); };

// Perhaps check() should be called automatically in constructor
// Should check() be synchronous? Hmm.
logger
.on("check-fail", cb)
.on("log-fail", cb)
.on("check-successful", function() {

	this.log("Check was successful");

})
.check();

// Current behaviour is:
logger
.log("Feeling like a champ", cb)
.stdout("Feeling like a champ");

// Perhaps I should work on this:
// "Some log message".filelog().stdout().syslog();
