const path = require("path");
const program = require("commander");
const fs = require("fs");
const spawn = require("child_process").spawn;
const os = require("os");
const
{
	printQuotation,
	printErr,
	printOk,
	printWarning,
	tr
} = require("./print.js");

program
	.version("0.0.2")
	.usage('[.laya_file]')
	.option('-i --input <input dirtory>', tr("input directory, if not specify, it will be current work directory."))
	.option('--config [config file]', tr("use options define in config file. Ignore all other options if this option is on. If the input directory containes laya project, you don't need to specify config file, otherwise, you need pass a config file path."))
	.parse(process.argv);

let input_dir;

// specify input directory via -p
if (program.input)
{
	input_dir = program.input;
}
// specify input directory as positional argument
else if (program.args.length == 1)
{
	input_dir = program.args[0];
}

// user not specify input_dir.
if (!input_dir)
{
	printErr(tr("You must specify input directory."));
	process.exit(1);
}

input_dir = path.resolve(input_dir);
let args = [];

// use options define in config file.
if (program.config)
{
	args.push("--config");
	args.push(path.join(os.homedir(), "AppData", "Roaming", "LayaAirIDE", "packParam.json"));
}
// user pass arguments manually.
else
{
	args.push("-I", input_dir);
}

sp = spawn(
	path.join(__dirname, "ProjectExportTools", "TP", "AtlasGenerator"),
	args);


sp.stdout.on("data", (data) =>
{
	printQuotation(data.toString());
});
// log stream.
sp.stderr.on("data", (data) =>
{
	printQuotation(data.toString());
});
sp.on("close", (data) =>
{
	printOk(tr("finish."));
});