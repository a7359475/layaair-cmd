const path = require("path");
const program = require("commander");
const fs = require("fs");
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
	.usage('[.laya_file]')
	.option('-i --input <input>', tr("resource directory."))
	.option('-o --output <output>', tr("output directory."))
	.option('-n --versionName <version name>', tr("version name, default is numbers start from 1000."))
	.parse(process.argv);

let resource_dir;

// specify resource directory via -p
if (program.input)
	resource_dir = program.input;
// specify project directory as positional argument
else if (program.args.length == 1)
	resource_dir = program.args[0];

resource_dir = path.resolve(resource_dir);

if (!resource_dir)
{
	printErr("You must specify resource directory");
	process.exit(1);
}
if (!program.output)
{
	printErr("You must specify output directory");
	process.exit(1);
}

//////////////////////////////////////////////////
// call external excutable web-resource-manager //
//////////////////////////////////////////////////
var args = [];

args.push(resource_dir);
args.push("-o");
args.push(program.output);

if (program.versionName)
	args.push("-n", program.versionName);

var sp = spawn(
	path.join(__dirname, "tools", "web-resource-manager"),
	args);

sp.stdout.on("data", (data) =>
{
	printQuotation(data.toString());
});
sp.stderr.on("data", (data) =>
{
	printErr(data);
});
sp.on("close", (data) =>
{
	printOk(tr("finish."));
});