var fs = require('fs'),
    structure = 'Tests/JavaScript/',
    currentWorkingDirectory = process.cwd(),
    absoluteConfigurationDirectory = getCurrentWorkingDirectory(),
    flow3RootPath = absoluteConfigurationDirectory + '/../../..';

function getCurrentWorkingDirectory() {
    var configAbsolutePath = process.argv[3];
    if (!/^\//.test(configAbsolutePath)) {
        configAbsolutePath = process.cwd() + '/' + configAbsolutePath;
    }
    return configAbsolutePath.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
}

function getPathFromArgument() {
    var path = flow3RootPath + '/Packages/Application/';
    if (process.argv[4] && process.argv[4] !== '-') {
        if (process.argv[4].substr(0, 1) === '/') {
            path = process.argv[4];
        } else {
            path = currentWorkingDirectory + '/' + process.argv[4];
        }
    }
    return path;
}

function getBackwardStructure(path) {
    var index = path.lastIndexOf(structure + 'Unit/');
    if (index === -1) {
        return false;
    }
    return path.substr(0, index);
}

function javascriptFilesExistInPath(path) {
    var directoryFiles = fs.readdirSync(path);
    for (var i in directoryFiles) {
        try {
            var subPath = path + '/' + directoryFiles[i],
                stats = fs.statSync(subPath);
            if (stats.isDirectory()) {
                return javascriptFilesExistInPath(subPath);
            } else if (/\.js$/i.test(subPath)) {
                return true;
            }
        } catch (e) {
        }
    }
    return false;
}

function injectIncludesInFiles(files, path) {
    var patternPrefixes = [path + '/All', path + '/Unit'];
    for (var i in patternPrefixes) {
        if (javascriptFilesExistInPath(patternPrefixes[i])) {
            files.push({
                pattern: patternPrefixes[i] + '/**/*.js',
                included: false
            });
        }
    }
}

function injectPackagesInFiles(files, path) {
    var directoryFiles = fs.readdirSync(path);
    for (var i in directoryFiles) {
        try {
            var subDirectoryPath = path + '/' + directoryFiles[i],
                stats = fs.statSync(subDirectoryPath);
            if (stats.isDirectory()) {
                var packagePath = subDirectoryPath + '/' + structure;
                if (javascriptFilesExistInPath(packagePath + 'Unit')) {
                    files.push({
                        pattern: packagePath + 'Unit/**/*.js',
                        included: true
                    });
                }
                injectIncludesInFiles(files, packagePath + 'Includes');
            }
        } catch (e) {
        }
    }
}

function buildFilesPatterns() {
    var path = getPathFromArgument(),
        files = [absoluteConfigurationDirectory + '/loader.js'];
    try {
        var stats = fs.statSync(path);
        var backwardStructure = getBackwardStructure(path);
        if (stats.isFile()) {
            files.push({
                pattern: path,
                included: false
            });
            if (backwardStructure !== false) {
                injectIncludesInFiles(files, backwardStructure + structure + 'Includes');
            }
        } else if (stats.isDirectory()) {
            if (backwardStructure !== false) {
                files.push({
                    pattern: path + '**/*.js',
                    included: true
                });
                injectIncludesInFiles(files, backwardStructure + structure + 'Includes');
            } else {
                injectPackagesInFiles(files, path);
            }
        } else {
            console.error("'" + path + "' must be a file or a directory");
            process.exit(1);
        }
    } catch (e) {
        console.error("'" + path + "' do not exists.");
        process.exit(1);
    }
    return files;
}

function buildBrowsersFromArguments() {
    var browsers = [],
        argumentsCount = process.argv.length;
    if (argumentsCount > 5) {
        for (var i = 5; i < argumentsCount; i++) {
            // TODO: Should we check the browser here or let karma do it?
            browsers.push(process.argv[i]);
        }
    } else {
        browsers.push('PhantomJS');
    }
    return browsers;
}

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'requirejs'],


        // list of files / patterns to load in the browser
        files: buildFilesPatterns(),


        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: buildBrowsersFromArguments(),


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultanous
        concurrency: Infinity
    });
};