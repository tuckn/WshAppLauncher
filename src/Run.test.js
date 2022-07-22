/* globals Wsh: false */
/* globals process: false */
/* globals __filename: false */
/* globals __dirname: false */

/* globals describe: false */
/* globals test: false */
/* globals expect: false */

// Shorthand
var util = Wsh.Util;
var path = Wsh.Path;
var os = Wsh.OS;
var fs = Wsh.FileSystem;
var fse = Wsh.FileSystemExtra;
var child_process = Wsh.ChildProcess;

var objAdd = Object.assign;
var includes = util.includes;
var parseTmp = util.parseTemplateLiteral;
var parseDate = util.parseDateLiteral;
var obtain = util.obtainPropVal;
var isArray = util.isArray;
var srrd = os.surroundCmdArg;
var CMD = os.exefiles.cmd;
var CSCRIPT = os.exefiles.cscript;
var NOTEPAD = os.exefiles.notepad;
var execSync = child_process.execSync;

var testRun;
if (includes(process.execArgv, '//job:test:dist:Run')) {
  testRun = srrd(CSCRIPT) + ' ' + srrd(path.join(__dirname, 'dist', 'Run.wsf')) + ' //nologo';
} else {
  testRun = srrd(CSCRIPT) + ' ' + srrd(__filename) + ' //nologo //job:test:src:Run';
}

