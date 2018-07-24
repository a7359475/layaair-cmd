 var window = window || global;
 var document = document || (window.document = {});

 var Laya = require('./ideTool.max').Laya;
(function(window, document, Laya){

  var __un=Laya.un,__uns=Laya.uns,__static=Laya.static,__class=Laya.class,__getset=Laya.getset,__newvec=Laya.__newvec;
  var SystemSetting = laya.ide.config.SystemSetting;
  var TypeManager=laya.ide.managers.TypeManager;
  var CMDShell=laya.ide.devices.CMDShell;
  var FileTools=laya.ide.devices.FileTools;
  var Browser=laya.utils.Browser;
  var FileManager=laya.ide.managers.FileManager;
  var Device=laya.ide.devices.Device;
  var ExportManager=laya.editor.manager.ExportManager;
  var CodeTplManager=laya.editor.manager.CodeTplManager;
  var RenderManager=laya.ide.managers.RenderManager;
  var PageExportType = laya.ide.consts.PageExportType;
  var ViewHook = laya.ide.hook.ViewHook;
  var ProjectManager = laya.editor.manager.ProjectManager;
  var ResStyleManager = laya.editor.manager.ResStyleManager;
  var ResFileManager = laya.ide.managers.ResFileManager;
  var AppendPropGroupTool = laya.editor.view.prop.AppendPropGroupTool;
  var XML2Object=laya.debug.tools.XML2Object;
  var UIConfigManager=laya.editor.manager.UIConfigManager;
  var XMLElement=laya.editor.core.Wraps.xml.XMLElement;
  var XML2ObjectNodejs=laya.debug.tools.XML2ObjectNodejs;
  var ProjectSetting=laya.ide.config.ProjectSetting;
  var ResManager=laya.editor.manager.ResManager;
  var Paths=laya.ide.consts.Paths;

  /**
   *...
   *@author ww
   */
    //class laya.ide.devices.OSInfo
  var OSInfo=(function(){
      function OSInfo(){}
      __class(OSInfo,'laya.ide.devices.OSInfo');
      OSInfo.init=function(){
        OSInfo.os=Device.require("os");
        OSInfo.platform=OSInfo.os.platform();
        OSInfo.tempdir=OSInfo.os.tmpdir();
        OSInfo.type=OSInfo.os.type();
        var tProcess;
        tProcess=process;;
        OSInfo.process=tProcess;
        OSInfo.env=OSInfo.process.env;
        console.log("type:",OSInfo.type);
      }

      OSInfo.os=null
      OSInfo.platform=null
      OSInfo.homedir=null
      OSInfo.tempdir=null
      OSInfo.type=null
      OSInfo.process=null
      OSInfo.env=null
      return OSInfo;
    })()

  var LayaAirCmdTool=(function(){
    function LayaAirCmdTool(){
      this.tarProject="";
      this.releasemode="normal";
      this.appPath=null;
      this.clear="false";
      this.scriptPath=null;
      this.exportUICode="true";
      this.exportRes="true";
      LayaAirCmdTool.I=this;
      this.init();
    }

    __class(LayaAirCmdTool,'LayaAirCmdTool');
    var __proto=LayaAirCmdTool.prototype;
    __proto.init=function(){
      SystemSetting.isCMDVer=true;
      window.DOMParser = require('xmldom').DOMParser;
      TypeManager.init();
      var argv;
      argv=process.argv;;
      console.log("argv:",argv);
      this.parseCMD(argv);
      CMDShell.init();
      FileTools.init2();
      this.appPath=this.getAbsPath("./");
      OSInfo.init();
      Browser.userAgent=OSInfo.type;
      FileTools.tempApp=FileManager.getPath(OSInfo.env["APPDATA"]||OSInfo.env["HOME"],"LayaAirIDE");
      Device.dataPath=FileTools.tempApp;
      SystemSetting.appPath=this.appPath;
      SystemSetting.tempPath=FileManager.getAppPath("data");
      console.log("appPath:",this.appPath);
      ExportManager.isCmdVer=true;
      CodeTplManager.initCodeTpls();
      RenderManager.addXMLConfig(this.getAbsPath("data/laya.editorUI.xml"));
      this.addCustomConfig(this.getAbsPath("data/custom"));
      this.fixed();
      this.openProject(this.tarProject,this.releasemode=="release");
    };

    __proto.fixed=function() {
      // 修复xml对象获取children.length错误，导致Script属性设置错误
      AppendPropGroupTool.readXMLPropConfig=function(path,insertRender){
        (insertRender===void 0)&& (insertRender=false);
        if(!FileTools.exist(path))return {};
        // TODO - JunC 这里是错误的地方
        // var xmlFile;
        // xmlFile=FileTools.readFile(path);
        // var xml;
        // xml=laya.utils.Utils.parseXMLFromString(xmlFile);
        // console.log("[T]", "parseXMLFromString", xml);
        // var obj;
        // obj=XML2Object.parse(xml);

        // TODO - JunC 这里是修改的地方
        var xmlFile;
        xmlFile=FileTools.readFile(path);
        var xml;
        xml=XMLElement.parseXmlFromString(xmlFile);
        var obj;
        obj=XML2ObjectNodejs.parse(xml);

        if(insertRender){
          UIConfigManager.addNewConfig(obj.c);
        }
        return obj.cList[0];
      }

      ExportManager.exportResWork=function(release){
        var blackList=ExportManager.getSkipRes();
        var whilteList=ExportManager.getWhitePackList();
        var repeatList=ExportManager.getRepeatList();
        var scaleInfos;
        scaleInfos=ResStyleManager.getScaledFolders();
        console.log(scaleInfos);
        console.log("ProjectSetting.atlasScale",ProjectSetting.atlasScale);
        if(release)blackList=blackList.concat(ResManager.getUnUserdList());
        var allNotPacks;
        allNotPacks=ResFileManager.getAllUnPackLinkList(null);
        var notPackDirs;
        notPackDirs=ResStyleManager.getAllUnPackDir();
        allNotPacks=allNotPacks.concat(notPackDirs);
        var notPackFilePath;
        notPackFilePath=FileManager.getWorkPath(ExportManager.adptCallPath(ProjectSetting.asynResExportPath)+"/unpack.json");
        FileManager.createJSONFile(notPackFilePath,allNotPacks);
        var oldPathPackPath="libs/TP/TileAtlasPacker";
        var newPathPackPath="libs/TP/atlas-generator";
        if (SystemSetting.isCMDVer){
          oldPathPackPath=oldPathPackPath.replace("libs/","");
          newPathPackPath=newPathPackPath.replace("libs/","");
        };
        var cmd="\""+FileManager.getAppPath(oldPathPackPath)+"\""+
          " -maxAltasWidth="+ProjectSetting.textureWidth+" -maxAltasHeight="+ProjectSetting.textureHeight+
          " -tileWidthLimit="+ProjectSetting.picWidth+" -tileHeightLimit="+ProjectSetting.picHeight+
          " "+"\""+ExportManager.adptCallPath(SystemSetting.assetsPath)+"\""+
          " -outputDir="+"\""+ExportManager.adptCallPath(FileManager.getWorkPath(ProjectSetting.resExportPath))+"\"";
        if(ExportManager.clearRes){
          cmd+=" -force=true";
        }
        if(ProjectSetting.power2=="true"){
          cmd+=" -powerOfTwo=true";
        }
        if(ProjectSetting.trimempty=="true"){
          cmd+=" -trim=true";
        }else{
          cmd+=" -trim=false";
        }
        cmd+=" -htmlDir="+"\""+ExportManager.adptCallPath(FileManager.getWorkPath(ProjectSetting.asynResExportPath))+"\"";
        cmd+=" -blackList="+"\""+blackList+"\"";
        cmd+=" -inflateList="+"\""+repeatList+"\"";
        cmd+=" -includeList="+"\""+whilteList+"\"";
        var packFilePath=Paths.getPackParamFile();
        var packObj;
        packObj={};
        packObj["inputDir"]=ExportManager.adptCallPath(SystemSetting.assetsPath);
        packObj["outputDir"]=ExportManager.adptCallPath(FileManager.getWorkPath(ProjectSetting.resExportPath));
        packObj["resDir"]=ExportManager.adptCallPath(FileManager.getWorkPath(ProjectSetting.asynResExportPath));
        packObj["force"]=ExportManager.clearRes;
        packObj["includeList"]=ExportManager.getNewParamList(whilteList);
        packObj["excludeList"]=ExportManager.getNewParamList(blackList);
        packObj["extrudeList"]=ExportManager.getNewParamList(repeatList);
        if(ProjectSetting.copyRes!="true"){
          packObj["resDir"]="";
        };
        var atlas;
        atlas={};
        atlas["width"]=ProjectSetting.textureWidth;
        atlas["height"]=ProjectSetting.textureHeight;
        atlas["size"]=parseInt(ProjectSetting.textureWidth+"");
        atlas["quality"]=-1;
        atlas["pixelFormat"]=ProjectSetting.picType==0?"ARGB32":"Indexed8";
        atlas["POT"]=ProjectSetting.power2=="true";
        console.log("picType:",ProjectSetting.picType);
        atlas["textureFormat"]="PNG";
        packObj["atlas"]=atlas;
        if(ProjectSetting.atlasScale>0){
          atlas["scale"]=ProjectSetting.atlasScale;
        }
        packObj["scaleDir"]=scaleInfos;
        var dataParam;
        dataParam={};
        dataParam["format"]=ProjectSetting.atlasType==0?"json":"atlas";
        dataParam["compact"]=ProjectSetting.dataCompact=="true";
        packObj["data"]=dataParam;
        var spriteConfig;
        spriteConfig={};
        spriteConfig["width"]=ProjectSetting.picWidth;
        spriteConfig["height"]=ProjectSetting.picHeight;
        spriteConfig["size"]=parseInt(ProjectSetting.picWidth+"");
        spriteConfig["rotation"]=false;
        spriteConfig["extrude"]=1;
        spriteConfig["padding"]=1;
        spriteConfig["cropAlpha"]=ProjectSetting.trimempty=="true";
        packObj["sprite"]=spriteConfig;
        FileManager.createJSONFile(packFilePath,packObj);
        var option;
        option={encoding:"binary",maxBuffer:1024*1024*20};;
        var newCmd;
        newCmd="AtlasGenerator  "+"\""+ExportManager.adptCallPath(packFilePath)+"\"";
        newCmd="\""+FileManager.adptToCommonUrl(FileManager.getAppPath(newPathPackPath))+"\""+" "+"\""+ExportManager.adptCallPath(packFilePath)+"\"";
        newCmd="\""+FileManager.adptToCommonUrl(FileManager.getAppPath(newPathPackPath))+"\""+" "+"\""+FileManager.adptToCommonUrl(ExportManager.adptCallPath(packFilePath))+"\"";
        // TODO - JunC 这里导致了获取atlas-generator的路径错误
        // if(ExportManager.isCmdVer){
        //   newCmd="\""+FileTools.path.join(__dirname,"..","..","..","out","vs","layaEditor","libs","TP","atlas-generator")+"\""+" "+"\""+FileManager.adptToCommonUrl(laya.editor.manager.ExportManager.adptCallPath(packFilePath))+"\"";
        // }
        console.log("newCmd:",newCmd);
        cmd=newCmd;
        console.log("Waiting for pics packing");
        FileManager.createDirectory(FileManager.getWorkPath(ProjectSetting.resExportPath));
        CMDShell.execute(cmd,function(err,stdOut,stdErr){
          if (err){
            console.log("Error Occured: "+err);
            if(!ExportManager.isCmdVer){
              MessageManager.instance.show("Export Atlas Fail");
              Waiting.hide();
            }
            return;
          }
          else{
            console.log(stdErr);
          }
          if (SystemSetting.isCMDVer){
            console.log(stdOut);
          }
          if(!ExportManager.exportExcels(ExportManager.packingEndHandler,ExportManager.clearRes))
            ExportManager.packingEndHandler(err,stdOut,stdErr);
        },option);
        return true;
      }
    };

    __proto.parseCMD=function(args){
      this.scriptPath=args[1];
      this.tarProject=args[2];
      var i=0,len=0;
      len=args.length;
      var tParam;
      var pArr;
      for (i=3;i < len;i++){
        tParam=args[i];
        if (tParam.indexOf("=")> 0){
          pArr=tParam.split("=");
          this[pArr[0]]=pArr[1];
        }
      }
    };

    __proto.addCustomConfig=function(path){
      if (FileTools.exist(path)){
        var files;
        files=FileTools.getDirFiles(path);
        console.log("custom files",files);
        var fileType;
        var i=0,len=0;
        len=files.length;
        var tFile;
        for (i=0;i < len;i++){
          tFile=files[i];
          if (FileTools.getExtensionName(tFile)=="xml"){
            console.log("add Cumstom config:",tFile);
            RenderManager.addXMLConfig(FileManager.getPath(path,tFile));
          }
        }
      }
    };

    __proto.getAbsPath=function(path){
      return FileManager.getPath(FileTools.getFolder(this.scriptPath),path);
    };

    __proto.openProject=function(projectPath,release){
      (release===void 0)&& (release=true);
      console.log("openProject:",projectPath);
      ProjectManager.loadProject(projectPath,null,true);
      console.log("assetsPath:",SystemSetting.assetsPath);
      ResFileManager.setPath(SystemSetting.assetsPath);
      ResStyleManager.init();
      // PageStyleManager.init();
      this.addCustomConfig(FileManager.getWorkPath("laya/custom"));
      ExportManager.packingEndHandler=laya.editor.utils.Utils.bind(this.packingEnd,this);
      ExportManager.clearRes=false;
      var ifExportCode=false;
      ifExportCode=this.exportUICode !="false";
      var ifExportRes=false;
      ifExportRes=this.exportRes !="false";
      if (this.clear !="false"){
        if (ifExportCode){
          ExportManager.clear();
        }
        ExportManager.clearRes=true;
      }
      ExportManager.doExportLater(release,ifExportCode,ifExportRes);
    };

    __proto.packingEnd=function(){
      console.log("Packing complete");
      console.log("All Work complete");
    };

    LayaAirCmdTool.I=null;
    return LayaAirCmdTool;
  })();

  Laya.__init([PageExportType,ViewHook]);
  // TODO - JunC 这里是导出UI的代码
  new LayaAirCmdTool();
})(window,document,Laya);
