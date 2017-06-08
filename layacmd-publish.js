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
	.option('-o --compressOptions <options>', tr("Compress options. 'no' for no processing, 'c' for compress, 'cc' for compress and concat."), getCompressOptions)
	.parse(process.argv);

let LayaProjectCompiler = require("./compile_project.js").LayaProjectCompiler;
new LayaProjectCompiler(path.resolve())
	.on("compileCompleted", onCompiled);

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
		workspacePath: path.resolve(),
		publishversion: Date.now() + '',
		versionmode: program.compressOptions
	});
}