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
	.option('-p --project <project dir>', tr('project directory(include projectName.laya), if not specify, it will be current work directory.'))
	.option('-c --clear', tr('clear will delete old ui code file.'))
	.option('-m --mode <mode>', tr("'normal' or 'release', specify 'release' will generate UI code files beside unused resources."))
	.option('-d --code', tr("'export UI code files."))
	.parse(process.argv);


let project_dir;

// specify project directory via -p
if (program.project)
{
	project_dir = program.project;
}
// specify project directory as positional argument
else if (program.args.length == 1)
{
	project_dir = program.args[0];
}

project_dir = path.resolve(project_dir);

let clear = program.clear || true,
	mode = program.mode || 'normal',
	code = program.code || true;

/////////////////////////////////////////////////////////////
// Call external interface define in LayaAirCmdTool.max.js //
/////////////////////////////////////////////////////////////
if (fs.existsSync(project_dir))
{
	process.chdir(project_dir);
	console.log(`project directory: ${project_dir}`);

	var args = [];
	args.push(path.join(__dirname, "ProjectExportTools", "LayaAirCmdTool.max.js"));
	args.push(path.join(project_dir, "laya", ".laya"));
	args.push(`clear=${clear}`);
	args.push(`releasemode=${mode}`);
	args.push(`exportUICode=${code}`);
	args.push(`exportRes=false`);

	var sp = spawn("node", args);

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
}
else
{
	printErr("Project directory '%s' is not exists.", project_dir);
}