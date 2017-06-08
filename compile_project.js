const EventEmitter = require('events');
const fs = require("fs");
const path = require("path");
const spawn = require("child_process").spawn;
const
{
	printQuotation,
	printErr,
	printOk,
	printWarning,
	tr
} = require("./print.js");

class LayaProjectCompiler extends EventEmitter
{
	constructor(project_dir)
	{
		super();

		this.project_dir = project_dir;

		if (fs.existsSync(path.join(project_dir, "jsconfig.json")))
		{
			printOk(`${tr("Detected")} JavaScript ${"prject"}, ${tr("Do nothing")}`);
			this.emit("compileCompleted");
		}
		else if (fs.existsSync(path.join(project_dir, "tsconfig.json")))
		{
			printOk(`${tr("Detected")} TypeScript ${"prject"}`);
			this.compileTsProject();
		}
		else if (fs.existsSync(path.join(project_dir, "asconfig.json")))
		{
			printOk(`${tr("Detected")} ActionScript ${"prject"}`);
			this.compileAsProject();
		}
		else
		{
			printErr(tr("Invalid directory, missing asconfig.json | jsconfig.json | tsconfig.json."));
			process.exit(1);
		}
	}

	compileAsProject()
	{
		let proj_config_file;
		let fd_config_file = path.join(this.project_dir, "LayaUISample.as3proj"),
			fb_config_file = path.join(this.project_dir, ".actionScriptProperties"),
			is_fd_proj = fs.existsSync(fd_config_file),
			is_fb_proj = fs.existsSync(fb_config_file);

		// retrieve ActionScript project config file.
		if (is_fb_proj && is_fb_proj)
			printWarning(tr("There are both FlashDevelop and FlashBuilder project file. Ignore FlashBuilder project"));
		if (is_fd_proj)
			proj_config_file = fd_config_file;
		else if (is_fb_proj)
			proj_config_file = fb_config_file;
		else
			printErr(tr("Error: No FlashDevelop or FlashBuilder project file."));

		// call layajs to compile project if project is exsit.
		if (proj_config_file)
		{
			let layajs = path.join(__dirname, "./tools/layajs/layajs");
			var arg = `${proj_config_file};iflash=false;windowshow=false;chromerun=false`;

			let sp = spawn(layajs, [arg]);
			sp.stdout.on("data", function(data){});
			sp.on("close", (data) =>
			{
				if (data == 0)
				{
					printOk(tr("Compile completed."));
					this.emit("compileCompleted");
				}
			});
		}
	}

	compileTsProject()
	{
		let tsc = process.platform === "win32" ? "tsc.cmd" : "tsc";
		let sp = spawn(tsc, ["-p", ".", "--outDir", "bin/js"]);

		printOk(tr("Start  compile..."));

		sp.stdout.on("data", printQuotation);
		sp.stderr.on("data", printErr);
		sp.on("close", (data) =>
		{
			if (data == 0)
			{
				printOk(tr("Compile compelet."));
				this.tsSortScript();
				this.emit("compileCompleted");
			}
		});
	}

	tsSortScript()
	{
		require("./tools/tsSort.js").htmlHandlerScript(
		{
			workspacePath: this.project_dir
		});
	}
}

exports.LayaProjectCompiler = LayaProjectCompiler;