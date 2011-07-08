# About

A simple logging solution for output to files, stdout and syslog. Does exactly what it should and no more.

# Examples

Based on configuration options, the following code could automatically send the log message to stdout, file AND syslog.

	logger.log("Feeling like a champ");

Or we could be more specific and output to a file, stdout and stderr:

	logger
	.error("This goes out to error.log")                    // Outputs "ERROR: This goes out to error.log"
	.stderr("This goes out to stderr")                      // Outputs "This goes out to stderr"
	.stdout("This goes out to stdout");                     // Outputs "This goes out to stdout"

And we can the standard debug(), info(), warn(), error():

	logger
	.warn("This goes out to warn.log")			// Outputs "WARN: This goes out to warn.log"
	.info("This goes out to info.log")			// Outputs "INFO: This goes out to info.log"
	.debug("This goes out to debug.log")			// Outputs "DEBUG: This goes out to debug.log"

See `test.js` for more examples.

# Syslog settings

See ain's documentation for valid values of tag, facility and hostname

It worked fine on Fedora 15's rsyslogd, although I needed to turn on UDP in /etc/rsyslog.conf:

	$ModLoad imudp
	$UDPServerRun 514

# Dependencies & Licensing

simplelogger is licensed under the erstwhile MIT license.

Uses ain from https://github.com/akaspin/ain/ (installation through npm has ain as a dependency)
Uses colors.js from https://github.com/Marak/colors.js (bundled in here)
