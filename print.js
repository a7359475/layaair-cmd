const colors = require('colors');
const execSync = require("child_process").execSync;

let code_page = execSync("chcp",
{
	encoding: "utf-8"
}).replace(/\D/g, '');
// 1 is chinese, 0 is english
let language = code_page == "936" ? 1 : 0;

let tr_list = [
	["Invalid directory, file name ends with '.laya' is no found, no project here.", "无效目录，未找到后缀名为 '.laya' 的文件，此处没有项目"],
	["Project directory is not exists.", "项目目录不存在"],
	["Start  compile...", "开始编译……"],
	["Compile completed.", "编译完成"],
	["Error: No FlashDevelop or FlashBuilder project file.", "错误：不存在FlashDevelop或FlashBuilder的项目文件"],
	["There are both FlashDevelop and FlashBuilder project file. Ignore FlashBuilder project", "同时存在FlashDevelop和FlashBuilder的项目文件。忽略FlashBuilder项目文件"],
	["Detected", "检测到"],
	["project", "项目"],
	["Do nothing", "无需编译"],
	["Compress options. Empty for no processing, 'c' for compress, 'cc' for compress and concat.", "压缩选项。留空不处理，'c'表示压缩，'cc'表示压缩并合并"],
	["finish.", "完成"],
	["clear will delete old UI code file.", "clear会删除旧的UI代码文件"],
	["'normal' or 'release', specify 'release' will generate UI code files beside unused resources.", "'normal'或者'release'，指定'release'会生成除未使用资源外的UI代码文件"],
	["project directory(include projectName.laya), if not specify, it will be current work directory.", '项目目录（包含projectName.laya的文件夹），如果不指定，会使用当前工作目录作为项目目录。'],
	["input directory, if not specify, it will be current work directory.", "输入目录，如果不指定，将使用当前目录"],
	["export UI code files.", "生成UI代码文件"],
	["version name, default is numbers start from 1000.", "版本名称，默认是从1000开始递增的数字"],
	["resource directory.", "资源目录"],
	["output directory.", "导出目录"],
	["use options define in config file. Ignore all other options if this option is on. If the input directory containes laya project, you don't need to specify config file, otherwise, you need pass a config file path.", "使用配置文件定义的选项。开启该选项时忽略所有其他选项，如果输入目录包含laya项目，可以不必指定配置文件，否则，你需要传入配置文件路径"],
	["Wrong arguments.", "参数错误"],
	["You must specify input directory.", "必须指定输入目录"]
];

/**
 * if os language is chinese, return tranlated content.
 * else return origin content.
 */
function tr(content)
{
	if (language != 1)
		return content;

	for (var i = tr_list.length - 1; i >= 0; i--)
	{
		var tr_item = tr_list[i];
		if (content == tr_item)
			return tr_item[0];
	}
}

exports.printQuotation = function(data)
{
	console.log(data.gray);
};

exports.printErr = function(data)
{
	console.log(data.red);
};

exports.printOk = function(data)
{
	console.log(data.green);
}

exports.printWarning = function(data)
{
	console.log(data.yellow);
}

exports.tr = tr;