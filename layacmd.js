const program = require('commander');

program
	.version('0.0.1')
	.command('compile', 'compile project.')
	.command('publish', 'publish project.')
	.command('ui', 'export ui code.')
	.command('resourceVersion', 'generate resource version.')
	.command('atlas', 'generate atlas.')
	.parse(process.argv);