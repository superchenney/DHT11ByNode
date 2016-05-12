var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    cssmin = require('gulp-minify-css'),
    htmlmin = require('gulp-htmlmin')

gulp.task('Cssmin', function() {
    gulp.src('public/stylesheets/index.css')
        .pipe(gulp.dest('public/stylesheets'))
        .pipe(cssmin())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('public/stylesheets'));
});


gulp.task('Jsmin', function() {
    gulp.src(['public/javascripts/index.js','public/javascripts/openlink.js'])
        .pipe(gulp.dest('public/javascripts'))
        .pipe(jshint())
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('public/javascripts'));
});

gulp.task('Htmlmin', function() {
    var options = {
        removeComments: true, //清除HTML注释
        collapseWhitespace: true, //压缩HTML
        collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
        minifyJS: true, //压缩页面JS
        minifyCSS: true //压缩页面CSS
    };
    gulp.src('views/*.*')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('views/dist'));
});



gulp.task('routejsmin', function() {
    gulp.src('routes/index.js')
        .pipe(gulp.dest('routes'))
        .pipe(jshint())
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('routes'))
});


gulp.task('APPjsmin', function() {
    gulp.src('app.js')
        .pipe(gulp.dest(''))
        .pipe(jshint())
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest(''))
});



gulp.task('default', ['Jsmin', 'Cssmin', 'Htmlmin', 'routejsmin','APPjsmin']); //定义默认任务
