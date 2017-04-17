const program = require('commander');

program
	.version('0.0.2')
	.command('compile', 'compile project.')
	.command('publish', 'publish project.')
	.command('ui', 'export ui code.')
	.command('resourceVersion', 'generate resource version.')
	.command('atlas', 'generate atlas.')
	.command('guetzli', 'google\'s perceptual JPEG encoder')
	.command('open', 'open in browser.')
	.parse(process.argv);