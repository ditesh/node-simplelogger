<h1>About</h1>

A simple logging solution for output to a file and stdout (and soon syslog). Does exactly what it should and no more.

<h1>Examples</h1>

Based on configuration options, the following code could automatically send the log message to stdout AND some file.

`logger.log("Feeling like a champ");`

Or we could be more specific:

`logger.filelog("Feeling like a champ").stdout("Feeling like a champ");`

See test.js for more examples.

<h1>Licensing</h1>

Uses colors.js from https://github.com/Marak/colors.js
 
