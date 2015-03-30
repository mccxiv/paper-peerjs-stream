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
		'!../*.iml',
		'!../paper-peerjs-stream/node_modules/',
		'!../paper-peerjs-stream/node_modules/**',
		'!../paper-peerjs-stream/*.json',
		'!../paper-peerjs-stream/*.js'])
		.pipe(ghPages());
});