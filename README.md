# WshAppLauncher

The WSH (Windows Script Host) CLI that launches apps according to the schema defined in a JSON file.

## Operating environment

Works on JScript in Windows.

## Installation

Download this ZIP and unzipping or Use following `git` command.

```console
D:\> git clone https://github.com/tuckn/WshAppLauncher.git
D:\> cd WshAppLauncher
```

Now suppose your directory structure looks like this.

```console
D:\WshAppLauncher\
  ├─ .wsh\
  │ └─ settings.json
  └─ dist\
     ├─ Run.wsf
     └─ bundle.js
```

## Usage

### Write Schema JSON

The JSON default path to load is _%CD%\.wsh\\settings.json_.
See _.\\.wsh\\settings.json_ as example.

Write your app schema in the JSON file, for example,

```json
{
  "appLauncherSchema": {
    "tasks": {
      "main:Firefox": {
        "app": "D:\\MyApps\\Firefox\\FirefoxPortable.exe"
      },
      "main:AutoHotkey": {
        "app": "D:\\MyApps\\AutoHotkey\\AutoHotkeyU64.exe",
        "args": ["D:\\MyConfs\\MyHotKey.ahk"],
        "runsAdmin": true
      }
    }
  }
}
```

You can also define variables into `components` object.
The defined variable can be used as `${valName}` in `tasks`.

```json
{
  "appLauncherSchema": {
    "components": {
      "binDir": "D:\\MyApps",
      "etcDir": "D:\\MyConfs"
    },
    "tasks": {
      "main:Firefox": {
        "app": "${binDir}\\Firefox\\FirefoxPortable.exe"
      },
      "main:AutoHotkey": {
        "app": "${binDir}\\AutoHotkey\\AutoHotkeyU64.exe",
        "args": ["${etcDir}\\MyHotKey.ahk"],
        "runsAdmin": true
      }
    }
  }
}
```

You can also use a date code literal to define `app` and `args`.

```json
{
  "appLauncherSchema": {
    "tasks": {
      "main:mkTmpDir": {
        "app": "mkdir",
        "args": ["R:\\tmp_#{yyyyMMdd}"],
        "shell": true
      }
    }
  }
}
```

