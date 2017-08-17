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
		if(project_dir)
			this.compile(project_dir);
	}

	compile(project_dir)
	{
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
		// retreve the config file of FlashBuild or FlashDevelop.
		// by read and parse tasks.json under ${workspace}/.laya/tasks.json.
		let proj_config_file;
		let taskFile = JSON.parse(fs.readFileSync(path.resolve(".laya", "tasks.json")).toString().replace(/\/\/.*/g, ''));
		let taskArg = taskFile.args[0];
		let is_fd_proj, is_fb_proj;

		if(taskArg.indexOf(".actionScriptProperties") > -1)
		{
			proj_config_file = ".actionScriptProperties";
			is_fb_proj = true;
		}
		else
		{
			// check if it is FlashDevelop project
			let result = /(?:\/|\\)(.*?\.as3proj)/.exec(taskArg);
			if(result && result[1])
			{
				proj_config_file = result[1];
				is_fd_proj = true;
			}
		}

		if(!is_fb_proj && !is_fd_proj)
		{
			printErr(tr("Unable to retrieve ActionScript project config file(FlashBuilder | FlashDevelop). Check if ./bin/.laya/tasks.json is valid."));
			return;
		}
		proj_config_file = path.join(this.project_dir, proj_config_file);

		// call layajs to compile project if project is exsit.
		if (fs.existsSync(proj_config_file))
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
		else
		{
			printErr(`${proj_config_file} ` + tr("not exist."));
		}
	}

	compileTsProject()
	{
		let tsc = process.platform === "win32" ? "tsc.cmd" : "tsc";
		switch(process.platform)
		{
			case "win32":
				tsc = "tsc.cmd";
				break;
			default:
				tsc = "tsc";
				break;
		}
		let sp = spawn(tsc, ["-p", ".", "--outDir", "bin/js"], {
			env: { PATH: "/usr/local/bin:" + process.env.PATH}
		});

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