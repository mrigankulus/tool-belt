var fs = require('fs');
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});
var history = require('connect-history-api-fallback');
var username = require('username').sync();
var currentUserName = '';

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    currentUserName = setCurrentUserName();

    function setCurrentUserName() {
        var mortarJson = '';

        try {
            mortarJson = require('./mortar.json');
            return mortarJson.userName || username;
        } catch (err) {
            return username;
            grunt.log.writeln('No local mortar file found. Will use global file.');
        }
    }

    function loadTemplate(filename, data) {
        // We have to use a sync method because this function needs to return synchronously
        var templateText = fs.readFileSync(__dirname + '/' + filename, { encoding: 'utf8' });
        return grunt.template.process(templateText, { data: data });
    }

    var projectConfigFile = './project.conf.js',
        tempDir = 'temp',
        moduleDefFile = tempDir + '/moduleDefinition.js',
        projectConfig = require(projectConfigFile),
        concatBanner = loadTemplate('gruntacular/functionOpen.js', {}),
        concatFooter = loadTemplate('gruntacular/functionClose.js', {});

    grunt.initConfig({
        babel: {
            options: {
                sourceMap: true,
            },
            dist: {
                files: {
                    [`${projectConfig.outputDir}/internal.js`]: `${projectConfig.outputDir}/internal.js`
                },
            },
        },
        basePageName: projectConfig.basePageName,
        clean: {
            outputDir: [projectConfig.outputDir, 'temp']
        },
        concat: {
            internal: {
                src: [moduleDefFile].concat(projectConfig.javaScriptFiles.internal).concat(["!**/*Spec.js"]),
                dest: projectConfig.outputDir + "/internal.js",
                options: {
                    /*
                     * Wrap the entire app in a module function.
                     * Also: define a single Angular module with name and includes from project.conf.js.
                     * This feels hacky at first, but it greatly simplifies dependency management.
                     */
                    banner: concatBanner,
                    footer: concatFooter,
                    process: function (src, filepath) {
                        if (filepath === moduleDefFile) {
                            /*
                             * Don't wrap the module definition in a closure since we want it available to everything
                             * internal.
                             */
                            return src;
                        }
                        /*
                         * Wrap our files in closures so that we don't accidentally leak between them.
                         */
                        // Are these closures really necessary if we're writing everything in ng modules?
                        return "(function () {\n" + src + "\n}());";
                    }
                }
            },
            "third-party": {
                src: projectConfig.javaScriptFiles.external.concat(["!**/*Spec.js"]),
                dest: projectConfig.outputDir + "/third-party.js"
            }
        },
        copy: {
            "font-awesome-files": {
                files: [
                    {
                        cwd: projectConfig.depDir + "/font-awesome/fonts/",
                        src: ['**'],
                        dest: projectConfig.outputDir + "/fonts/",
                        expand: true
                    }
                ]
            },
            "proxima-font": {
                files: [
                    {
                        cwd: projectConfig.sourceDir + "/fonts/",
                        src: ['**'],
                        dest: projectConfig.outputDir + "/fonts/",
                        expand: true
                    }
                ]
            },
            "wwtScriptLoader": {
                options: {
                    processContent: function (content) {
                        content = addCacheBustToScriptLoaderFiles(content);
                        return content;
                    }
                },
                files: [
                    {
                        cwd: "./",
                        src: ['wwtScriptLoader.js'],
                        dest: projectConfig.outputDir + "/",
                        expand: true
                    }
                ]
            },
            "index": {
                files: [
                    {
                        cwd: projectConfig.sourceDir,
                        src: ['index.html'],
                        dest: projectConfig.outputDir,
                        expand: true
                    }
                ],
                options: {
                    process: addCacheBustingToGeneratedFileReferences
                }
            },
            "assets": {
                files: [
                    {
                        cwd: projectConfig.sourceDir + "/img/",
                        src: ["**"],
                        dest: projectConfig.outputDir + "/img/",
                        expand: true
                    }
                ]
            },
            "cloudFoundry": {
                files: [
                    {
                        cwd: projectConfig.cloudFoundryDir,
                        src: '*',
                        dest: projectConfig.outputDir,
                        expand: true
                    }
                ]
            },
            "browser-support-images": {
                files: [
                    {
                        cwd: projectConfig.depDir + "/browser-detector/src/img/",
                        src: ['**'],
                        dest: projectConfig.outputDir + "/img/",
                        expand: true
                    }
                ]
            },
            "emoji-task-copy": {
                files: [
                    {
                        cwd: projectConfig.depDir + "/ng-emoticons/images",
                        src: ["*.png"],
                        dest: projectConfig.outputDir + "/img/",
                        expand: true
                    }
                ]
            },
        },
        'gh-pages': {
            options: {
                base: projectConfig.outputDir
            },
            src: ['**']
        },
        html2js: {
            options: {
                fileHeaderString: '(function (angular) {\n"use strict";\n',
                fileFooterString: '}(window.angular));'
            },
            main: {
                src: projectConfig.html2js.templateFiles,
                dest: projectConfig.html2js.outputFile
            }
        },
        jshint: {
            all: [
                'Gruntfile.js',
                projectConfig.sourceDir + '/**/*.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        less: {
            all: {
                src: [projectConfig.rootLessFile],
                dest: projectConfig.outputDir + '/app.css',
                options: {
                    compress: true,
                    sourceMap: true,
                    outputSourceFiles: true,
                    sourceMapFilename: projectConfig.outputDir + '/app.css.map',
                    sourceMapURL: 'app.css.map'
                }
            }
        },
        ngAnnotate: {
            internal: {
                expand: true,
                cwd: projectConfig.outputDir,
                src: ['internal.js'],
                dest: projectConfig.outputDir
            }
        },
        postcss: {
            options: {
                map: true,
                processors: [
                    require('autoprefixer-core')({ browsers: ['last 2 version'] })
                ]
            },
            dist: {
                src: projectConfig.outputDir + '/app.css'
            }
        },
        uglify: {
            /*
             * 'Beautify' the internal.js file for better readability. Even though we're mangling the final output,
             * it improves the source map.
             */
            beautify: {
                options: {
                    beautify: true,
                    mangle: false
                },
                files: [
                    {
                        expand: true,
                        cwd: projectConfig.outputDir,
                        src: 'internal.js',
                        dest: projectConfig.outputDir
                    }
                ]
            },
            all: {
                options: {
                    sourceMap: true
                },
                files: [
                    {
                        expand: true,
                        cwd: projectConfig.outputDir,
                        src: '**/*.js',
                        dest: projectConfig.outputDir
                    }
                ]
            }
        },
        watch: {
            less: {
                files: [projectConfig.sourceDir + "/**/*.less"],
                tasks: 'css'
            },
            templates: {
                files: projectConfig.html2js.templateFiles,
                tasks: 'html2js'
            },
            "js-internal": {
                files: projectConfig.javaScriptFiles.internal.concat([moduleDefFile]),
                tasks: 'concat:internal'
            },
            "js-third-party": {
                files: projectConfig.javaScriptFiles.external,
                tasks: 'concat:third-party'
            },
            index: {
                files: [
                    projectConfig.sourceDir + '/index.html',
                    './wwtScriptLoader.js',
                    projectConfig.outputDir + '/*.*', // all generated files (but not directories)
                    '!' + projectConfig.outputDir + '/index.html' // don't re-run when index.html updates
                ],
                tasks: 'copy:index',
                options: {
                    livereload: projectConfig.livereload
                }
            },
            'project-config': {
                files: ['project.conf.js'],
                tasks: ['reload-project-config', 'compile']
            }
        },
        connect: {
            server: {
                options: {
                    port: 8000,
                    base: projectConfig.outputDir,
                    open: true,
                    middleware: function (connect, options, middlewares) {
                        middlewares.unshift(history());
                        middlewares.unshift(apiRouterProxy);
                        middlewares.unshift(attachmentsProxy);
                        return middlewares;
                    },
                    livereload: projectConfig.livereload
                }
            }
        },
        compress: {
            main: {
                options: {
                    archive: projectConfig.archiveDir + '/' + projectConfig.archiveName + '.zip'
                },
                files: [
                    { expand: true, cwd: projectConfig.outputDir, src: ['**/*'] }
                ]
            }
        },
        war: {
            target: {
                options: {
                    war_dist_folder: projectConfig.warDir,
                    war_verbose: true,
                    war_name: projectConfig.warName,
                    webxml_welcome: 'index.html',
                    webxml_display_name: projectConfig.warName,
                    war_extras: [
                        {
                            filename: 'META-INF/MANIFEST.MF',
                            data: ''
                        }
                    ]
                },
                files: [
                    {
                        expand: true,
                        cwd: projectConfig.outputDir,
                        src: ['**']
                    }
                ]
            }
        }
    });

    // Composite Tasks
    grunt.registerTask('css', ['less', 'postcss']);
    grunt.registerTask('compile', ['clean', 'create-module-definition', 'concat', 'css', 'html2js', 'copy']);
    grunt.registerTask('transpile', ['compile', 'babel']);
    grunt.registerTask('optimize', ['ngAnnotate', 'uglify:beautify', 'uglify:all']);
    grunt.registerTask('package', ['transpile', 'optimize', 'compress']);
    grunt.registerTask('analyze', ['jshint']);
    grunt.registerTask('release', ['package', 'gh-pages']);
    grunt.registerTask('cit', ['package']);
    grunt.registerTask('serve', ['compile', 'mortar', 'connect', 'watch']);
    grunt.registerTask('default', ['cit']);

    grunt.registerTask('reload-project-config',
        'Reload the project configuration after changes to project.conf.js',
        function () {
            projectConfig = require(projectConfigFile);
        });

    grunt.registerTask('create-module-definition',
        'Use the information in project.conf.js to create a moduleDefinition.js file',
        function () {
            var moduleDefinition = loadTemplate('gruntacular/moduleDefinition.js', projectConfig.appModule);
            grunt.file.write(moduleDefFile, moduleDefinition);
        }
    );

    function apiRouterProxy(req, res, next) {
        if (req.url.indexOf('/apirouter') === -1) {
            return next();
        } else {
            req.url = req.url.replace('/apirouter', '');
            req.headers['user-agent'] = 'Java';
            req.headers.REMOTE_USER = currentUserName;
            proxy.web(req, res, {
                target: 'http://apirouter.apps-local.wwt.com',
                changeOrigin: true
            });
        }
    }

    function attachmentsProxy(req, res, next) {
        if (req.url.indexOf('/attachments-api') != -1 && req.url.indexOf('/apirouter') === -1) {
            req.url = req.url.replace('/attachments-api', '');
            req.headers['user-agent'] = 'Java';
            req.headers.REMOTE_USER = currentUserName;
            proxy.web(req, res, {
                target: 'http://attachments-api.apps-local.wwt.com',
                changeOrigin: true
            });
        } else {
            return next();
        }
    }

    /*
     * Add cache busting for generated files by appending "?c={timestamp}" to each generated file referenced from
     * index.html. This means that we'll always get an updated URL to each of our generated files and can
     * cache them indefinitely while avoiding cacheing bugs.
     */
    function addCacheBustingToGeneratedFileReferences(indexHtml) {
        var files = fs.readdirSync(projectConfig.outputDir);
        files.forEach(function (filename) {
            var fileReference = '="' + filename + '"';
            if (indexHtml.indexOf(fileReference) !== -1) {
                /*
                 * Ideally, we'd use the async version of these fs calls, but we can only invoke Grunt's async stuff
                 * from within a task (and we have to return the transformed file string from this function). It
                 * seems to remain under a millisecond, though.
                 */
                var stats = fs.statSync(projectConfig.outputDir + '/' + filename);
                var timestamp = stats.mtime.getTime();
                var newFileReference = '="' + filename + '?c=' + timestamp + '"';
                indexHtml = indexHtml.replace(fileReference, newFileReference);
            }
        });
        return indexHtml;
    }

    function addCacheBustToScriptLoaderFiles(scriptLoaderFile) {
        var date = new Date();
        var components = [
            date.getYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        ];

        var uniqueNumber = components.join("");

        scriptLoaderFile = scriptLoaderFile.replace(/<% cacheBustKey %>/g, uniqueNumber);
        return scriptLoaderFile;
    }
};
