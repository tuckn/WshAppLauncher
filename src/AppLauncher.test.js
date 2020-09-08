/* globals Wsh: false */
/* globals __filename: false */

/* globals describe: false */
/* globals test: false */
/* globals expect: false */

// Shorthand
var util = Wsh.Util;
var path = Wsh.Path;
var os = Wsh.OS;
var fs = Wsh.FileSystem;
var fse = Wsh.FileSystemExtra;
var logger = Wsh.Logger;
var apL = Wsh.AppLauncher;

var parseTmp = util.parseTemplateLiteral;
var parseDate = util.parseDateLiteral;
var obtain = util.obtainPropVal;
var isArray = util.isArray;
var NET = os.exefiles.net;
// var PING = os.exefiles.ping;
var NOTEPAD = os.exefiles.notepad;

// var noneStrVals = [true, false, undefined, null, 0, 1, NaN, Infinity, [], {}];
// var noneObjVals = [true, false, undefined, null, 0, 1, NaN, Infinity, [], ''];
//
// var _cb = function (fn/* , args */) {
//   var args = Array.from(arguments).slice(1);
//   return function () { fn.apply(null, args); };
// };

describe('AppLauncher', function () {
  var testName;

  testName = 'nonOp_dryRun';
  test(testName, function () {
    var dirTest = os.makeTmpPath('_' + testName);
    fse.ensureDirSync(dirTest);

    (function () {
      var logFile = path.join(dirTest, 'test1.log');
      var lggr = logger.create('info/' + logFile);
      var retVal = apL.launchAppUsingLog(NOTEPAD, [__filename], {
        logger: lggr,
        isDryRun: true
      });
      expect(retVal).toBeUndefined();
      // console.dir(retVal); // debug

      var logStr = fs.readFileSync(logFile, { encoding: 'utf8' });
      // console.log(logStr); // debug
      var expC = expect(logStr).toContain; // Shorthand
      expC('Start the function apL.launchAppUsingLog');
      expC('app: "' + NOTEPAD + '"');
      expC('args: [' + __filename + ']');
      expC('shell: false');
      expC('winStyle: activeDef');
      expC('runsAdmin: undefined');
      expC('isDryRun: true');
      expC('dry-run [_shRun]: ' + NOTEPAD + ' ' + __filename);
      expC('Finished the function apL.launchAppUsingLog');
    })();

    // Cleans
    fse.removeSync(dirTest);
    expect(fs.existsSync(dirTest)).toBe(false);
  });

  testName = 'op_nonActiveMin';
  test(testName, function () {
    var dirTest = os.makeTmpPath('_' + testName);
    fse.ensureDirSync(dirTest);

    (function () {
      var logFile = path.join(dirTest, 'test1.log');
      var lggr = logger.create('info/' + logFile);
      var retVal = apL.launchAppUsingLog(NOTEPAD, [__filename], {
        winStyle: 'nonActiveMin',
        logger: lggr
      });
      expect(retVal).toBeUndefined();
      // console.dir(retVal); // debug

      var logStr = fs.readFileSync(logFile, { encoding: 'utf8' });
      // console.log(logStr); // debug
      var expC = expect(logStr).toContain; // Shorthand
      expC('Start the function apL.launchAppUsingLog');
      expC('app: "' + NOTEPAD + '"');
      expC('args: [' + __filename + ']');
      expC('shell: false');
      expC('winStyle: nonActiveMin');
      expC('runsAdmin: undefined');
      expect(logStr).not.toContain('isDryRun: ');
      expC('Finished the function apL.launchAppUsingLog');
    })();

    // Cleans
    fse.removeSync(dirTest);
    expect(fs.existsSync(dirTest)).toBe(false);

    expect('@TODO').toBe('Checked the window');
  });

  testName = 'op_runsAdmin';
  test(testName, function () {
    var dirTest = os.makeTmpPath('_' + testName);
    fse.ensureDirSync(dirTest);

    (function () {
      var logFile = path.join(dirTest, 'test1.log');
      var lggr = logger.create('info/' + logFile);
      var retVal = apL.launchAppUsingLog(NET, ['session'], {
        runsAdmin: true,
        logger: lggr
      });
      expect(retVal).toBeUndefined();
      // console.dir(retVal); // debug

      var logStr = fs.readFileSync(logFile, { encoding: 'utf8' });
      // console.log(logStr); // debug
      var expC = expect(logStr).toContain; // Shorthand
      expC('Start the function apL.launchAppUsingLog');
      expC('app: "' + NET + '"');
      expC('args: [session]');
      expC('shell: false');
      expC('winStyle: activeDef');
      expC('runsAdmin: true');
      expect(logStr).not.toContain('isDryRun: ');
      expC('Finished the function apL.launchAppUsingLog');
    })();

    // Cleans
    fse.removeSync(dirTest);
    expect(fs.existsSync(dirTest)).toBe(false);

    expect('@TODO').toBe('Checked the result');
  });

  var schema = {
    description: 'Example Schema WshAppLauncher',
    components: {
      binDir: 'D:\\MyApps',
      etcDir: 'D:\\MyConfs',
      wmLeftPath: null,
      wmRightPath: null
    },
    tasks: {
      'main:Claunch': {
        app: '${binDir}\\CLaunch\\ClAdmin.exe'
      },
      'main:AutoHotkey': {
        app: '${binDir}\\AutoHotkey\\AutoHotkeyU64.exe',
        args: ['${etcDir}\\MyHotKey.ahk'],
        runsAdmin: true
      },
      'main:FreeCommander': {
        app: '${binDir}\\FreeCommander\\FreeCommander.exe',
        args: ['/N', '/ini=${etcDir}\\FreeCommander.ini'],
        winStyle: 'nonActiveMin'
      },
      'main:mkTmpDir': {
        app: 'mkdir',
        args: ['R:\\tmp_#{yyyyMMdd}'],
        shell: true
      },
      'dev:cmdAdmin': {
        available: false,
        app: 'C:\\Windows\\System32\\cmd.exe',
        runsAdmin: true
      },
      'dev:Vim': {
        app: '${binDir}\\Vim\\gvim.exe',
        args: ['-N', '-u', '${etcDir}\\_vimrc', '-U', '${etcDir}\\_gvimrc']
      },
      'app:WinMerge': {
        app: '${binDir}\\WinMerge\\WinMergePortable.exe',
        args: ['${wmLeftPath}', '${wmRightPath}'],
        winStyle: 'activeMax'
      }
    }
  };

  testName = 'schema_all_dryRun';
  test(testName, function () {
    var dirTest = os.makeTmpPath('_' + testName);
    fse.ensureDirSync(dirTest);

    var logFile = path.join(dirTest, 'test1.log');
    var lggr = logger.create('info/' + logFile);

    var taskName = '*';
    var retVal = apL.launchAppsUsingSchema(schema, taskName, {
      logger: lggr,
      isDryRun: true
    });
    expect(retVal).toBeUndefined();

    var logStr = fs.readFileSync(logFile, { encoding: 'utf8' });
    // console.log(logStr); // debug
    var expC = expect(logStr).toContain; // Shorthand
    expC('Start function apL.launchAppsUsingSchema');
    expC('taskName: "' + taskName + '"');
    expC('matched tasks: ' + Object.keys(schema.tasks).length);
    expC('dry-run [apL.launchAppsUsingSchema]:');
    expC('Start the function apL.launchAppUsingLog');

    // main:Claunch
    (function () {
      var task = schema.tasks['main:Claunch'];
      var app = parseDate(parseTmp(task.app, schema.components));

      var args = [];
      if (isArray(task.args)) {
        args = task.args.map(function (arg) {
          return parseDate(parseTmp(arg || '', schema.components));
        });
      }

      expC('Start the task: main:Claunch');
      expC('app: "' + app + '"');
      expC('args: [' + args + ']');
      expC('shell: ' + obtain(task, 'shell', false));
      expC('winStyle: ' + parseTmp(task.winStyle || '', schema.components));
      expC('runsAdmin: ' + obtain(task, 'runsAdmin'));
      expC('isDryRun: true');
      expC('dry-run [_shRun]: ' + app);
    })();

    // @TODO more test

    // app:WinMerge
    (function () {
      var task = schema.tasks['app:WinMerge'];
      var app = parseDate(parseTmp(task.app, schema.components));
      var args = [];
      if (isArray(task.args)) {
        args = task.args.map(function (arg) {
          return parseDate(parseTmp(arg || '', schema.components));
        });
      }

      expC('Start the task: app:WinMerge');
      expC('app: "' + app + '"');
      expC('args: [' + args + ']');
      expC('shell: ' + obtain(task, 'shell', false));
      expC('winStyle: ' + parseTmp(task.winStyle || '', schema.components));
      expC('runsAdmin: ' + obtain(task, 'runsAdmin'));
      expC('isDryRun: true');
      expC('dry-run [_shRun]: ' + app + ' ' + args.join(' '));
    })();

    expC('Finished function apL.launchAppsUsingSchema');

    // Cleans
    fse.removeSync(dirTest);
    expect(fs.existsSync(dirTest)).toBe(false);
  });

  testName = 'schema_overwrite_dryRun';
  test(testName, function () {
    var dirTest = os.makeTmpPath('_' + testName);
    fse.ensureDirSync(dirTest);

    var logFile = path.join(dirTest, 'test1.log');
    var lggr = logger.create('info/' + logFile);

    var taskName = 'app:WinMerge';
    var wmLeftPath = 'D:\\text-before.txt';
    var wmRightPath = 'D:\\text-after.txt';
    var retVal = apL.launchAppsUsingSchema(schema, taskName, {
      overwrites: { wmLeftPath: wmLeftPath, wmRightPath: wmRightPath },
      logger: lggr,
      isDryRun: true
    });
    expect(retVal).toBeUndefined();

    var logStr = fs.readFileSync(logFile, { encoding: 'utf8' });
    // console.log(logStr); // debug
    var expC = expect(logStr).toContain; // Shorthand
    var expNC = expect(logStr).not.toContain; // Shorthand
    expC('Start function apL.launchAppsUsingSchema');
    expC('taskName: "' + taskName + '"');
    expC('matched tasks: 1');
    expC('dry-run [apL.launchAppsUsingSchema]:');
    expC('Start the function apL.launchAppUsingLog');

    (function () {
      var task = schema.tasks['main:Claunch'];
      var app = parseDate(parseTmp(task.app, schema.components));

      var args = [];
      if (isArray(task.args)) {
        args = task.args.map(function (arg) {
          return parseDate(parseTmp(arg || '', schema.components));
        });
      }

      expNC('Start the task: main:Claunch');
      expNC('app: "' + app + '"');
      expNC('args: [' + args + ']');
    })();

    (function () {
      var task = schema.tasks['app:WinMerge'];
      var app = parseDate(parseTmp(task.app, schema.components));
      var args = [];
      if (isArray(task.args)) {
        args = task.args.map(function (arg) {
          return parseDate(parseTmp(arg || '', schema.components));
        });
      }

      expC('Start the task: app:WinMerge');
      expC('app: "' + app + '"');
      expC('args: [' + args + ']');
      expC('shell: ' + obtain(task, 'shell', false));
      expC('winStyle: ' + parseTmp(task.winStyle || '', schema.components));
      expC('runsAdmin: ' + obtain(task, 'runsAdmin'));
      expC('isDryRun: true');
    })();

    expC('Finished function apL.launchAppsUsingSchema');

    // Cleans
    fse.removeSync(dirTest);
    expect(fs.existsSync(dirTest)).toBe(false);
  });
});
