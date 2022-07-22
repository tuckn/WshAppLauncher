﻿!function(){var util,os,child_process,logger,objAdd,insp,obtain,parseTmp,parseDate,hasContent,includes,isArray,isSolidString,isPlainObject,srrd,apL,MODULE_TITLE,throwErrNonStr;Wsh&&Wsh.AppLauncher||(Wsh.AppLauncher={},util=Wsh.Util,os=Wsh.OS,child_process=Wsh.ChildProcess,logger=Wsh.Logger,objAdd=Object.assign,insp=util.inspect,obtain=util.obtainPropVal,parseTmp=util.parseTemplateLiteral,parseDate=util.parseDateLiteral,hasContent=util.hasContent,includes=util.includes,isArray=util.isArray,isSolidString=util.isSolidString,isPlainObject=util.isPlainObject,srrd=os.surroundCmdArg,apL=Wsh.AppLauncher,MODULE_TITLE="WshAppLauncher/AppLauncher.js",throwErrNonStr=function(functionName,errVal){util.throwTypeError("string",MODULE_TITLE,functionName,errVal)},apL.launchAppUsingLog=function(app,args,options){var FN="apL.launchAppUsingLog",loggerObj=obtain(options,"logger",{}),loggerObj=logger.create(loggerObj),args=(loggerObj.info("Start the function "+FN),isSolidString(app)||throwErrNonStr(FN,app),os.joinCmdArgs(args)),app=srrd(app)+" "+args,args=obtain(options,"shell",!1),winStyle=obtain(options,"winStyle","activeDef"),runsAdmin=obtain(options,"runsAdmin"),isDryRun=obtain(options,"isDryRun",!1),op=objAdd({shell:args,winStyle:winStyle,runsAdmin:runsAdmin,isDryRun:isDryRun},options),args=(loggerObj.info("command: "+app),loggerObj.info("shell: "+args),loggerObj.info("winStyle: "+winStyle),loggerObj.info("runsAdmin: "+runsAdmin),loggerObj.info("isDryRun: "+isDryRun),child_process.exec(app,op));isDryRun&&loggerObj.info(args),loggerObj.info("Finished the function "+FN),obtain(options,"transportsLog",!0)&&loggerObj.transport()},apL.launchAppsUsingSchema=function(schema,taskName,options){var FN="apL.launchAppsUsingSchema",loggerObj=(isPlainObject(schema)||util.throwTypeError("object",MODULE_TITLE,FN,schema),isSolidString(taskName)||throwErrNonStr(FN,taskName),obtain(options,"logger",{})),lggr=logger.create(loggerObj),tasks=(lggr.info("Start function "+FN),lggr.info('taskName: "'+taskName+'"'),schema.tasks),loggerObj=Object.keys(tasks),regNameMatcher=includes(taskName,"*")?new RegExp(taskName.replace(/\*/g,".*")):new RegExp(taskName),taskName=loggerObj.filter(function(taskName){return regNameMatcher.test(taskName)}),vals=(lggr.info("matched tasks: "+taskName.length),schema.components);hasContent(options.overwrites)&&Object.keys(vals).forEach(function(key){null===vals[key]&&Object.keys(options.overwrites).some(function(writeKey){if(key===writeKey)return vals[key]=options.overwrites[writeKey],!0})}),obtain(options,"isDryRun",!1)&&lggr.info("dry-run ["+FN+"]:"),taskName.forEach(function(taskName){if(lggr.info("Start the task: "+taskName),!1===tasks[taskName].available)lggr.info("available: false => Skip this task");else{var app=parseDate(parseTmp(tasks[taskName].app||"",vals)),args=[],shell=(isArray(tasks[taskName].args)&&(args=tasks[taskName].args.map(function(arg){return parseDate(parseTmp(arg||"",vals))})),obtain(tasks[taskName],"shell",!1)),winStyle=parseTmp(tasks[taskName].winStyle||"",vals),taskName=obtain(tasks[taskName],"runsAdmin");try{apL.launchAppUsingLog(app,args,objAdd({transportsLog:!1,"throws":!1},options,{shell:shell,winStyle:winStyle,runsAdmin:taskName,logger:lggr}))}catch(e){lggr.error(insp(e))}}}),lggr.info("Finished function "+FN),obtain(options,"transportsLog",!0)&&lggr.transport()})}();
