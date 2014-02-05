module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-ember-templates');
    grunt.loadNpmTasks('grunt-es6-module-transpiler');

    grunt.registerTask('default', '', ['transpile', 'uglify:thirdParty', 'uglify:main', 'connect', 'watch']);

    grunt.initConfig({
        watch: {
            scripts: {
                files: ['app/javascripts/**/*.js'],
                tasks: ['transpile', 'uglify:main'],
                options: {
                    spawn: false
                },
            },

            thirdParty: {
                files: ['vendor/**/*.js'],
                tasks: ['uglify:thirdParty']
            },

            styles: {
                files: ['app/styles/**/*.less'],
                tasks: ['less'],
                options: {
                    spawn: false
                }
            },

            templates: {
                files: 'app/templates/**/*.hbs',
                tasks: ['emberTemplates']
            },
        },

        less: {
            development: {
                options: {
                    paths: ['app/styles'],
                    cleancss: true
                },
                files: {
                    'app/build/style.css': 'app/styles/app.less'
                }
            }
        },

        emberTemplates: {
            compile: {
                options: {
                    templateBasePath: /app\/templates\//
                },
                files: {
                    'app/build/templates.js': ['app/templates/**/*.hbs']
                }
            }
        },

        uglify: {
            main: {
                files: {
                    'app/build/app.js': ['app/tmp/js/**/*.js']
                }
            },

            thirdParty: {
                files: {
                    'app/build/third_party.js': [
                        'vendor/jquery/jquery.js',
                        'vendor/jquery.cookie/jquery.cookie.js',
                        'vendor/handlebars/handlebars.js',
                        'vendor/ember/ember.js',
                        'vendor/ember-data-shim/ember-data.js',
                        'vendor/lodash/dist/lodash.js',
                        'vendor/requirejs/require.js'
                    ]
                }
            },

            options: {
                mangle: false,
                compress: false,
                beautify: true
            }
        },

        connect: {
            server: {
                options: {
                    port: 8000,
                    base: 'app'
                }
            }
        },

        transpile: {
            main: {
                type: 'globals', // or "amd" or "yui"
                files: [{
                    expand: true,
                    cwd: 'app/',
                    src: ['javascripts/**/*.js'],
                    dest: 'app/tmp/js'
                }]
            }
        }
    });
};
