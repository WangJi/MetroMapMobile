var gulp = require('gulp');
var webpack = require('gulp-webpack');


/** 运行webpack执行打包 */
gulp.task('webpack', function() {
    var config = require('./webpack.config.js');
    return gulp.src('./src')
        .pipe(webpack(config))
        .pipe(gulp.dest('./lib'));
});

gulp.task('watch', function() {
    gulp.watch('./src/**', ['webpack']);
});