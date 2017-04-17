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
	.option('-o --compressOptions <options>', tr("Compress options. 'no' for no processing, 'c' for compress, 'cc' for compress and concat."), getCompressOptions)
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
	var compiler = new LayaProjectCompiler(project_dir);
	compiler.on("compileCompleted", onCompiled);
}
else
{
	printErr("Project directory '%s' is not exists.", project_dir);
}

function getCompressOptions(options)
{
	if (options == 'no')
		return 0;
	if (options == 'c')
		return 1;
	if (options == 'cc')
		return 2;
}

function onCompiled()
{
	let indexHmtl = require("./tools/htmlHandler.js");

	indexHmtl.indexHmtl(
	{
		workspacePath: project_dir,
		publishversion: Date.now() + '',
		versionmode: program.compressOptions
	});
}