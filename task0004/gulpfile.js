var gulp = require('gulp'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    optimize = require('amd-optimize');

var paths = {
    js: ['./src/js/**/*.js', '!./src/js/require.js']
};

gulp.task('styles', function () {
    return gulp.src('src/less/*.less')
        .pipe(less())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest('dist/css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('dist/css'))
        .pipe(notify({message: 'Styles task complete'}));
});

gulp.task('requireJS', function () {
    return gulp.src('src/js/require.js')
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
        .pipe(notify({message: 'requireJS task complete'}));
});

gulp.task('scripts', function () {
    return gulp.src(paths.js)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(optimize('main', {
            paths: {
                'util': './helper/util',
                'fastclick': './helper/fastclick'
            }
        }))
        .pipe(concat('main.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
        .pipe(notify({message: 'Scripts task complete'}));
});

gulp.task('watch', function () {
    gulp.watch('src/js/require.js', ['requireJS']);
    gulp.watch('src/less/**/*.less', ['styles']);
    gulp.watch('src/js/**/*.js', ['scripts']);
});

gulp.task('default', function () {
    gulp.start('requireJS', 'styles', 'scripts', 'watch');
});
