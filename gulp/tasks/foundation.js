var gulp = require('gulp'),
  streamqueue = require('streamqueue'),
  minifyHtml = require('gulp-minify-html'),
  templateCache = require('gulp-angular-templatecache'),
  concat = require('gulp-concat'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify');

gulp.task('foundation', function() {
  var stream = streamqueue({objectMode: true});
  stream.queue(
    gulp.src('./src/directives/decorators/foundation/*.html')
    .pipe(minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe(templateCache({
      module: 'schemaForm',
      root: 'directives/decorators/foundation/'
    }))
    );
  stream.queue(gulp.src('./src/directives/decorators/foundation/*.js'));

  stream.done()
  .pipe(concat('foundation-decorator.js'))
  .pipe(gulp.dest('./dist/'))
  .pipe(uglify())
  .pipe(rename('foundation-decorator.min.js'))
  .pipe(gulp.dest('./dist/'));

});
