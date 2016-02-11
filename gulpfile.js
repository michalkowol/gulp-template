var gulp = require('gulp');
var connect = require('gulp-connect');
var sourcemaps = require('gulp-sourcemaps');
var stylus = require('gulp-stylus');
var del = require('del');
var runSequence = require('run-sequence');
var proxy = require('proxy-middleware');

var paths = {
  scripts: 'app/js/**/*.js',
  htmls: ['app/index.html'],
  css: ['app/css/**/*.css', 'node_modules/bootstrap/dist/css/**/*.css'],
  stylus: 'app/css/**/*.styl',
  img: "app/img/**/*"
};

gulp.task('clean', function() {
  return del(['dist']);
});

var bundle = (function () {
    var browserify = require('browserify');
    var babelify = require('babelify');
    var gutil = require('gulp-util');
    var assign = require('lodash.assign');
    var watchify = require('watchify');
    var buffer = require('vinyl-buffer');
    var source = require('vinyl-source-stream');

    var customOpts = {
        entries: './app/js/app.js',
        debug: true,
        transform: [babelify.configure({presets: ["es2015", "react"]})]
    };
    var opts = assign({}, watchify.args, customOpts);
    var b = watchify(browserify(opts));
    var bundle = function () {
        gutil.log("Bundle using '", gutil.colors.cyan("\bbrowserify"), "\b'...")
        return b.bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source('bundle.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('dist/js'))
            .pipe(connect.reload());
    };
    b.on('update', bundle);
    return bundle;
})();

gulp.task('js', bundle);

gulp.task('html', function () {
  return gulp.src(paths.htmls)
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
});

gulp.task('css', function () {
  return gulp.src(paths.css)
      .pipe(gulp.dest('dist/css'))
      .pipe(connect.reload());
});

gulp.task('img', function () {
  return gulp.src(paths.img)
      .pipe(gulp.dest('dist/img'))
      .pipe(connect.reload());
});

gulp.task('stylus', function () {
  return gulp.src(paths.stylus)
    .pipe(sourcemaps.init())
    .pipe(stylus())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/css'))
    .pipe(connect.reload());
});

gulp.task('usemin', function() {
  var uglify = require('gulp-uglify');
  var cssnano = require('gulp-cssnano');
  var usemin = require('gulp-usemin');
  
  return gulp.src('dist/index.html')
    .pipe(usemin({
      css: [cssnano],
      js: [uglify],
      inlinejs: [uglify],
      inlinecss: [cssnano, 'concat']
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('connect', function () {
  return connect.server({
    root: 'dist',
    port: 8080,
    livereload: true,
    middleware: function () {
      function createProxy(path) {
        return proxy({
          port: 8081,
          pathname: path,
          route: path
        });
      }
      return [createProxy('/api')];
    }
  });
});

gulp.task('watch', function () {
  gulp.watch(paths.htmls, ['html']);
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.stylus, ['stylus']);
  gulp.watch(paths.img, ['img']);
});

gulp.task('build', ['stylus', 'js', 'css', 'html', 'img']);
gulp.task('dist', function (callback) {
  runSequence('clean', 'build', 'usemin', callback);
});
gulp.task('server', ['build', 'connect', 'watch']);
gulp.task('default', ['server']);
