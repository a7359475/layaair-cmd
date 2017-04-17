var fs = require("fs");
var path = require("path");
var  UglifyJS = require("uglify-js")
function mkdirsSyncLaya(dirname, mode)
{
	if (fs.existsSync(dirname))
	{
		return true;
	}
	else
	{
		if (mkdirsSyncLaya(path.dirname(dirname), mode))
		{
			fs.mkdirSync(dirname, mode);
			return true;
		}
	}
}

function layacopyDirFile(from, to)
{
	var readDir = fs.readdirSync;
	var stat = fs.statSync;
	if (stat(from).isFile())
	{
		mkdirsSyncLaya(to);
		fs.writeFileSync(to + path.sep + path.basename(from), fs.readFileSync(from));
		return
	}
	var copDir = function(src, dst)
	{
		var paths = fs.readdirSync(src);
		paths.forEach(function(pathLaya)
		{
			var _src = src + path.sep + pathLaya;
			var _dst = dst + path.sep + pathLaya;
			var isDir = stat(_src);
			if (isDir.isFile())
			{
				if (path.extname(_src) == ".map")
				{

				}
				else
				{
					fs.writeFileSync(_dst, fs.readFileSync(_src));
				}

			}
			else
			{
				exists(_src, _dst, copDir);
			}
		})
	}

	function mkdirsSyncLaya(dirname, mode)
	{
		if (fs.existsSync(dirname))
		{
			return true;
		}
		else
		{
			if (mkdirsSyncLaya(path.dirname(dirname), mode))
			{
				fs.mkdirSync(dirname, mode);
				return true;
			}
		}
	}

	// 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
	var exists = function(src, dst, callback)
	{
		mkdirsSyncLaya(dst);
		callback(src, dst);
	};
	// 复制目录
	exists(from, to, copDir);
}
exports.indexHmtl = function(configuration)
{
	var type=""
	layacopyDirFile(path.join(configuration.workspacePath, "bin"), path.join(configuration.workspacePath, "release", "layaweb", (configuration.publishversion || "1.0.0")));
	if (fs.existsSync(path.join(configuration.workspacePath, "jsconfig.json")))
	{
		layacopyDirFile(path.join(configuration.workspacePath, "src"), path.join(configuration.workspacePath, "release", "layaweb", (configuration.publishversion || "1.0.0"), "js"));
		var data = fs.readFileSync(path.join(configuration.workspacePath, "release", "layaweb", (configuration.publishversion || "1.0.0"), "index.html"), "utf-8");
		data = data.replace(/..\/src\//g, "js\/");
		data = data.replace(/\blibs\/(laya\.\w+)\.js/g, "libs/min/$1.min.js");
	}
	else if (fs.existsSync(path.join(configuration.workspacePath, "tsconfig.json")))
	{
		var data = fs.readFileSync(path.join(configuration.workspacePath, "release", "layaweb", (configuration.publishversion || "1.0.0"), "index.html"), "utf-8");
		data = data.replace(/..\/src\//g, "js\/");
		data = data.replace(/\blibs\/(laya\.\w+)\.js/g, "libs/min/$1.min.js");
	}
	else
	{
		type = "as"
		var data = fs.readFileSync(path.join(configuration.workspacePath, "release", "layaweb", (configuration.publishversion || "1.0.0"), "h5", "index.html"), "utf-8");
	}
	if(configuration.versionmode==0)
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
		filecontent += fs.readFileSync(path.join(configuration.workspacePath, "release", "layaweb", (configuration.publishversion || "1.0.0"), fileAllJS[i]), "utf-8") + "\n";
	}
	if (type != "as") fs.writeFileSync(path.join(configuration.workspacePath, "release", "layaweb", (configuration.publishversion || "1.0.0"), "main.min.js"), filecontent);
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
	if (type != "as") fs.writeFileSync(path.join(configuration.workspacePath, "release", "layaweb", (configuration.publishversion || "1.0.0"), "index.html"), data);
	else fs.writeFileSync(path.join(configuration.workspacePath, "release", "layaweb", (configuration.publishversion || "1.0.0"), "h5/index.html"), data);


	if(configuration.versionmode==1)
	{
		return 
	}

	if (type != "as")
	{
		setTimeout(function()
		{
			var result = UglifyJS.minify([path.join(configuration.workspacePath, "release", "layaweb", (configuration.publishversion || "1.0.0"), "main.min.js")]);
			fs.writeFileSync(path.join(configuration.workspacePath, "release", "layaweb", (configuration.publishversion || "1.0.0"), "main.min.js"), result.code);
		}, 10)
	}
	else
	{
		setTimeout(function()
		{
			var fileList = fs.readdirSync(path.join(configuration.workspacePath, "release", "layaweb", (configuration.publishversion || "1.0.0"), "h5"));
			for (var k = 0; k < fileList.length; k++)
			{
				if (fileList[k].indexOf(".max.js") != -1)
				{
					var result = UglifyJS.minify([path.join(configuration.workspacePath, "release", "layaweb", (configuration.publishversion || "1.0.0"), "h5", fileList[k])]);
					fs.writeFileSync(path.join(configuration.workspacePath, "release", "layaweb", (configuration.publishversion || "1.0.0"), "h5", fileList[k]), result.code);
				}
			}
		}, 10)
	}
	console.log("发布完成");
}