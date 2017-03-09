'use strict';

// ----------- Dependencies

var gulp         = require('gulp'),
    browserSync  = require('browser-sync').create(),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglify'),
    rename       = require('gulp-rename'),
    sass         = require('gulp-sass'),
    maps         = require('gulp-sourcemaps'),
    cache        = require('gulp-cache'),
    del          = require('del'),
    babel        = require('gulp-babel');

// ----------- Server

gulp.task('serve', ['minifyScripts', 'compileSass'], function() {

    browserSync.init({
        server: "./app"
    });

    // Watch styles, scripts, snippets/templates, kirby content text files
    gulp.watch('app/src/styles/**/*.scss', ['compileSass']);
    gulp.watch('app/src/js/*', ['minifyScripts']);
    gulp.watch('app/*.html').on('change', browserSync.reload);
    //gulp.watch('app/*.php').on('change', browserSync.reload);
    //gulp.watch('app/inc/**/*.php').on('change', browserSync.reload);

});

// ----------- Server & Watch Files (PHP setup)
//
// gulp.task('serve', ['minifyScripts', 'compileSass'], function() {
//
//     // Note: I'm using MAMP PRO for my local server
//     browserSync.init({
//         proxy: 'localhost:8888',
//         notify: false
//     });
//
//     // Watch styles, scripts, snippets/templates, kirby content text files
//     gulp.watch('app/src/styles/**/*.scss', ['compileSass']);
//     gulp.watch('app/src/js/*', ['minifyScripts']);
//     gulp.watch('app/*.php').on('change', browserSync.reload);
//     gulp.watch('app/inc/**/*.php').on('change', browserSync.reload);
//
// });

// ----------- Concat & Minify JS

gulp.task('concatScripts', function() {
    return gulp.src([
        'app/src/js/main.js'
    ])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('app/src/js/'));
});

// Now minify it, and put it in assets/js/
gulp.task('minifyScripts', ['concatScripts'], function() {
    return gulp.src('app/src/js/app.js')
        .pipe(maps.init())
        //.pipe(uglify()) added gulp-babel
        .pipe(babel({
          presets: ['es2015']
        }))
        // add error logging
        .pipe(uglify().on('error', function(e){
          console.log(e);
        }))
        .pipe(rename('app.min.js'))
        .pipe(maps.write('./'))
        .pipe(gulp.dest('app/js'));
});

// ----------- Compile Sass

gulp.task('compileSass', function () {
    return gulp.src('app/src/styles/styles.scss')
        .pipe(maps.init())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename('styles.min.css'))
        .pipe(maps.write('./'))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.stream());
});

// ----------- Cleanup

gulp.task('clean', function(callback) {

    del('app/css/*.css*');
    del('app/js/*.js*');

    del('app/src/js/app.js');
    del('app/src/js/app.min.js');
    del('app/src/js/app.min.js.map');

    del('dist');

    return cache.clearAll(callback);

})

// ----------- Build

gulp.task('build', ['clean', 'minifyScripts', 'compileSass'], function() {
    return gulp.src([
        'app/**/*',
        '!app/src',
        '!app/src/**'
        ], { base: './app/'}) // adding base preserves the directory structure
    .pipe(gulp.dest('dist'));
});

// ----------- Default

gulp.task('default', ['serve']);
