var gulp   = require('gulp')
var ghPages = require('gulp-gh-pages');

gulp.task('deploy', function() {
	/*return gulp.src([
		'!node_modules/',
		'!*.js',
		'!*.json',
		'..*//**'])
		.pipe(ghPages());*/

	return gulp.src([
		'../**',
		'!../paper-peerjs-stream/node_modules/',
		'!../paper-peerjs-stream/node_modules/**'])
		.pipe(ghPages());
});