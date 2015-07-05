'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var assign = require('object-assign');
var chalk = require('chalk');
var plur = require('plur');
var child_process = require('child_process')

function cp(container, contents, containerpath, cb) {
	if (process.argv.indexOf('--verbose') !== -1) {
		gutil.log('gulp-docker-dest cp:', container + ' ' + containerpath);
	}
  var exec = child_process.exec('docker exec -i ' + container + ' sh -c \'cat > ' + containerpath + '\'', cb);
	exec.stdin.write(contents);
	exec.stdin.end();
}

function exec(container, cmd, cb) {
	if (process.argv.indexOf('--verbose') !== -1) {
		gutil.log('gulp-docker-dest exec:', container + ' ' + cmd);
	}
  var exec = child_process.exec('docker exec ' + container + ' ' + cmd, cb);
}

function mkdirp(container, containerpath, cb) {
	return exec(container, 'mkdir -p ' + containerpath, cb);
}


module.exports = {
	cp: cp,
	exec: exec,
	dest: function (options) {
		options = assign({}, options);
		options.verbose = process.argv.indexOf('--verbose') !== -1;

		if (options.container === undefined) {
			throw new gutil.PluginError('gulp-docker-dest', '`container` required');
		}

		var fileCount = 0;
		var remotePath = options.remotePath || '';
		delete options.remotePath;

		var stream = through.obj(function (file, enc, cb) {
			var finalRemotePath = path.join(remotePath, file.relative).replace(/\\/g, '/');

			if (file.isNull()) {
				// Directory
				mkdirp(options.container, path.dirname(finalRemotePath).replace(/\\/g, '/'), function (err) {
					if (err) {
						cb(new gutil.PluginError('gulp-docker-dest', err, {fileName: file.path}));
						return;
					}
					cb(null, file);
				});
				return;
			}

			if (file.isStream()) {
				cb(new gutil.PluginError('gulp-docker-dest', 'Streaming not supported'));
				return;
			}

			cp(options.container, file.contents, finalRemotePath, function (err) {
				if (err) {
					cb(new gutil.PluginError('gulp-docker-dest', err, {fileName: file.path}));
					return;
				}

				fileCount++;
				cb(null, file);
			});
		}, function (cb) {
			if (fileCount > 0) {
				gutil.log('gulp-docker-dest:', gutil.colors.green(fileCount, plur('file', fileCount), 'uploaded successfully'));
			} else {
				gutil.log('gulp-docker-dest:', gutil.colors.yellow('No files uploaded'));
			}

			cb();
		});
		stream.resume();
		return stream;
	}
};
