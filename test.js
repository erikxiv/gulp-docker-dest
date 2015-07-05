'use strict';
var assert = require('assert');
var fs = require('fs');
var gutil = require('gulp-util');
var pathExists = require('path-exists');
var docker = require('./');
var mockServer;

it('would be beneficial to mock Docker to make some tests', function (cb) {
	var stream = docker.dest({
		container: 'helloember_node_1'
	});

	setTimeout(function () {
		cb();
	}, 1000);

	stream.write(new gutil.File({
		cwd: __dirname,
		base: __dirname,
		path: __dirname + '/fixture/fixture.txt',
		contents: new Buffer('unicorns')
	}));

	stream.write(new gutil.File({
		cwd: __dirname,
		base: __dirname,
		path: __dirname + '/fixture/fixture2.txt',
		contents: new Buffer('unicorns')
	}));
});
