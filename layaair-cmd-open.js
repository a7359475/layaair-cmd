const path = require("path");
const program = require("commander");
const spawn = require("child_process").spawn;
const fs = require("fs");
const
{
	printOk,
	printErr,
	printQuotation,
	tr
} = require("./print.js");

program
	.version("0.1.1")
	.usage("[port] [args]")
	.option('-p <port>', tr("resource directory."))
	.option('-s', tr("don't open browser"))
	.option('-h <hostname>', tr("with hostname, such as layaair-cmd open -h localhost"))
	.option('-d <directory>', tr("with folder"))
	.option('-f', tr("enable html5 history"))
	.parse(process.argv);

let args = process.argv.slice(2);
args.unshift(path.resolve(__dirname, 'node_modules', 'anywhere', 'bin', 'anywhere'));
var sp = require("child_process").spawn(
	"node",
	args,
	{
		cwd: process.cwd()
	});

sp.stdout.on('data', function(data)
{
	printQuotation(data.toString());
});

sp.stderr.on('data', function(data)
{
	printErr(data.toString());
});