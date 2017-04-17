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
	.option('-c --clear', tr('clear will delete old ui code file.'))
	.option('-m --mode <mode>', tr("'normal' or 'release', specify 'release' will generate UI code files beside unused resources."))
	.parse(process.argv);

let clear = program.clear || true,
	mode  = program.mode || 'normal';

/////////////////////////////////////////////////////////////
// Call external interface define in LayaAirCmdTool.max.js //
/////////////////////////////////////////////////////////////
var args = [];
args.push(path.join(__dirname, "ProjectExportTools", "LayaAirCmdTool.max.js"));
args.push(path.resolve("laya", ".laya"));
args.push(`clear=${clear}`);
args.push(`releasemode=${mode}`);
args.push(`exportUICode=true`);
args.push(`exportRes=false`);

var sp = spawn("node", args);

sp.stdout.on("data", (data) =>
{
	printQuotation(data.toString());
});
sp.stderr.on("data", (data) =>
{
	printErr(data.toString());
});
sp.on("close", (data) =>
{
	printOk(tr("finish."));
});