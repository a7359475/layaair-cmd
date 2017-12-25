const path    = require("path");
const program = require("commander");
const
{
	printErr,
	tr
} = require("./print.js");

program
	.version("0.1.0")
	.parse(process.argv);

let LayaProjectCompiler = require("./compile_project.js").LayaProjectCompiler;
new LayaProjectCompiler(path.resolve());
