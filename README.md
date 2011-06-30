<h1>About</h1>

A simple logging solution for output to a file, stdout and syslog. Does exactly what it should and no more.

<h1>Examples</h1>

Based on configuration options, the following code could automatically send the log message to stdout, file AND syslog.

`logger.log("Feeling like a champ");`

Or we could be more specific and just output to a file and stdout:

`logger.filelog("Feeling like a champ").stdout("Feeling like a champ");`

See test.js for more examples.

<h1>Syslog settings</h1>

See ain's documentation for valid values of tag, facility and hostname

It worked fine on Fedora 15's rsyslogd, although I needed to turn on UDP in /etc/rsyslog.conf:

`$ModLoad imudp
$UDPServerRun 514`

<h1>TODO</h1>

I should really output errors to stderr.

<h1>Licensing and Dependencies</h1>

simplelogger is licensed under MIT.

Uses ain from https://github.com/akaspin/ain/ (installation through npm has ain as a dependency)
Uses colors.js from https://github.com/Marak/colors.js (bundled in here)
