const path = require("path");
const program = require("commander");
const fs = require("fs");
const
{
	printErr,
	tr
} = require("./print.js");

program
	.version("0.0.2")
	.usage('[.laya_file]')
	.option('-p --project <project dir>', tr("project directory(include projectName.laya), if not specify, it will be current work directory."))
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

if (fs.existsSync(project_dir))
{
	process.chdir(project_dir);
	console.log(`project directory: ${project_dir}`);

	let LayaProjectCompiler = require("./compile_project.js").LayaProjectCompiler;
	new LayaProjectCompiler(project_dir);
}
else
{
	printErr(project_dir + " " + tr("Project directory is not exists."));
}