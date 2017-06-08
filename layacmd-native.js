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

if (!fs.existsSync(exe))
{
	printWarning(tr("LayaNative not found. Waiting for downloading..."));
	execNpmCommand("npm install layanative");
}
else if(argv[0] == "update")
{
	printWarning(tr("Update LayaNative. Waiting for updateing..."));
	execNpmCommand("npm update layanative");
	
	argv = ["--help"];
}
else
{
	run();
}

function execNpmCommand(command)
{
	let cp = exec(command,
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