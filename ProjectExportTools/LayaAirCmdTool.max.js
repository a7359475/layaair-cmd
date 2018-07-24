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
      AppendPropGroupTool.readXMLPropConfig=function(path,insertRender){
        (insertRender===void 0)&& (insertRender=false);
        if(!FileTools.exist(path))return {};
        // var xmlFile;
        // xmlFile=FileTools.readFile(path);
        // var xml;
        // xml=laya.utils.Utils.parseXMLFromString(xmlFile);
        // console.log("[T]", "parseXMLFromString", xml);
        // var obj;
        // obj=XML2Object.parse(xml);

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
      // ExportManager.export(release)
      ExportManager.clear();
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
