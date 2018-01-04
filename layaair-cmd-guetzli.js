const path = require("path");
const program = require("commander");
const fs = require("fs");
const os = require("os");
const spawn = require("child_process").spawn;
const
{
	printOk,
	printErr,
	printQuotation,
	tr
} = require("./print.js");

program
	.version("0.1.1")
	.option('-i --input <input>', tr("resource directory."))
	.option('-q --quality <quality>', tr("quality, more than 84."))
	.parse(process.argv);

let resource_dir;

// specify resource directory via -p
if (program.input)
	resource_dir = program.input;
// specify project directory as positional argument
else if (program.args.length == 1)
	resource_dir = program.args[0];

if (!resource_dir)
{
	printErr("You must specify resource directory");
	process.exit(1);
}

resource_dir = path.resolve(resource_dir);

//////////////////////////////
// traverse input directory //
//////////////////////////////
let files = [];

readdir(resource_dir);

function readdir(dir)
{
	let result = fs.readdirSync(dir);
	result.forEach(function(filename)
	{
		let absFile = path.join(dir, filename);
		let stats = fs.statSync(absFile);
		if (stats.isFile())
		{
			if (filename.endsWith(".jpeg") ||
				filename.endsWith(".jpg"))
				files.push(absFile);
		}
		else if (stats.isDirectory())
		{
			readdir(absFile);
		}
	});
}

if(files.length == 0) exit(0);

files.forEach(function(file)
{
	printQuotation(file);
});

encodeFile(files.pop());

function encodeFile(file)
{
	let ext_name = path.extname(file);
	let base_name = path.basename(file, ext_name);
	let out_name = path.join(path.dirname(file), `${base_name}_compressed${ext_name}`);
	encode(file, out_name, function(err_code)
	{
		if(files.length)
			encodeFile(files.pop());

		if (err_code)
		{
			printErr(`Failed to encode ${file}`)
		}
		else
		{
			fs.unlink(file, (err) =>
			{
				if (err)
				{
					printErr(`Failed to delete ${file}`);
				}
				else
				{
					fs.rename(out_name, file, (err) =>
					{
						if (err)
							printErr(`Failed to rename ${file}`);
						else
							printOk(`${file} compressed.`);
					});
				}
			});
		}
	});
};


//////////////////////////////////////////////////
// call external excutable web-resource-manager //
//////////////////////////////////////////////////
function encode(f_in, f_out, onclose)
{
	let args = [];

	if (program.quality)
		args.push("--quality", program.quality);

	args.push(f_in, f_out);

	let executable;
	switch(os.platform())
	{
		case "win32":
			executable = "guetzli_windows_x86-64.exe";
			break;
		case "linux":
			executable = "guetzli_linux_x86-64";
			break;
		case "darwin":
			executable = "guetzli_darwin_x86-64";
			break;
		default:
			printErr("Platform does not support.");
			exit(1);
	}
	let sp = spawn(
		path.join(__dirname, "tools", "guetzli", executable),
		args);

	// sp.stdout.on("data", (data) =>
	// {
	// 	printQuotation(data.toString());
	// });
	sp.stderr.on("data", (data) =>
	{
		printErr(data.toString());
	});
	sp.on("close", onclose);
}