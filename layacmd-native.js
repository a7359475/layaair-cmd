const path = require("path");
const fs = require("fs");
const
{
	spawn,
	exec
} = require("child_process");
const
{
	printOk,
	printErr,
	printQuotation,
	printWarning,
	tr
} = require("./print.js");

let argv;
if (process.argc == 2)
	argv = "--help";
else
	argv = process.argv.slice(2)

let exe = path.join(__dirname, "node_modules", "layanative", "out", "main.js");

if (fs.existsSync(exe) && argv[0] != "update")
{
	run();
}
else
{
	printWarning(tr("LayaNative not found. Waiting for downloading..."));
	let cp = exec("npm install layanative",
	{
		cwd: __dirname
	}, function(error, stdout, stderr)
	{
		if(error)
			printErr(error);

		if(stderr)
			printErr(stderr);

		printQuotation(stdout);
	});

	cp.on('close', run);
}

function run()
{
	let args = [exe];
	args = args.concat(argv);
	let cp = spawn("node", args);
	cp.stdout.on('data', function(data)
	{
		printQuotation(data.toString());
	});
	cp.stderr.on('data', function(data)
	{
		printErr(data.toString());
	});
}