# gulp-docker-dest [![Build Status](https://travis-ci.org/erikxiv/gulp-docker-dest.svg?branch=master)](https://travis-ci.org/erikxiv/gulp-docker-dest)

> Copy files to a Docker container

Useful in developer workflows


## Install

```
$ npm install --save-dev gulp-docker-dest
```


## Usage

```js
var gulp = require('gulp');
var gutil = require('gulp-util');
var dockerdest = require('gulp-docker-dest');

gulp.task('default', function () {
	return gulp.src('src/*')
		.pipe(dockerdest({
			remotePath: '/var/www/html'
		}));
});
```


## API

### dest(options)

#### options.remotePath

Type: `string`  
Default: `''`

The remote path to copy to.

Nonexistent directories will be created for you.


## License

MIT © [Sindre Sorhus](http://erikxiv.com)
