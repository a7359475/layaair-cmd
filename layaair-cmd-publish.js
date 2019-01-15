const path = require("path");
const program = require("commander");
const fs = require("fs");
const fse = require("fs-extra");
const UglifyJS = require("uglify-js");
const child_process = require("child_process");


const workspace = path.resolve();
const workspacePath = workspace;
const PathPubSet = path.resolve("./laya/pubset.json");

const
  {
    printErr,
    tr
  } = require("./print.js");

program
  .version("1.7.18")
  .option('--sourcePath <path>', tr("Source root directory"))
  .option('--outPath <path>', tr("Publishing directory"))
  .option('--pngQualityLow <quality>', tr("PNG Minimal quality"))
  .option('--pngQualityHigh <quality>', tr("PNG Maximum quality"))
  .option('--jpgQuality <quality>', tr("JPG quality"))
  .option('--mergeJs', tr("Whether to merge all the js files in index.html (for mini-game only)"))
  .option('--compressPng', tr("Whether or not to compress PNG (time consuming)"))
  .option('--compressJpg', tr("Whether or not to compress JPG (very time-consuming but very effective)"))
  .option('--compressJson', tr("Whether or not to compress JSON"))
  .option('--jsontypes <suffix>', tr("JSON suffix, default:json,atlas,ls,lh,lmat,lav,prefab"))
  .option('--compressJs', tr("Compression obfuscates JS (time consuming)"))
  .option('--enableVersion', tr("Whether to enable version management, when enabled, will rename the changed file"))
  .option('--onlyIndexJS', tr("是否只复制index.html中引用的js文件"))
  .option('--deleteOldVersionFile', tr("是否删除老版本的文件"))
  .option('--excludeFiles <files>', tr("Exclude files"))
  .option('--publishType <platform>', tr("Publishing platform: webnative(default), wxnimigame, qqwanyiwan"))
  .option('--projectType', tr("Project type: as, ts(default), js"))
  .option('--copyOutFiles <files>', tr("Copy files list"))
  .option('--copyOutPath <path>', tr("Copy files target path"))
  .option('--userCmd <cmd>', tr("After execute cmd"))
  .parse(process.argv);


function getBoolean(value) {
  return value ? "true" : "false";
}

function getPublishType(value) {
  switch (value) {
    case "webnative":
      return 0;
    case  "wxnimigame":
      return 1;
    case "qqwanyiwan":
      return 2;
  }
}

function getParamObj() {
  let ret = {};
  ret.sourcePath = program.sourcePath || "";
  ret.outPath = program.outPath || "";
  program.pngQualityLow && (ret.pngQualityLow = program.pngQualityLow);
  program.pngQualityHigh && (ret.pngQualityHigh = program.pngQualityHigh);
  ret.jpgQuality = Number(program.jpgQuality) > 84 ? program.jpgQuality : '84';
  ret.mergeJs = getBoolean(program.mergeJs);
  ret.compressPng = getBoolean(program.compressPng);
  ret.compressJpg = getBoolean(program.compressJpg);
  ret.compressJson = getBoolean(program.compressJson);
  ret.jsontypes = program.jsontypes || "json,atlas,ls,lh,lmat,lav,prefab";
  ret.compressJs = getBoolean(program.compressJs);
  ret.enableVersion = getBoolean(program.enableVersion);
  ret.onlyIndexJS = getBoolean(program.onlyIndexJS); // 是否只复制index.html中引用的js文件
  ret.deleteOldVersionFile = getBoolean(program.deleteOldVersionFile); // 是否删除老版本的文件
  ret.excludeFiles = program.excludeFiles || "";
  ret.publishType = getPublishType(program.publishType || "webnative");
  ret.projectType = program.projectType || "ts";
  ret.copyOutFiles = program.copyOutFiles || "";
  ret.copyOutPath = program.copyOutPath || "";
  ret.userCmd = program.userCmd || "";
  return ret;
}

const paramObj = getParamObj();

function publish() {
  console.log("getParamObj", getParamObj());
  let param = getParamObj();

  restorePanelInfo();

  preCompile(function() {
    const paramFilePath = generatePackParamFile();
    exePack(paramFilePath, function(ret) {
      if ("as" === paramObj.projectType && paramObj.publishType=="qqwanyiwan") {
        const pathSrc = path.join(getCrtSrcPath(), "LayaUISample.max.js");
        const pathDest = path.join(workspacePath, ".laya", "LayaUISample.max.js");
        if (fs.existsSync(pathDest)) {
          fs.renameSync(pathDest, pathSrc);
        }
        const pathFile = path.join(getCrtSrcPath(), "laya.js");
        if (fs.existsSync(pathFile)) {
          fs.unlinkSync(pathFile);
        }
      }
      //showWaiting(false);
      if (ret) {
        alert("运行过程中有报错，请确认：" + ret);
      } else {
        console.log("发布成功！");
      }
      process.exit();
    });
  });
}

function generatePackParamFile() {
  const filePath = getPackParamFilePath();
  const paramObj = getParamObj();
  const fileContent = JSON.stringify(paramObj);
  fs.writeFileSync(filePath, fileContent);
  return filePath;
}

function getPackParamFilePath() {
  return path.resolve("./.laya/pubParam.json");
}