See [WshUtil: parseDateLiteral](https://docs.tuckn.net/WshUtil/Wsh.Util.html#.parseDateLiteral) for the literal.

And can also use launching options.

```json
  "appLauncherSchema": {
    "tasks": {
      "dev:cmdAdmin": {
        "available": true,
        "app": "C:\\Windows\\System32\\cmd.exe",
        "winStyle": "nonActiveMin",
        "runsAdmin": true
      }
    }
  }
```

See [WshAppLauncher: typeSchemaAppLauncherTask](https://docs.tuckn.net/WshAppLauncher/docs/global.html#typeSchemaAppLauncherTask) for the options.

### Run with WSH

Run all available tasks.

```console
> cscript .\dist\Run.wsf schemaLaunch *
```

Can specify any tasks to run with property names.

```console
> cscript .\dist\Run.wsf schemaLaunch main:*
```

Show the help.

```console
> cscript .\dist\Run.wsf schemaLaunch --help

Usage: schemaLaunch <taskName> [overwriteKey:val...] [options]

The command to launch applications defined with a schema JSON

Options:
  -V, --version          Output the version number
  -D, --dir-path <path>  The path name where the schema JSON is located. <Directory Path> or "cwd", "portable", "userProfile". Default: "cmd" is "%CD%\.wsh"
  -F, --file-name <name> A JSON file name. (default: "settings.json")
  -E, --encoding <name>  The JSON file encoding. (default: "utf-8")
  -N, --prop-name <name> A property name of the schema object. (default: "appLauncherSchema")
  -L, --logger <val>     <level>/<transportation>. e.g. "warn/popup".  (default: "info/console")
  -R, --dry-run          No execute. Outputs the string of command. (default: false)
  -h, --help             Output usage information
```

See [Wsh.ConfigStore](https://docs.tuckn.net/WshConfigStore/) for the options `--dir-path` and `--file-name`.
and see [Wsh.Logger](https://docs.tuckn.net/WshLogger/) for the options `--logger`.

### Command examples

Use to specify a task name and a schema JSON path.

```console
cscript //nologo .\dist\Run.wsf schemaLaunch main:AutoHotkey --dir-path "C:\My Settings\"
```

## Installation as Module

(1) Create a directory of your WSH project.

```console
D:\> mkdir MyWshProject
D:\> cd MyWshProject
```

(2) Download this ZIP and unzipping or Use following `git` command.

```console
> git clone https://github.com/tuckn/WshAppLauncher.git ./WshModules/WshAppLauncher
or
> git submodule add https://github.com/tuckn/WshAppLauncher.git ./WshModules/WshAppLauncher
```

(3) Include _.\\WshAppLauncher\\dist\\bundle.js_ into your .wsf file.
For Example, if your file structure is

```console
D:\MyWshProject\
├─ Run.wsf
├─ MyScript.js
└─ WshModules\
    └─ WshAppLauncher\
        └─ dist\
          └─ bundle.js
```

The content of above _Run.wsf_ is

```xml
<package>
  <job id = "run">
    <script language="JScript" src="./WshModules/WshAppLauncher/dist/bundle.js"></script>
    <script language="JScript" src="./MyScript.js"></script>
  </job>
</package>
```

I recommend this .wsf file encoding to be UTF-8 [BOM, CRLF].

### Together with another Apps

If you want to use it together with another Apps, install as following

```console
> git clone https://github.com/tuckn/WshBasicPackage.git ./WshModules/WshBasicPackage
> git clone https://github.com/tuckn/WshSmbConnector.git ./WshModules/WshSmbConnector
> git clone https://github.com/tuckn/WshAppLauncher.git ./WshModules/WshAppLauncher
or
> git submodule add https://github.com/tuckn/WshBasicPackage.git ./WshModules/WshBasicPackage
> git submodule add https://github.com/tuckn/WshSmbConnector.git ./WshModules/WshSmbConnector
> git submodule add https://github.com/tuckn/WshAppLauncher.git ./WshModules/WshAppLauncher
```

```xml
<package>
  <job id = "run">
    <script language="JScript" src="./WshModules/WshBasicPackage/dist/bundle.js"></script>
    <script language="JScript" src="./WshModules/WshSmbConnector/dist/module.js"></script>
    <script language="JScript" src="./WshModules/WshAppLauncher/dist/module.js"></script>
    <script language="JScript" src="./MyScript.js"></script>
  </job>
</package>
```

## Usage as Module

Now _.\\MyScript.js_ (JScript ) can use `Wsh.AppLauncher`.

Backing up and logging.

```js
var apL = Wsh.AppLauncher; // Shorthand

apL.launchAppUsingLog('C:\\Windows\\System32\\net.exe', ['use'], {
  runsAdmin: true,
  winStyle: 'nonActive',
  logger: 'info/console' // See https://github.com/tuckn/WshLogger
});
```

With Schema

```js
var apL = Wsh.AppLauncher; // Shorthand

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

apL.launchAppsUsingSchema(schema, 'main:*', {
  logger: 'info/console',
});
// Only process appLog:current. appLog:lastMonth is not processed because available is false.
```

### Dependency Modules

You can also use [tuckn/WshBasicPackage](https://github.com/tuckn/WshBasicPackage) functions in _.\\MyScript.js_ (JScript).

## Documentation

See all specifications [here](https://docs.tuckn.net/WshAppLauncher) and also [WshBasicPackage](https://docs.tuckn.net/WshBasicPackage).

## License

MIT

Copyright (c) 2020 [Tuckn](https://github.com/tuckn)
