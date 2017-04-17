const path = require("path");
const fs = require("fs");
const
{
	printOk,
	printErr,
	printQuotation,
	tr
} = require("./print.js");

let cwd = path.resolve(process.cwd(), "bin");
if(!fs.existsSync(path.resolve(cwd, "index.html")))
	cwd = path.resolve(cwd, "h5");

let args = process.argv.slice(2);
args.unshift(path.resolve(__dirname, 'node_modules', 'anywhere', 'bin', 'anywhere'));
var sp = require("child_process").spawn(
	"node",
	args,
	{
		cwd: cwd
	});

sp.stdout.on('data', function(data)
{
	printQuotation(data.toString());
});

sp.stderr.on('data', function(data)
{
	printErr(data.toString());
});