const path = require("path");
const program = require("commander");
const spawn = require("child_process").spawn;
const
{
	printOk,
	printErr,
	printQuotation,
	tr
} = require("./print.js");

program
	.version("0.0.2")
	.usage("[port] [args]")
	.option('-p <port>', tr("resource directory."))
	.option('-s', tr("don't open browser"))
	.parse(process.argv);

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