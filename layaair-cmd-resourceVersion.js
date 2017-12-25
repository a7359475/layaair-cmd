const path = require("path");
const program = require("commander");
const spawn = require("child_process").spawn;
const os = require("os");
const
{
	printOk,
	printErr,
	printQuotation,
	tr
} = require("./print.js");

program
	.version("0.1.0")
	.option('-i --input <input>', tr("resource directory."))
	.option('-o --output <output>', tr("output directory."))
	.option('-n --versionName <version name>', tr("version name, default is numbers start from 1000."))
	.parse(process.argv);

if (!program.input)
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

args.push(program.input);
args.push("-o");
args.push(program.output);

if (program.versionName)
	args.push("-n", program.versionName);

let executable;
switch (os.platform())
{
	case "win32":
		executable = "web-resource-manager.exe";
		break;
	// case "linux":
	// 	executable = "guetzli_linux_x86-64";
	// 	break;
	case "darwin":
		executable = "web-resource-manager";
		break;
	default:
		printErr("Platform does not support.");
		exit(1);
}

var sp = spawn(
	path.join(__dirname, "tools", "resource-manager", executable),
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