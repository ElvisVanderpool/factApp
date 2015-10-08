/**
 *
 *  Web Starter Kit
 *  Copyright 2014 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

// Include Gulp & tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var wiredep = require('wiredep').stream;
var http = require('http');
var st = require('st');

var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

// Lint JavaScript
gulp.task('jshint', function() {
    return gulp.src(['app/scripts/**/*.js'])
        .pipe($.livereload())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jshint.reporter('fail'));
});

// Compile and automatically prefix stylesheets
gulp.task('styles', function() {
    // For best performance, don't add Sass partials to `gulp.src`
    return gulp.src([
            'app/styles/**/*.scss',
            'app/styles/**/*.css',
            'app/styles/**/*.sass'
        ])
        .pipe($.sourcemaps.init())
        .pipe($.changed('app/styles', {
            extension: '.css'
        }))
        .pipe($.sass({
            precision: 10,
            onError: console.error.bind(console, 'Sass error:')
        }))
        .pipe($.autoprefixer({
            browsers: AUTOPREFIXER_BROWSERS
        }))
        .pipe($.sourcemaps.write())
        .pipe($.if('*.css', $.csso()))
        .pipe(gulp.dest('app/styles'))
        .pipe($.size({
            title: 'styles'
        }))
        .pipe($.livereload());
});
// Optimize images
gulp.task('images', function() {
    return gulp.src('app/images/**/*')
        .pipe($.cache($.imagemin({
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('app/images'))
        .pipe($.size({
            title: 'images'
        }))
        .pipe($.livereload());
});

// My Own Wiredep Task for Bower Options
gulp.task('wiredep', function() {
    gulp.src('app/styles/*.{sass,scss}')
        .pipe(wiredep({
            ignorePath: /^(\.\.\/)+/
        }))
        .pipe(gulp.dest('app/styles'));
    gulp.src('app/*.html')
        .pipe(wiredep({
            ignorePath: /^(\.\.\/)+/
        }))
        .pipe(gulp.dest('app'));
});
gulp.task('watch', function() {
    $.livereload.listen('app');
    gulp.watch(['./app/styles/**/*.sass', './app/styles/**/*.scss'], ['styles']);
    gulp.watch(['app/images/**/*'], ['images']);
    gulp.watch(['./app/scripts/**/*.js'], ['jshint']);
});

gulp.task('server', function(done) {
  http.createServer(
    st({ path: __dirname + '/app', index: 'index.html', cache: false, gzip: true })
  ).listen(8080, done);
});

gulp.task('default', function(cb) {
    runSequence('styles', ['wiredep', 'jshint', 'watch'], cb)
});
