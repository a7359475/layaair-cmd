#!/usr/bin/env node

const program = require('commander');
const
{
	printQuotation,
	printErr,
	printOk,
	printWarning,
	tr
} = require("./print.js");

program
	.version('0.1.0')
	.usage("[command] [args]")
	.command('compile', 'compile project.')
	.command('publish', 'publish project.')
	.command('ui', 'export ui code, atlas')
	.command('resourceVersion', 'generate resource version.')
	.command('guetzli', 'google\'s perceptual JPEG encoder')
	.command('open', 'open in browser.')
	.command('native', 'placeholder')
	.parse(process.argv);

// 检查调用的子程序是否存在
let arg0 = program.args[0];
if (/^\w+$/.test(arg0) &&
	!program._execs[arg0])
	printErr(`'${arg0}' ` + tr("is not a layaair-cmd command. See 'layaair-cmd  --help'"));