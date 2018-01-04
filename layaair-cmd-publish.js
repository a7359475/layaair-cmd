const path = require("path");
const program = require("commander");
const fs = require("fs");
const fse = require("fs-extra");
const UglifyJS = require("uglify-js");
const child_process = require("child_process");

const
{
	printErr,
	tr
} = require("./print.js");

program
	.version("0.1.2")
	.option('-o --compressOptions <options>', tr("Compress options. 'no' for no processing, 'c' for compress, 'cc' for compress and concat."), getCompressOptions)
	.option('-n --versionName <name>', tr("version name"))
	.option('--noCompile', tr("do not compile project"))
	.option('--noUi', tr("do not generate ui files"))
	.option('--noAtlas', tr("do not generate atlas"))
	.parse(process.argv);

var workspace = path.resolve();

var versionName = program.versionName || Date.now() + "";

function getCompressOptions(options)
{
	if (options == 'no')
		return 0;
	if (options == 'c')
		return 1;
	if (options == 'cc')
		return 2;
}

program.ui = !program.noUi;
program.atlas = !program.noAtlas;

// publish ui source file and atlas
if (program.ui || program.atlas)
{
	let args = ["-c"];
	args[0] += program.ui ? "d" : "";
	args[0] += program.atlas ? "a" : "";
	args[0] += 'm';
	args.push('normal');
	var layacmdUI = child_process.fork(path.join(__dirname, "layaair-cmd-ui.js"), args);
	layacmdUI.on("close", compileProject);
}
else
{
	compileProject();
}

let compileMessage = [];

function compileProject()
{
	if (!program.noCompile)
	{
		let LayaProjectCompiler = require("./compile_project.js").LayaProjectCompiler;
		let c = new LayaProjectCompiler();
		c.on("success", compressJsFiles);
		c.on("failed", onFailed);
		c.on("stdout", (msg) =>
		{
			compileMessage.push(msg.toString());
		});
		c.compile(workspace);
	}
	else
	{
		compressJsFiles();
	}
}

function onFailed()
{
	compileMessage.forEach((msg)=>
	{
		console.error(msg.red);
	});
	// 编译失败退出码 2
	process.exit(2);
}

function compressJsFiles()
{
	var copyOption = {
		filter: function(src, dest)
		{
			return !(src.endsWith(".map"));
		}
	};

	const isJsProj = fs.existsSync(path.join(workspace, "jsconfig.json"));
	const isTsProj = fs.existsSync(path.join(workspace, "tsconfig.json"));
	const isAsProj = fs.existsSync(path.join(workspace, "asconfig.json"));

	// copy bin to release directory
	console.log("copy files");
	fse.copySync(
		path.join(workspace, "bin", (isAsProj ? "h5" : "")),
		path.join(workspace, "release", "layaweb", versionName),
		copyOption
	);

	var indexHtmlContent = fs.readFileSync(path.join(workspace, "release", "layaweb", versionName, "index.html"), "utf-8");
	if (isJsProj || isTsProj)
	{
		// if using js, copy 'src' to directory 'js'
		if (isJsProj)
			fse.copySync(
				path.join(workspace, "src"),
				path.join(workspace, "release", "layaweb", versionName, "js"), copyOption);

		indexHtmlContent = indexHtmlContent
			.replace(/..\/src\//g, "js\/") // replace src path
			.replace(/\blibs\/(laya\.\w+)\.js/g, "libs/min/$1.min.js"); // use min libs
	}

	// no compress & no concat
	if (!program.compressOptions)
		return;

	console.log("concat files");
	var execResult = null;
	var jsFileString = indexHtmlContent.substr(indexHtmlContent.indexOf("<!--jsfile--startTag-->"));
	var execPattern = /(?:[^-])<script.*?src="(.*?)"(?:><\/script>|\/>)/g;
	var jsFiles = [];
	while ((execResult = execPattern.exec(jsFileString)) != null)
	{
		jsFiles.push(execResult[1]);
	}
	var filecontent = "";
	for (var i = 0; i < jsFiles.length; i++)
	{
		var file = path.join(workspace, "release", "layaweb", versionName, jsFiles[i]);
		console.log(file);
		filecontent += fs.readFileSync(file, "utf-8") + "\n";
	}
	if (!isAsProj) fs.writeFileSync(path.join(workspace, "release", "layaweb", versionName, "main.min.js"), filecontent);
	var jsscript = /<!--jsfile--startTag-->((?:.|(?:\r?\n))*)<!--jsfile--endTag-->/;
	var mainjsscript = /<!--jsfile--Main-->((?:.|(?:\r?\n))*)<!--jsfile--Main-->/;
	var alljs = jsscript.exec(indexHtmlContent);
	var mainjs = mainjsscript.exec(indexHtmlContent);
	if (mainjs)
	{
		indexHtmlContent = indexHtmlContent.replace(alljs[0], '');
		indexHtmlContent = indexHtmlContent.replace(mainjs[0], '<script type="text/javascript" src="main.min.js"></script>')
	}
	else if (alljs)
	{
		indexHtmlContent = indexHtmlContent.replace(alljs[0], '<script type="text/javascript" src="main.min.js"></script>');
	}
	if (!isAsProj) fs.writeFileSync(path.join(workspace, "release", "layaweb", versionName, "index.html"), indexHtmlContent);
	else fs.writeFileSync(path.join(workspace, "release", "layaweb", versionName, "index.html"), indexHtmlContent);

	if (program.compressOptions == 1)
		return;

	console.log("compress files")
	if (!isAsProj)
	{
		var filePath = path.join(workspace, "release", "layaweb", versionName, "main.min.js");
		var fileContent = fs.readFileSync(filePath, "utf-8");
		var result = UglifyJS.minify(fileContent);
		fs.writeFileSync(path.join(workspace, "release", "layaweb", versionName, "main.min.js"), result.code);
	}
	else
	{
		var fileList = fs.readdirSync(path.join(workspace, "release", "layaweb", versionName));
		for (var k = 0; k < fileList.length; k++)
		{
			if (fileList[k].indexOf(".max.js") != -1)
			{
				var result = UglifyJS.minify([path.join(workspace, "release", "layaweb", versionName, fileList[k])]);
				fs.writeFileSync(path.join(workspace, "release", "layaweb", versionName, fileList[k]), result.code);
			}
		}
	}

	process.exit();
}