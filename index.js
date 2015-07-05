'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var assign = require('object-assign');
var chalk = require('chalk');
var plur = require('plur');
var child_process = require('child_process')

function cp(container, contents, containerpath, cb) {
  var exec = child_process.spawn('docker', ['exec', '-i', container, 'sh', '-c', '\'\'cat > '+containerpath+'\'\'']);
	exec.stdin.write(contents);
	exec.stdin.end();
  exec.on('close', function (code) {
  	if (code !== 0)
  		cb(exec.stderr.toString())
  	else
  		cb();
  });
}

function exec(container, cmd, cb) {
  var exec = child_process.spawn('docker', ['exec', container].concat(cmd.split(' ')));
  exec.on('close', function(code) {
  	if (code !== 0)
  		cb(exec.stderr.toString())
  	else
  		cb();
  });
}

function mkdirp(container, containerpath, cb) {
	return exec(container, 'mkdir -p ' + containerpath, cb);
}


module.exports = function (options) {
	options = assign({}, options);
	options.verbose = process.argv.indexOf('--verbose') !== -1;

	if (options.container === undefined) {
		throw new gutil.PluginError('gulp-docker-dest', '`container` required');
	}

	var fileCount = 0;
	var remotePath = options.remotePath || '';
	delete options.remotePath;

	var stream = through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-docker-dest', 'Streaming not supported'));
			return;
		}

		var finalRemotePath = path.join(remotePath, file.relative).replace(/\\/g, '/');

		mkdirp(options.container, path.dirname(finalRemotePath).replace(/\\/g, '/'), function (err) {
			if (err) {
				cb(new gutil.PluginError('gulp-docker-dest', err, {fileName: file.path}));
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
		});

		if (options.verbose) {
			gutil.log('gulp-docker-dest:', chalk.green('✔ ') + file.relative);
		}
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
};