describe('Run', function () {
  var testName;

  testName = 'launchApp_help';
  test(testName, function () {
    var args = ['launchApp', '-h'];
    var retObj = execSync(testRun + ' ' + args.join(' '));
    // console.dir(retObj);
    expect(retObj.error).toBeFalsy();
    expect(retObj.stderr).toBe('');

    var expC = expect(retObj.stdout).toContain; // Shorthand
    expC('Usage: launchApp <app> [args...] [options]');
    expC('The command to launch an application');
    expC('Options:');
    expC('  -V, --version          Output the version number');
    expC('  -S, --shell            Wrap with CMD.EXE. (default: false)');
    // ...
    expC('  -h, --help             Output usage information');
  });

  testName = 'launchApp_DefOp_dryRun';
  test(testName, function () {
    var app = NOTEPAD;
    var args = ['arg1', 'arg2', 'arg3'];
    var cliArgs = [
      'launchApp',
      srrd(app),
      args.join(' '),
      '--dry-run'
    ];
    var retObj = execSync(testRun + ' ' + cliArgs.join(' '));
    // console.dir(retObj);
    expect(retObj.error).toBeFalsy();
    expect(retObj.stderr).toBe('');

    var expC = expect(retObj.stdout).toContain; // Shorthand
    expC('Start the function apL.launchAppUsingLog');
    expC('command: ' + srrd(app) + ' ' + os.joinCmdArgs(args));
    expC('shell: false');
    expC('winStyle: activeDef');
    expC('runsAdmin: undefined');
    expC('isDryRun: true');
    expC('dry-run [_shRun]: ' + app + ' arg1 arg2 arg3');
    expC('Finished the function apL.launchAppUsingLog');
  });

  testName = 'launchApp_Op1_dryRun';
  test(testName, function () {
    var app = NOTEPAD;
    var cliArgs = [
      'launchApp',
      srrd(app),
      '--shell',
      '--winStyle nonActiveMin',
      '--dry-run'
    ];
    var retObj = execSync(testRun + ' ' + cliArgs.join(' '));
    // console.dir(retObj);
    expect(retObj.error).toBeFalsy();
    expect(retObj.stderr).toBe('');

    var expC = expect(retObj.stdout).toContain; // Shorthand
    expC('Start the function apL.launchAppUsingLog');
    expC('command: ' + srrd(app));
    expC('shell: true');
    expC('winStyle: nonActiveMin');
    expC('runsAdmin: undefined');
    expC('isDryRun: true');
    expC('dry-run [_shRun]: ' + CMD + ' /S /C"' + app + '"');
    expC('Finished the function apL.launchAppUsingLog');
  });

  testName = 'schemaLaunch_help_noArg';
  test(testName, function () {
    var cliArgs = ['schemaLaunch'];
    var retObj = execSync(testRun + ' ' + cliArgs.join(' '));
    // console.dir(retObj);
    expect(retObj.error).toBeTruthy();
    expect(retObj.stdout).toBe(''); // Stdout

    var expC = expect(retObj.stderr).toContain; // Shorthand
    expC('Usage: schemaLaunch <taskName> [overwriteKey:val...] [options]');
    expC('The command to launch applications defined with a schema JSON');
    expC('Options:');
    expC('  -V, --version          Output the version number');
    // ...
    expC('  -h, --help             Output usage information');
  });

  testName = 'schemaLaunch_help';
  test(testName, function () {
    var args = ['schemaLaunch', '-h'];
    var retObj = execSync(testRun + ' ' + args.join(' '));
    // console.dir(retObj);
    expect(retObj.error).toBeFalsy();
    expect(retObj.stderr).toBe('');

    var expC = expect(retObj.stdout).toContain; // Shorthand
    expC('Usage: schemaLaunch <taskName> [overwriteKey:val...] [options]');
    expC('The command to launch applications defined with a schema JSON');
    expC('Options:');
    expC('  -V, --version          Output the version number');
    // ...
    expC('  -h, --help             Output usage information');
  });

  var schema = {
    appLauncherSchema: {
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
    }
  };

  testName = 'schemaLaunch_dryRun';
  test(testName, function () {
    var tmpDir = os.makeTmpPath() + '_' + testName;
    var wshDir = path.join(tmpDir, '.wsh');
    var schemaJson = path.join(wshDir, 'settings.json');

    fse.ensureDirSync(wshDir);
    fse.writeJsonSync(schemaJson, schema);

    var taskName = '*';
    var args = ['schemaLaunch', taskName, '--dir-path', wshDir, '--dry-run'];
    var retObj = execSync(testRun + ' ' + args.join(' '));
    // console.dir(retObj);
    expect(retObj.error).toBeFalsy();
    expect(retObj.stderr).toBe('');

    var scm = schema.appLauncherSchema;
    var expC = expect(retObj.stdout).toContain; // Shorthand
    expC('Start function apL.launchAppsUsingSchema');
    expC('taskName: "' + taskName + '"');
    expC('matched tasks: ' + Object.keys(scm.tasks).length);
    expC('dry-run [apL.launchAppsUsingSchema]:');
    expC('Start the function apL.launchAppUsingLog');

    (function () {
      var task = scm.tasks['main:Claunch'];
      var app = parseDate(parseTmp(task.app, scm.components));

      var args = [];
      if (isArray(task.args)) {
        args = task.args.map(function (arg) {
          return parseDate(parseTmp(arg || '', scm.components));
        });
      }

      expC('Start the task: main:Claunch');
      expC('command: ' + srrd(app) + ' ' + os.joinCmdArgs(args));
      expC('shell: ' + obtain(task, 'shell', false));
      expC('winStyle: ' + parseTmp(task.winStyle || '', scm.components));
      expC('runsAdmin: ' + obtain(task, 'runsAdmin'));
      expC('isDryRun: true');
    })();

    // @TODO more test

    // app:WinMerge
    (function () {
      var task = scm.tasks['app:WinMerge'];
      var app = parseDate(parseTmp(task.app, scm.components));
      var args = [];
      if (isArray(task.args)) {
        args = task.args.map(function (arg) {
          return parseDate(parseTmp(arg || '', scm.components));
        });
      }

      expC('Start the task: app:WinMerge');
      expC('command: ' + srrd(app) + ' ' + os.joinCmdArgs(args));
      expC('shell: ' + obtain(task, 'shell', false));
      expC('winStyle: ' + parseTmp(task.winStyle || '', scm.components));
      expC('runsAdmin: ' + obtain(task, 'runsAdmin'));
      expC('isDryRun: true');
      expC('dry-run [_shRun]: ' + app + ' ' + args.join(' '));
    })();

    expC('Finished function apL.launchAppsUsingSchema');

    // Cleans
    fse.removeSync(tmpDir);
    expect(fs.existsSync(tmpDir)).toBe(false);
  });

  testName = 'schemaLaunch_dryRun_task';
  test(testName, function () {
    var tmpDir = os.makeTmpPath() + '_' + testName;
    var wshDir = path.join(tmpDir, '.wsh');
    var schemaJson = path.join(wshDir, 'settings.json');

    fse.ensureDirSync(wshDir);
    fse.writeJsonSync(schemaJson, schema);

    var taskName = 'app:WinMerge';
    var wmLeftPath = 'D:\\text-before.txt';
    var wmRightPath = 'D:\\text-after.txt';
    var args = [
      'schemaLaunch',
      taskName,
      'wmLeftPath:"D:\\text-before.txt"',
      'wmRightPath:"D:\\text-after.txt"',
      '--dir-path',
      wshDir,
      '--dry-run'
    ];
    var retObj = execSync(testRun + ' ' + args.join(' '));
    // console.dir(retObj);
    expect(retObj.error).toBeFalsy();
    expect(retObj.stderr).toBe('');

    var scm = schema.appLauncherSchema;
    var expC = expect(retObj.stdout).toContain; // Shorthand
    var expNC = expect(retObj.stdout).not.toContain; // Shorthand
    expC('Start function apL.launchAppsUsingSchema');
    expC('taskName: "' + taskName + '"');
    expC('matched tasks: 1');
    expC('dry-run [apL.launchAppsUsingSchema]:');
    expC('Start the function apL.launchAppUsingLog');

    (function () {
      var task = scm.tasks['main:Claunch'];
      var app = parseDate(parseTmp(task.app, scm.components));

      var args = [];
      if (isArray(task.args)) {
        args = task.args.map(function (arg) {
          return parseDate(parseTmp(arg || '', scm.components));
        });
      }

      expNC('Start the task: main:Claunch');
      expNC('command: ' + srrd(app) + ' ' + os.joinCmdArgs(args));
    })();

    // @TODO more test

    // app:WinMerge
    (function () {
      var task = scm.tasks['app:WinMerge'];
      var app = parseDate(parseTmp(task.app, scm.components));
      var args = [];
      if (isArray(task.args)) {
        args = task.args.map(function (arg) {
          return parseDate(
            parseTmp(arg || '', objAdd({}, scm.components, {
              wmLeftPath: wmLeftPath,
              wmRightPath: wmRightPath
            }))
          );
        });
      }

      expC('Start the task: app:WinMerge');
      expC('command: ' + srrd(app) + ' ' + os.joinCmdArgs(args));
      expC('shell: ' + obtain(task, 'shell', false));
      expC('winStyle: ' + parseTmp(task.winStyle || '', scm.components));
      expC('runsAdmin: ' + obtain(task, 'runsAdmin'));
      expC('isDryRun: true');
      expC('dry-run [_shRun]: ' + app + ' ' + args.join(' '));
    })();

    expC('Finished function apL.launchAppsUsingSchema');

    // Cleans
    fse.removeSync(tmpDir);
    expect(fs.existsSync(tmpDir)).toBe(false);
  });

  testName = 'schemaLaunch_dryRun_defJson';
  test(testName, function () {
    var taskName = '*';
    var args = ['schemaLaunch', taskName, '--dry-run'];
    var retObj = execSync(testRun + ' ' + args.join(' '));
    // console.dir(retObj);
    expect(retObj.error).toBeFalsy();
    expect(retObj.stderr).toBe('');

    var scm = schema.appLauncherSchema;
    var expC = expect(retObj.stdout).toContain; // Shorthand
    expC('Start function apL.launchAppsUsingSchema');
    expC('taskName: "' + taskName + '"');
    // expC('matched tasks: ' + Object.keys(scm.tasks).length);
    expC('dry-run [apL.launchAppsUsingSchema]:');
    expC('Start the function apL.launchAppUsingLog');

    (function () {
      var task = scm.tasks['main:Claunch'];
      var app = parseDate(parseTmp(task.app, scm.components));

      var args = [];
      if (isArray(task.args)) {
        args = task.args.map(function (arg) {
          return parseDate(parseTmp(arg || '', scm.components));
        });
      }

      expC('Start the task: main:Claunch');
      expC('command: ' + srrd(app) + ' ' + os.joinCmdArgs(args));
      expC('shell: ' + obtain(task, 'shell', false));
      expC('winStyle: ' + parseTmp(task.winStyle || '', scm.components));
      expC('runsAdmin: ' + obtain(task, 'runsAdmin'));
      expC('isDryRun: true');
    })();

    // @TODO more test

    // app:WinMerge
    (function () {
      var task = scm.tasks['app:WinMerge'];
      var app = parseDate(parseTmp(task.app, scm.components));
      var args = [];
      if (isArray(task.args)) {
        args = task.args.map(function (arg) {
          return parseDate(parseTmp(arg || '', scm.components));
        });
      }

      expC('Start the task: app:WinMerge');
      expC('command: ' + srrd(app) + ' ' + os.joinCmdArgs(args));
      expC('shell: ' + obtain(task, 'shell', false));
      expC('winStyle: ' + parseTmp(task.winStyle || '', scm.components));
      expC('runsAdmin: ' + obtain(task, 'runsAdmin'));
      expC('isDryRun: true');
      expC('dry-run [_shRun]: ' + app + ' ' + args.join(' '));
    })();

    expC('Finished function apL.launchAppsUsingSchema');
  });
});
