const path    = require("path");
const program = require("commander");
const fs      = require("fs");
const spawn   = require("child_process").spawn;
const os      = require("os");
const
{
	printQuotation,
	printErr,
	printOk,
	printWarning,
	tr
} = require("./print.js");

program
	.version("0.1.0")
	.option('-d --input <input directory>',				tr("Input directory, if not specify, it will be ${cwd}/laya/assets'"))
	.option('--init',									tr("Generate config file."))
	.option('--config [config file]',					tr("use options define in config file. Ignore all other options if this option is on. If the input directory containes laya project, you don't need to specify config file, otherwise, you need pass a config file path."))
	.option('-o --output <output directory>',		tr("output directory."))
	.option('-r --resDir <resource directory>',			tr("The folder to storage unpacked assets."))
	.option('-E --extrudeList <extrude list>',			tr("This list storage pictures which need extrude, split by ','"))
	.option('-W --maxAtlasWidth <max atlas width>',		tr("The max sprite sheet width that allowed. 2048 default."))
	.option('-H --maxAtlasHeight <max atlas height>',	tr("The max sprite sheet height that allowed. 2048 default."))
	.option('-w --tileWidthLimit <tile width limit>',	tr("The width limit for packing. Image will be copy to unpackDir directly if size overflowed. 512 default."))
	.option('-h --tileHeightLimit <tile height limit>',	tr("The height limit for packing. Image will be copy to unpackDir directly if size overflowed. 512 default."))
	.option('-i --includeList <include list>',			tr("The picture in include list must be packed. Picture pass by full path and split by ','"))
	.option('-x --excludeList <exclude list>',			tr("The picture in exclude list will not packed. Picture pass by full path and split by ','"))
	.option('-p --shapePadding <shape padding>',		tr("Shape padding is the space between sprites. Value adds transparent pixels between sprites to avoid artifacts from neighbor sprites. The transparent pixels are not added to the sprites. Default is 2."))
	.option('-f --force',								tr("If ture, then publish even if picture never be modified."))
	.option('-2 --powerOfTwo',							tr("If the altas should be in units of power of 2 or irregular."))
	.option('-c --cropAlpha',							tr("If source sprites should be cropped to their transparency bounds to pack them even tighter."))
	.option('--textureFormat',							tr("Choose the texture format. Support png32 and png8 now."))
	.parse(process.argv);

if (!program.input)
{
	program.input = path.resolve(process.cwd(), "laya", "assets");
}

let args = [];

// use options define in config file.
if (program.config)
{
	args.push("--config");
	args.push(path.join(os.homedir(), "AppData", "Roaming", "LayaAirIDE", "packParam.json"));
}
// user pass arguments manually.
else if(program.init)
{
	args.push("--init");
}
else
{
	if(program.input)
		args.push("--inputDir", program.input);
	if(program.output)
		args.push("--output", program.output);
	if(program.resDir)
		args.push("--resDir", program.resDir);
	if(program.extrudeList)
		args.push("--extrudeList", program.extrudeList);
	if(program.maxAtlasWidth)
		args.push("--maxAtlasWidth", program.maxAtlasWidth);
	if(program.maxAtlasHeight)
		args.push("--maxAtlasHeight", program.maxAtlasHeight);
	if(program.tileWidthLimit)
		args.push("--tileWidthLimit", program.tileWidthLimit);
	if(program.tileHeightLimit)
		args.push("--tileHeightLimit", program.tileHeightLimit);
	if(program.includeList)
		args.push("--includeList", program.includeList);
	if(program.excludeList)
		args.push("--excludeList", program.excludeList);
	if(program.shapePadding)
		args.push("--shapePadding", program.shapePadding);
	if(program.force)
		args.push("--force", program.force);
	if(program.powerOfTwo)
		args.push("--powerOfTwo", program.powerOfTwo);
	if(program.cropAlpha)
		args.push("--cropAlpha", program.cropAlpha);
	if(program.textureFormat)
		args.push("--textureFormat", program.textureFormat);
}

const shpath = path.join(__dirname, "ProjectExportTools", "TP", "atlas-generator.sh");
sp = spawn(
   '/bin/sh',
   ['-c', "\"" + shpath + "\""].concat(args),
	);

sp.stdout.on("data", (data) =>
{
	printQuotation(data.toString());
});
// log stream.
sp.stderr.on("data", (data) =>
{
	printQuotation(data.toString());
});
sp.on("close", (data) =>
{
	printOk(tr("finish."));
});