function getStorageItem() {
  if (!fs.existsSync(PathPubSet)) {
    return {};
  }

  let fileContent = fs.readFileSync(PathPubSet);
  // let pub2Obj = localStorage.getItem(KeyStore);
  let pub2Obj = fileContent ? JSON.parse(fileContent) : {};
  return pub2Obj;
}

function restorePanelInfo() {
  const pub2Obj = getStorageItem();
  const pf = paramObj.publishType;
  pub2Obj[pf] = paramObj;
  pub2Obj["pf"] = pf;
  const infoStr = JSON.stringify(pub2Obj);
  try
  {
    fs.writeFileSync(PathPubSet, infoStr);
  }catch(e)
  {
    alert("写入文件失败,请将项目移到无空格无特殊字符以及无中文的目录再重试:"+PathPubSet)
  }
  // localStorage.setItem(KeyStore, infoStr);
  return pub2Obj;
}

function preCompile(cb) {
  if ("as" !== paramObj.projectType || paramObj.publishType !== "qqwanyiwan") {
    cb && cb();
    return;
  }
  const pathSrc = path.join(getCrtSrcPath(), "LayaUISample.max.js");
  const pathDest = path.join(workspacePath, ".laya", "LayaUISample.max.js");
  if (fs.existsSync(pathSrc)) {
    fs.renameSync(pathSrc, pathDest);
  }

  compilePro(function() {
    cb && cb();
  });
}

function compilePro(cb) {
  let ret = 0;
  const pathLayajs = path.join(workspacePath, ".laya", "astool", "layajs");
  let args = [path.join(workspacePath, ".actionScriptProperties") + ";iflash=false;windowshow=false;chromerun=false;quickcompile=true;outlaya=true"];
  let layajs = spawn(pathLayajs, args);

  layajs.stdout.on('data', function (data) {
    console.log(`stdout: ${data}`);
  });

  layajs.stderr.on('data', function (data) {
    console.log(`stderr: ${data}`);
    ret = 1;
  });

  layajs.on('close', function (code) {
    console.log(`child process exited with code ${code}`);
    ret = code;
    cb && cb(code);
  });
  return ret;
}

function getCrtSrcPath() {
  // return inputSrcDir.value || getDftHtmlDir();
  return paramObj.sourcePath || getDftHtmlDir();
}

function getDftHtmlDir() {
  let ret = "";
  switch (paramObj.projectType) {
    case "as":
      ret = path.join("bin", "h5");
      break;
    case "js":
    case "ts":
      ret = path.join("bin");
      break;
    default:
      console.log("Unexpected Project Type: " + paramObj.projectType);
  }
  return ret;
}

function getPackModPath() {
  return path.join(__dirname, "ProjectExportTools", "LayaAirProjectPack.max.js");
}

function filterInfo(data) {
  if (!data) return;
  const dataLineArr = data.split("\n");
  for (let i = 0; i < dataLineArr.length; ++i) {
    filterLine(dataLineArr[i]);
  }
}


function filterLine(lineStr) {
  if (!lineStr) return;
  if (0 === lineStr.indexOf("[DATA]")) {
    cmnOutput(lineStr);
  } else if (0 === lineStr.indexOf("[ERR]")) {
    errOutput(lineStr);
  } else if (0 === lineStr.indexOf("[PROGRESS]")) {
    cmnOutput(lineStr);
  } else {
    cmnOutput(lineStr);
  }
}

function cmnOutput(msg) {
  console.log(msg);
}

function errOutput(msg) {
  console.error(msg);
}

function filterErrInfo(data) {
  if (!data) return;
  const dataLineArr = data.split("\n");
  for (let i = 0; i < dataLineArr.length; ++i) {
    filterErrLine(dataLineArr[i]);
  }
}

function filterErrLine(lineStr) {
  if (!lineStr) return;
  if (0 === lineStr.indexOf("[xmldom warning]")) {
    cmnOutput(lineStr);
  } else if (0 === lineStr.indexOf("@#[line:")) {
    cmnOutput(lineStr);
  } else {
    errOutput(lineStr);
  }
}

function exePack(paramFilePath, cb) {
  let ret = 0;
  if (!fs.existsSync(paramFilePath)) {
    ret = 1;
    alert("指定的参数文件不存在：" + paramFilePath);
    return ret;
  }
  const exePath = getPackModPath();
  // const LayaAirProjectPack = spawn("node", [exePath, 'paramFile=' + paramFilePath]);

  let LayaAirProjectPack = child_process.fork(exePath, ['paramFile=' + paramFilePath], {
    silent: true
  });

  let outputStr = "";
  LayaAirProjectPack.stdout.on('data', (data) => {
    outputStr += data + "";
    if (outputStr.indexOf('work done') !== -1) {
      filterInfo(outputStr);
      filterErrInfo(errOutputStr);
      cb && cb('');
    }
  });

  let errOutputStr = "";
  LayaAirProjectPack.stderr.on('data', (data) => {
    errOutputStr += data + "";
    console.log(`stderr: ${data}`);
  });

  LayaAirProjectPack.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    ret = code;
    filterInfo(outputStr);
    filterErrInfo(errOutputStr);
    cb && cb(code);
  });
}
publish();


