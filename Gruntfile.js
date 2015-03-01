module.exports = function(grunt) {

  var path = require('path');

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        jshintrc : '.jshintrc'
      },
      files: [
        'Gruntfile.js',
        '<%= pkg.main %>',
        'lib/*.js',
        'tests/specs/*.js'
      ]
    },

    nodeunit: {
      options: {
        reporter: 'default'
      },
      files: ['tests/specs/*Spec.js']
    },

    connect: {
      server: {
        options: {
          hostname: '127.0.0.1',
          port: 8999,
          base: path.join('tests', 'fixtures')
        }
      }
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['default']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['jshint', 'connect', 'nodeunit']);
  grunt.registerTask('default', ['test']);
};
