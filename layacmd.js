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
	.version('0.0.2')
	.usage("[command] [args]")
	.command('compile', 'compile project.')
	.command('publish', 'publish project.')
	.command('ui', 'export ui code.')
	.command('resourceVersion', 'generate resource version.')
	.command('atlas', 'generate atlas.')
	.command('guetzli', 'google\'s perceptual JPEG encoder')
	.command('open', 'open in browser.')
	.command('native', 'placeholder')
	.parse(process.argv);

let arg0 = program.args[0];
if (/^\w+$/.test(arg0) &&
	!program._execs[arg0])
	printErr(`'${arg0}' ` + tr("is not a layacmd command. See 'layacmd  --help'"));