'use strict';
var assert = require('assert');
var fs = require('fs');
var gutil = require('gulp-util');
var pathExists = require('path-exists');
var dockerdest = require('./');
var mockServer;

it('should upload files to FTP-server', function (cb) {
	var stream = dockerdest({
		container: 'helloember_node_1'
	});

	setTimeout(function () {
		assert(pathExists.sync('fixture/fixture.txt'));
		assert(pathExists.sync('fixture/fixture2.txt'));
		fs.unlinkSync('fixture/fixture.txt');
		fs.unlinkSync('fixture/fixture2.txt');
		fs.rmdirSync('fixture');
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
