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
	["Input directory, if not specify, it will be '{cwd}/laya/assets'", "输入目录，如果不指定，'{cwd}/laya/assets'"],
	["export UI code files.", "生成UI代码文件"],
	["version name, default is numbers start from 1000.", "版本名称，默认是从1000开始递增的数字"],
	["resource directory.", "资源目录"],
	["output directory.", "导出目录"],
	["use options define in config file. Ignore all other options if this option is on. If the input directory containes laya project, you don't need to specify config file, otherwise, you need pass a config file path.", "使用配置文件定义的选项。开启该选项时忽略所有其他选项，如果输入目录包含laya项目，可以不必指定配置文件，否则，你需要传入配置文件路径"],
	["Wrong arguments.", "参数错误"],
	["You must specify input directory.", "必须指定输入目录"],
	["print help message.", "打印帮助信息"],
	["The folder to storage unpacked assets.", "无法被打包的文件的输出目录"],
	["This list storage pictures which need extrude, split by ','","需要像素扩展的图片列表，逗号分隔"],
	["The max sprite sheet width that allowed. 2048 default.", "允许的图集最大宽度，默认2048"],
	["The max sprite sheet height that allowed. 2048 default.", "允许的图集最大高度，默认2048"],
	["The width limit for packing. Image will be copy to unpackDir directly if size overflowed. 512 default.", "允许被打包的图片的最大宽度。如果尺寸超出该值，图片会被复制到资源目录。默认512"],
	["The height limit for packing. Image will be copy to unpackDir directly if size overflowed. 512 default.", "允许被打包的图片的最大高度。如果尺寸超出该值，图片会被复制到资源目录。默认512"],
	["The picture in include list must be packed. Picture pass by full path and split by ','", "无论是否符合条件，都会被打包的图片列表，逗号分隔"],
	["The picture in exclude list will not packed. Picture pass by full path and split by ','", "无论是否符合条件，都不会被打包的图片列表，逗号分隔"],
	["Shape padding is the space between sprites. Value adds transparent pixels between sprites to avoid artifacts from neighbor sprites. The transparent pixels are not added to the sprites. Default is 2.", "每张图片的间距，默认为2"],
	["If ture, then publish even if picture never be modified.", "无视是否距上次打包后修改过资源，都强制重新打包"],
	["If the altas should be in units of power of 2 or irregular.", "开启后，图集尺寸会是2的整次幂"],
	["If source sprites should be cropped to their transparency bounds to pack them even tighter.", "是否裁减掉图片的透明区域"],
	["Choose the texture format. Support png32 and png8 now.", '默认"png32"，还可选为"png8"'],
	["wrong arguments, refenerce to help message.", "参数错误，参考帮助信息"],
	["Generate config file.", "创建默认配置文件"]
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