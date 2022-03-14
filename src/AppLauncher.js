/* globals Wsh: false */

(function () {
  if (Wsh && Wsh.AppLauncher) return;

  /**
   * The WSH (Windows Script Host) CLI that launches apps according to the schema defined in a JSON file.
   *
   * @namespace AppLauncher
   * @memberof Wsh
   * @requires {@link https://github.com/tuckn/WshAppLauncher|tuckn/WshBasicPackage}
   */
  Wsh.AppLauncher = {};

  // Shorthands
  var util = Wsh.Util;
  var child_process = Wsh.ChildProcess;
  var logger = Wsh.Logger;

  var objAdd = Object.assign;
  var insp = util.inspect;
  var obtain = util.obtainPropVal;
  var parseTmp = util.parseTemplateLiteral;
  var parseDate = util.parseDateLiteral;
  var hasContent = util.hasContent;
  var includes = util.includes;
  var isArray = util.isArray;
  var isSolidString = util.isSolidString;
  var isPlainObject = util.isPlainObject;

  var apL = Wsh.AppLauncher; // Shorthand

  /** @constant {string} */
  var MODULE_TITLE = 'WshAppLauncher/AppLauncher.js';

  var throwErrNonStr = function (functionName, errVal) {
    util.throwTypeError('string', MODULE_TITLE, functionName, errVal);
  };

  var throwErrNonObject = function (functionName, errVal) {
    util.throwTypeError('object', MODULE_TITLE, functionName, errVal);
  };

  var throwValErr = function (valName, functionName, errVal) {
    util.throwValueError(valName, MODULE_TITLE, functionName, errVal);
  };

  // apL.launchAppUsingLog {{{
  /**
   * Launches the app.
   *
   * @example
   * var apL = Wsh.AppLauncher; // Shorthand
   *
   * apL.launchAppUsingLog('C:\\Windows\\System32\\net.exe', ['use'], {
   *   runsAdmin: true,
   *   winStyle: 'nonActive',
   *   logger: 'info/console' // See https://github.com/tuckn/WshLogger
   * });
   * @function launchAppUsingLog
   * @memberof Wsh.AppLauncher
   * @param {string} app - The executable file path or the command of CMD.
   * @param {string[]} [args] - The Array of arguments.
   * @param {object} [options] - Optional parameters.
   * @param {boolean} [options.shell=false] - Wrap with CMD.EXE
   * @param {(number|string)} [options.winStyle='activeDef'] - See {@link https://docs.tuckn.net/WshUtil/Wsh.Constants.windowStyles.html|Wsh.Constants.windowStyles}.
   * @param {(boolean|undefined)} [options.runsAdmin] - true: as Admin, false: as User
   * @param {boolean} [options.isDryRun=false] - No execute, returns the string of command.
   * @param {(Logger|string|object)} [options.logger] - The Logger instance or create options. See {@link https://docs.tuckn.net/WshLogger/Wsh.Logger.html#.create|Wsh.Logger.create}.
   * @param {boolean} [options.transportsLog=true] - Outputs Wsh.Logger logs after connecting. See {@link https://docs.tuckn.net/WshLogger/Wsh.Logger.html#.this.transport|Wsh.Logger.transport}.
   * @returns {void}
   */
  apL.launchAppUsingLog = function (app, args, options) {
    var FN = 'apL.launchAppUsingLog';

    var loggerObj = obtain(options, 'logger', {});
    var lggr = logger.create(loggerObj);
    lggr.info('Start the function ' + FN);

    if (!isSolidString(app)) throwErrNonStr(FN, app);

    // parameters
    var shell = obtain(options, 'shell', false);
    var winStyle = obtain(options, 'winStyle', 'activeDef');
    var runsAdmin = obtain(options, 'runsAdmin');
    var isDryRun = obtain(options, 'isDryRun', false);

    lggr.info('app: "' + app + '"');
    lggr.info('args: [' + (args ? args : '') + ']');
    lggr.info('shell: ' + shell);
    lggr.info('winStyle: ' + winStyle);
    lggr.info('runsAdmin: ' + runsAdmin);
    if (isDryRun) lggr.info('isDryRun: ' + isDryRun);

    var dryLog = child_process.execFile(app, args, options);
    if (isDryRun) lggr.info(dryLog);

    lggr.info('Finished the function ' + FN);
    var transportsLog = obtain(options, 'transportsLog', true);
    if (transportsLog) lggr.transport();

    return;
  }; // }}}

  // apL.launchAppsUsingSchema {{{
  /**
   * @typedef {object} typeSchemaAppLauncher
   * @property {string} [description]
   * @property {object} [components]
   * @property {...typeSchemaAppLauncherTask} tasks
   */

  /**
   * @typedef {object} typeSchemaAppLauncherTask
   * @property {string} [description] - The task description.
   * @property {boolean} [available=true] - If specifying false, Skips the task.
   * @property {string} app - The executable file path or the command of CMD.
   * @property {string[]} [args] - The Array of arguments.
   * @property {boolean} [shell=false] - Wrap with CMD.EXE
   * @property {(number|string)} [winStyle='activeDef'] - See {@link https://docs.tuckn.net/WshUtil/Wsh.Constants.windowStyles.html|Wsh.Constants.windowStyles}.
   * @property {(boolean|undefined)} [runsAdmin] - true: as Admin, false: as User
   */

  /**
   * Backs up the directories.
   *
   * @example
   * var apL = Wsh.AppLauncher; // Shorthand
   * var schema = {
   *   description: 'Example Schema WshAppLauncher',
   *   components: {
   *     binDir: 'D:\\MyApps',
   *     etcDir: 'D:\\MyConfs',
   *     wmLeftPath: null,
   *     wmRightPath: null
   *   },
   *   tasks: {
   *     'main:Claunch': {
   *       app: '${binDir}\\CLaunch\\ClAdmin.exe'
   *     },
   *     'main:AutoHotkey': {
   *       app: '${binDir}\\AutoHotkey\\AutoHotkeyU64.exe',
   *       args: ['${etcDir}\\MyHotKey.ahk'],
   *       runsAdmin: true
   *     },
   *     'main:FreeCommander': {
   *       app: '${binDir}\\FreeCommander\\FreeCommander.exe',
   *       args: ['/N', '/ini=${etcDir}\\FreeCommander.ini'],
   *       winStyle: 'nonActiveMin'
   *     },
   *     'main:mkTmpDir': {
   *       app: 'mkdir',
   *       args: ['R:\\tmp_#{yyyyMMdd}'],
   *       shell: true
   *     },
   *     'dev:cmdAdmin': {
   *       available: false,
   *       app: 'C:\\Windows\\System32\\cmd.exe',
   *       runsAdmin: true
   *     },
   *     'dev:Vim': {
   *       app: '${binDir}\\Vim\\gvim.exe',
   *       args: ['-N', '-u', '${etcDir}\\_vimrc', '-U', '${etcDir}\\_gvimrc']
   *     },
   *     'app:WinMerge': {
   *       app: '${binDir}\\WinMerge\\WinMergePortable.exe',
   *       args: ['${wmLeftPath}', '${wmRightPath}'],
   *       winStyle: 'activeMax'
   *     }
   *   }
   * };
   *
   * apL.launchAppsUsingSchema(schema, 'main:*', {
   *   logger: 'info/console',
   * });
   * // Only process appLog:current. appLog:lastMonth is not processed because available is false.
   * @function launchAppsUsingSchema
   * @memberof Wsh.AppLauncher
   * @param {typeSchemaAppLauncher} schema
   * @param {string} [taskName] - The task name to launch.
   * @param {object} [options] - Optional parameters.
   * @param {object} [options.overwrites] - Ex. { anyVal1: 'myP@ss', anyVal2: 'p_w_d' }
   * @param {(string|Object)} [options.logger] - See options of {@link Wsh.Logger.create}
   * @param {boolean} [options.isDryRun=false] - No execute, returns the string of command.
   * @returns {void}
   */
  apL.launchAppsUsingSchema = function (schema, taskName, options) {
    var FN = 'apL.launchAppsUsingSchema';
    if (!isPlainObject(schema)) throwErrNonObject(FN, schema);
    if (!isSolidString(taskName)) throwErrNonStr(FN, taskName);

    var loggerObj = obtain(options, 'logger', {});
    var lggr = logger.create(loggerObj);
    lggr.info('Start function ' + FN);
    lggr.info('taskName: "' + taskName + '"');

    var tasks = schema.tasks; // Shorthand
    var taskNames = Object.keys(tasks);
    var regNameMatcher;
    if (includes(taskName, '*')) {
      regNameMatcher = new RegExp(taskName.replace(/\*/g, '.*'));
    } else {
      regNameMatcher = new RegExp(taskName);
    }
    var filteredNames = taskNames.filter(function (taskName) {
      return regNameMatcher.test(taskName);
    });
    lggr.info('matched tasks: ' + filteredNames.length);

    var vals = schema.components; // Shorthand

    // Set option values in keys storing null.
    if (hasContent(options.overwrites)) {
      Object.keys(vals).forEach(function (key) {
        if (vals[key] !== null) return;

        Object.keys(options.overwrites).some(function (writeKey) {
          if (key === writeKey) {
            vals[key] = options.overwrites[writeKey];
            return true;
          }
        });
      });
    }

    var isDryRun = obtain(options, 'isDryRun', false);
    if (isDryRun) lggr.info('dry-run [' + FN + ']:');

    filteredNames.forEach(function (taskName) {
      lggr.info('Start the task: ' + taskName);

      if (tasks[taskName].available === false) {
        lggr.info('available: false => Skip this task');
        return;
      }

      var app = parseDate(parseTmp(tasks[taskName].app || '', vals));

      var args = [];
      if (isArray(tasks[taskName].args)) {
        args = tasks[taskName].args.map(function (arg) {
          return parseDate(parseTmp(arg || '', vals));
        });
      }

      var shell = obtain(tasks[taskName], 'shell', false);
      var winStyle = parseTmp(tasks[taskName].winStyle || '', vals);
      var runsAdmin = obtain(tasks[taskName], 'runsAdmin');

      try {
        apL.launchAppUsingLog(
          app,
          args,
          objAdd({}, options, {
            shell: shell,
            winStyle: winStyle,
            runsAdmin: runsAdmin,
            logger: lggr,
            transportsLog: false,
            throws: false
          })
        );
      } catch (e) { // It does not stop with an error.
        lggr.error(insp(e));
      }
    });

    lggr.info('Finished function ' + FN);
    var transportsLog = obtain(options, 'transportsLog', true);
    if (transportsLog) lggr.transport();

    return;
  }; // }}}
})();

// vim:set foldmethod=marker commentstring=//%s :
