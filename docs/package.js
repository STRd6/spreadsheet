(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, publicAPI, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = self;

  defaultEntryPoint = "main";

  circularGuard = {};

  rootModule = {
    path: ""
  };

  loadPath = function(parentModule, pkg, path) {
    var cache, localPath, module, normalizedPath;
    if (startsWith(path, '/')) {
      localPath = [];
    } else {
      localPath = parentModule.path.split(fileSeparator);
    }
    normalizedPath = normalizePath(path, localPath);
    cache = cacheFor(pkg);
    if (module = cache[normalizedPath]) {
      if (module === circularGuard) {
        throw "Circular dependency detected when requiring " + normalizedPath;
      }
    } else {
      cache[normalizedPath] = circularGuard;
      try {
        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);
      } finally {
        if (cache[normalizedPath] === circularGuard) {
          delete cache[normalizedPath];
        }
      }
    }
    return module.exports;
  };

  normalizePath = function(path, base) {
    var piece, result;
    if (base == null) {
      base = [];
    }
    base = base.concat(path.split(fileSeparator));
    result = [];
    while (base.length) {
      switch (piece = base.shift()) {
        case "..":
          result.pop();
          break;
        case "":
        case ".":
          break;
        default:
          result.push(piece);
      }
    }
    return result.join(fileSeparator);
  };

  loadPackage = function(pkg) {
    var path;
    path = pkg.entryPoint || defaultEntryPoint;
    return loadPath(rootModule, pkg, path);
  };

  loadModule = function(pkg, path) {
    var args, content, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    if ((content = file.content) == null) {
      throw "Malformed package. No content for file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(content, pkg, path);
    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);
    module = {
      path: dirname,
      exports: {}
    };
    context = {
      require: generateRequireFn(pkg, module),
      global: global,
      module: module,
      exports: module.exports,
      PACKAGE: pkg,
      __filename: path,
      __dirname: dirname
    };
    args = Object.keys(context);
    values = args.map(function(name) {
      return context[name];
    });
    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);
    return module;
  };

  isPackage = function(path) {
    if (!(startsWith(path, fileSeparator) || startsWith(path, "." + fileSeparator) || startsWith(path, ".." + fileSeparator))) {
      return path.split(fileSeparator)[0];
    } else {
      return false;
    }
  };

  generateRequireFn = function(pkg, module) {
    var fn;
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    fn = function(path) {
      var otherPackage;
      if (typeof path === "object") {
        return loadPackage(path);
      } else if (isPackage(path)) {
        if (!(otherPackage = pkg.dependencies[path])) {
          throw "Package: " + path + " not found.";
        }
        if (otherPackage.name == null) {
          otherPackage.name = path;
        }
        if (otherPackage.scopedName == null) {
          otherPackage.scopedName = "" + pkg.scopedName + ":" + path;
        }
        return loadPackage(otherPackage);
      } else {
        return loadPath(module, pkg, path);
      }
    };
    fn.packageWrapper = publicAPI.packageWrapper;
    fn.executePackageWrapper = publicAPI.executePackageWrapper;
    return fn;
  };

  publicAPI = {
    generateFor: generateRequireFn,
    packageWrapper: function(pkg, code) {
      return ";(function(PACKAGE) {\n  var src = " + (JSON.stringify(PACKAGE.distribution.main.content)) + ";\n  var Require = new Function(\"PACKAGE\", \"return \" + src)({distribution: {main: {content: src}}});\n  var require = Require.generateFor(PACKAGE);\n  " + code + ";\n})(" + (JSON.stringify(pkg, null, 2)) + ");";
    },
    executePackageWrapper: function(pkg) {
      return publicAPI.packageWrapper(pkg, "require('./" + pkg.entryPoint + "')");
    },
    loadPackage: loadPackage
  };

  if (typeof exports !== "undefined" && exports !== null) {
    module.exports = publicAPI;
  } else {
    global.Require = publicAPI;
  }

  startsWith = function(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
  };

  cacheFor = function(pkg) {
    if (pkg.cache) {
      return pkg.cache;
    }
    Object.defineProperty(pkg, "cache", {
      value: {}
    });
    return pkg.cache;
  };

  annotateSourceURL = function(program, pkg, path) {
    return "" + program + "\n//# sourceURL=" + pkg.scopedName + "/" + path;
  };

  return publicAPI;

}).call(this);

  window.require = Require.generateFor(pkg);
})({
  "source": {
    "README.md": {
      "path": "README.md",
      "content": "# spreadsheet\nA programmable spreadsheet in the browser...\n",
      "mode": "100644",
      "type": "blob"
    },
    "main.coffee": {
      "path": "main.coffee",
      "content": "# Just pasted this here as a placeholder\n# TODO: Make this work as a whimsy.space app and a standalone spreadsheet app\n\nFileIO = require \"../os/file-io\"\nModel = require \"model\"\n\nmodule.exports = ->\n  {ContextMenu, MenuBar, Modal, Observable, Progress, Table, Util:{parseMenu}, Window} = system.UI\n\n  system.Achievement.unlock \"Microsoft Access 97\"\n\n  sourceData = []\n\n  headers = [\"id\", \"name\", \"color\"]\n\n  RowModel = (datum) ->\n    Model(datum).attrObservable headers...\n\n  models = sourceData.map RowModel\n\n  InputTemplate = require \"../templates/input\"\n  RowElement = (datum) ->\n    tr = document.createElement \"tr\"\n    types = [\n      \"number\"\n      \"text\"\n      \"color\"\n    ]\n\n    headers.forEach (key, i) ->\n      td = document.createElement \"td\"\n      td.appendChild InputTemplate\n        value: datum[key]\n        type: types[i]\n\n      tr.appendChild td\n\n    return tr\n\n  {element} = tableView = Table {\n    data: models\n    RowElement: RowElement\n    headers: headers\n  }\n\n  handlers = Model().include(FileIO).extend\n    loadFile: (blob) ->\n      blob.readAsJSON()\n      .then (json) ->\n        console.log json\n\n        unless Array.isArray json\n          throw new Error \"Data must be an array\"\n\n        sourceData = json\n        # Update models data\n        models.splice(0, models.length, sourceData.map(RowModel)...)\n\n        # Re-render\n        tableView.render()\n\n    newFile: -> # TODO\n    saveData: ->\n      Promise.resolve new Blob [JSON.stringify(sourceData)],\n        type: \"application/json\"\n\n    about: ->\n      Modal.alert \"Spreadsheet v0.0.1 by Daniel X Moore\"\n    insertRow: ->\n      # TODO: Data template\n      datum =\n        id: 0\n        name: \"new\"\n        color: \"#FF00FF\"\n\n      sourceData.push datum\n      models.push RowModel(datum)\n\n      # Re-render\n      tableView.render()\n    exit: ->\n      windowView.element.remove()\n\n  menuBar = MenuBar\n    items: parseMenu \"\"\"\n      [F]ile\n        [N]ew\n        [O]pen\n        [S]ave\n        Save [A]s\n        -\n        E[x]it\n      Insert\n        Row -> insertRow\n      Help\n        About\n    \"\"\"\n    handlers: handlers\n\n  windowView = Window\n    title: \"MS Access 97 [DEMO VERSION]\"\n    content: element\n    menuBar: menuBar.element\n    width: 640\n    height: 480\n\n  windowView.loadFile = handlers.loadFile\n\n  return windowView\n",
      "mode": "100644"
    }
  },
  "distribution": {
    "main": {
      "path": "main",
      "content": "(function() {\n  var FileIO, Model,\n    __slice = [].slice;\n\n  FileIO = require(\"../os/file-io\");\n\n  Model = require(\"model\");\n\n  module.exports = function() {\n    var ContextMenu, InputTemplate, MenuBar, Modal, Observable, Progress, RowElement, RowModel, Table, Window, element, handlers, headers, menuBar, models, parseMenu, sourceData, tableView, windowView, _ref, _ref1;\n    _ref = system.UI, ContextMenu = _ref.ContextMenu, MenuBar = _ref.MenuBar, Modal = _ref.Modal, Observable = _ref.Observable, Progress = _ref.Progress, Table = _ref.Table, (_ref1 = _ref.Util, parseMenu = _ref1.parseMenu), Window = _ref.Window;\n    system.Achievement.unlock(\"Microsoft Access 97\");\n    sourceData = [];\n    headers = [\"id\", \"name\", \"color\"];\n    RowModel = function(datum) {\n      var _ref2;\n      return (_ref2 = Model(datum)).attrObservable.apply(_ref2, headers);\n    };\n    models = sourceData.map(RowModel);\n    InputTemplate = require(\"../templates/input\");\n    RowElement = function(datum) {\n      var tr, types;\n      tr = document.createElement(\"tr\");\n      types = [\"number\", \"text\", \"color\"];\n      headers.forEach(function(key, i) {\n        var td;\n        td = document.createElement(\"td\");\n        td.appendChild(InputTemplate({\n          value: datum[key],\n          type: types[i]\n        }));\n        return tr.appendChild(td);\n      });\n      return tr;\n    };\n    element = (tableView = Table({\n      data: models,\n      RowElement: RowElement,\n      headers: headers\n    })).element;\n    handlers = Model().include(FileIO).extend({\n      loadFile: function(blob) {\n        return blob.readAsJSON().then(function(json) {\n          console.log(json);\n          if (!Array.isArray(json)) {\n            throw new Error(\"Data must be an array\");\n          }\n          sourceData = json;\n          models.splice.apply(models, [0, models.length].concat(__slice.call(sourceData.map(RowModel))));\n          return tableView.render();\n        });\n      },\n      newFile: function() {},\n      saveData: function() {\n        return Promise.resolve(new Blob([JSON.stringify(sourceData)], {\n          type: \"application/json\"\n        }));\n      },\n      about: function() {\n        return Modal.alert(\"Spreadsheet v0.0.1 by Daniel X Moore\");\n      },\n      insertRow: function() {\n        var datum;\n        datum = {\n          id: 0,\n          name: \"new\",\n          color: \"#FF00FF\"\n        };\n        sourceData.push(datum);\n        models.push(RowModel(datum));\n        return tableView.render();\n      },\n      exit: function() {\n        return windowView.element.remove();\n      }\n    });\n    menuBar = MenuBar({\n      items: parseMenu(\"[F]ile\\n  [N]ew\\n  [O]pen\\n  [S]ave\\n  Save [A]s\\n  -\\n  E[x]it\\nInsert\\n  Row -> insertRow\\nHelp\\n  About\"),\n      handlers: handlers\n    });\n    windowView = Window({\n      title: \"MS Access 97 [DEMO VERSION]\",\n      content: element,\n      menuBar: menuBar.element,\n      width: 640,\n      height: 480\n    });\n    windowView.loadFile = handlers.loadFile;\n    return windowView;\n  };\n\n}).call(this);\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "https://danielx.net/editor/"
  },
  "config": {},
  "entryPoint": "main",
  "repository": {
    "branch": "master",
    "default_branch": "master",
    "full_name": "STRd6/spreadsheet",
    "homepage": null,
    "description": "A programmable spreadsheet in the browser...",
    "html_url": "https://github.com/STRd6/spreadsheet",
    "url": "https://api.github.com/repos/STRd6/spreadsheet",
    "publishBranch": "gh-pages"
  },
  "dependencies": {}
});