const EventEmitter = require('events');
const fs = require("fs");
const path = require("path");
const spawn = require("child_process").spawn;
const jsonc = require("jsonc-parser");

const
{
	printQuotation,
	printErr,
	printOk,
	printWarning,
	tr
} = require("./print.js");

/**
 * 编译LayaAir项目。
 * 利用位于项目目录中的 .laya/tasks.json 中提供的参数调用编译器。
 * 目前并非支持完整的 tasks.json
 */
class LayaProjectCompiler extends EventEmitter
{
    constructor(project_dir)
    {
        super();
        if (project_dir)
            this.compile(project_dir);
    }

    compile(project_dir)
    {
        this.project_dir = project_dir;

        let tasksFile = path.resolve(".laya", "tasks.json");
        if(!fs.existsSync(tasksFile))
        {
            console.error(tr("no tasks.json, skip compile.").green)
            return;
        }

        let tasksFileInString = fs.readFileSync(tasksFile).toString();
        let errors = [];
        let tasks = jsonc.parse(tasksFileInString, errors);
        if (errors.length)
        {
            errors.forEach((e) => console.error(e));
        }
        else
        {

            if(fs.existsSync(path.join(project_dir, "tsconfig.json")))
            {
            	tasks.command = tasks.command.replace(/\btsc\b/, "tsc.cmd");
            }


            let command = tasks.command.replace("${workspaceRoot}", process.cwd());
            let args = tasks.args.map((arg) => arg = arg.replace("${workspaceRoot}", process.cwd()));

            let fullCommand = tasks.command;

            tasks.args.forEach((arg) => fullCommand += " " + arg);
            console.log(fullCommand.yellow);

            let sp = spawn(command, args);
            sp.stdout.on("data", function (data) {
                printQuotation(data);
            });
            sp.stderr.on("data", function (data) {
                printWarning(data);
            });
            sp.on("close", (data) => {
                if (data == 0)
                {
                    if(fs.existsSync(path.join(project_dir, "tsconfig.json")))
                        this.tsSortScript();

                    printOk(tr("Compile completed."));
                    this.emit("compileCompleted");
                }
            });
        }
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