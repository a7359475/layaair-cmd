var fs = require("fs");
var path = require("path");
var UglifyJS = require("uglify-js")
const fse = require('fs-extra');

exports.indexHmtl = function(configuration)
{
	var workspace = configuration.workspacePath;
	var versionName = configuration.publishversion || "1.0.0";
	var type = "";

	var copyOption = {
		filter: function(src, dest)
		{
			return !(src.endsWith(".map"));
		}
	};
	// copy bin to release directory
	fse.copySync(
		path.join(workspace, "bin"),
		path.join(workspace, "release", "layaweb", versionName),
		copyOption
	);

	const isJsProj = fs.existsSync(path.join(workspace, "jsconfig.json"));
	const isTsProj = fs.existsSync(path.join(workspace, "tsconfig.json"));
	if (isJsProj || isTsProj)
	{
		// if using js, copy 'src' to directory 'js'
		if (isJsProj)
			fse.copySync(
				path.join(workspace, "src"), 
				path.join(workspace, "release", "layaweb", (versionName), "js")
				copyOption);

		var data = fs.readFileSync(path.join(workspace, "release", "layaweb", (versionName), "index.html"), "utf-8");
		data = data.replace(/..\/src\//g, "js\/");
		data = data.replace(/\blibs\/(laya\.\w+)\.js/g, "libs/min/$1.min.js");
	}
	else
	{
		type = "as"
		var data = fs.readFileSync(path.join(workspace, "release", "layaweb", (versionName), "h5", "index.html"), "utf-8");
	}
	if (configuration.versionmode == 0)
	{
		return
	}
	var execResult = null;
	var jsFileString = data.substr(data.indexOf("<!--jsfile--startTag-->"));
	var execPattern = /(?:[^-])<script.*?src="(.*?)"(?:><\/script>|\/>)/g;
	var fileAllJS = [];
	while ((execResult = execPattern.exec(jsFileString)) != null)
	{
		fileAllJS.push(execResult[1]);
	}
	var filecontent = "";
	for (var i = 0; i < fileAllJS.length; i++)
	{
		filecontent += fs.readFileSync(path.join(workspace, "release", "layaweb", (versionName), fileAllJS[i]), "utf-8") + "\n";
	}
	if (type != "as") fs.writeFileSync(path.join(workspace, "release", "layaweb", (versionName), "main.min.js"), filecontent);
	var jsscript = /<!--jsfile--startTag-->((?:.|(?:\r?\n))*)<!--jsfile--endTag-->/;
	var mainjsscript = /<!--jsfile--Main-->((?:.|(?:\r?\n))*)<!--jsfile--Main-->/;
	var alljs = jsscript.exec(data);
	var mainjs = mainjsscript.exec(data);
	if (mainjs)
	{
		data = data.replace(alljs[0], '');
		data = data.replace(mainjs[0], '<script type="text/javascript" src="main.min.js"></script>')
	}
	else if (alljs)
	{
		data = data.replace(alljs[0], '<script type="text/javascript" src="main.min.js"></script>');
	}
	if (type != "as") fs.writeFileSync(path.join(workspace, "release", "layaweb", (versionName), "index.html"), data);
	else fs.writeFileSync(path.join(workspace, "release", "layaweb", (versionName), "h5/index.html"), data);


	if (configuration.versionmode == 1)
	{
		return
	}

	if (type != "as")
	{
		setTimeout(function()
		{
			var result = UglifyJS.minify([path.join(workspace, "release", "layaweb", (versionName), "main.min.js")]);
			fs.writeFileSync(path.join(workspace, "release", "layaweb", (versionName), "main.min.js"), result.code);
		}, 10)
	}
	else
	{
		setTimeout(function()
		{
			var fileList = fs.readdirSync(path.join(workspace, "release", "layaweb", (versionName), "h5"));
			for (var k = 0; k < fileList.length; k++)
			{
				if (fileList[k].indexOf(".max.js") != -1)
				{
					var result = UglifyJS.minify([path.join(workspace, "release", "layaweb", (versionName), "h5", fileList[k])]);
					fs.writeFileSync(path.join(workspace, "release", "layaweb", (versionName), "h5", fileList[k]), result.code);
				}
			}
		}, 10)
	}
}