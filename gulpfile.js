  

var gulp = require('gulp'),
    uglify = require('gulp-uglify'), //  js 文件压缩
    minifyCSS = require('gulp-minify-css'),
    sass = require('gulp-sass'),

    concat = require('gulp-concat'),
    del = require('del'),
    fileinclude = require('gulp-file-include'),
    contentIncluder = require('gulp-content-includer'),
    rename = require('gulp-rename'),
    gulpopen = require('gulp-open'),
    autoprefixer = require('gulp-autoprefixer'),
    inject = require('gulp-inject'),
    clean = require('gulp-clean'),
    jshint = require("gulp-jshint"),
    sasslint = require("gulp-sass-lint"),
    connect = require('gulp-connect'),
    plumber = require('gulp-plumber'), // 需要编译的地方加，有错误继续往下走，不中断服务器
    babel = require('gulp-babel'),
    sequence = require('run-sequence'),
    argv = require('yargs').argv,
    gulpif = require('gulp-if'),
    notify = require('gulp-notify'),

    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    babelify = require('babelify'),
    // 参数 www     . pipe(gulpif(argv.www, uglify()))
    // 参数 www   . pipe(gulpif(argv.www, rename({suffix: '.min'})))


    // open = require('open'),
    //压缩html   minifyHtml = require("gulp-minify-html");
    //JS代码检查  jshint = require("gulp-jshint");
    //文件合并    concat = require("gulp-concat");
    //图片压缩    imagemin = require('gulp-imagemin'),

    //   imageminJpegRecompress = require('imagemin-jpeg-recompress'),
    //   imageminOptipng = require('imagemin-optipng'),
    browserSync = require('browser-sync');
//    browserSync = require('browser-sync').create();

// set src


var appsrc = {
    srcPath: './src/',
    distPath: './dist/'
};





 
gulp.task('mergehtml', function() {
    gulp.src(appsrc.srcPath + 'all.html')
        .pipe(contentIncluder({
            includerReg: /<!\-\-include\s+"([^"]+)"\-\->/g
        }))
        .pipe(rename('index.html'))
        .pipe(gulp.dest(appsrc.distPath))
        .pipe(notify({ message: 'mergehtml ～～ done' }));

});

gulp.task('dohtml', ['mergehtml'], function() {
    gulp.src(appsrc.srcPath + '**/*.html')
        .pipe(gulp.dest(appsrc.distPath))
        .pipe(notify({ message: 'dohtml ～～ done' }));
});

gulp.task('docss', function() {
    gulp.src(appsrc.srcPath + '**/*.css')
        .pipe(gulp.dest(appsrc.distPath));
});

gulp.task('dofontfiles', function() {
    gulp.src(appsrc.srcPath + 'css/fonts/*.*')
        .pipe(gulp.dest(appsrc.distPath + 'fonts'));
});

gulp.task('dosass', function() {
    gulp.src(appsrc.srcPath + 'sass/main.scss')
        .pipe(plumber())
        //  .pipe(sass())
        .pipe(sass().on('error', sass.logError))
        //  .pipe(sass({  outputStyle: 'compressed' }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove: true //是否去掉不必要的前缀 默认：true 
        }))
        .pipe(gulp.dest(appsrc.distPath + "css"))
        .pipe(notify({ message: 'dosass ～～ done' }));
 
});
 

gulp.task('dojs', function() {
    gulp.src(appsrc.srcPath + 'js/**/*.js')
        .pipe(plumber())
        .pipe(gulpif(argv.ppp, uglify()))
        .pipe(gulpif(argv.ppp, rename({ suffix: '.min' })))
        .pipe(gulp.dest(appsrc.distPath + 'js'))
        .pipe(notify({ message: 'dojs ～～ done' }));


});



gulp.task('dojson', function() {
    gulp.src(appsrc.srcPath + 'data/*.json')
        .pipe(gulp.dest(appsrc.distPath + 'data'));
});


gulp.task('doimage', function() {
    gulp.src(appsrc.srcPath + 'img/**/*.*')
        .pipe(plumber())
        .pipe(gulp.dest(appsrc.distPath + 'img'));
});

//////  js lint

gulp.task('jsLint', function() {
    gulp.src(appsrc.srcPath + 'js/*.js')
        .pipe(jshint()) //进行代码检查         
        .pipe(jshint.reporter()); // 输出检查结果     
});


//////  SASS LINT
gulp.task('dosasslint', function() {
    gulp.src(appsrc.srcPath + 'sass/*.scss')
        .pipe(sasslint())
        .pipe(sasslint.format())
        .pipe(sasslint.failOnError());
});


///// WATCH //////////////////////////////////

gulp.task('dowatch', function() {

    gulp.watch(appsrc.srcPath + '**/*.html', ['dohtml']);
    gulp.watch(appsrc.srcPath + 'js/**/*.js', ['dojs']);
    // gulp.watch(appsrc.srcPath + 'sass/*.scss', ['dosasslint']);
    //     gulp.watch(appsrc.srcPath + 'js/*.js', ['jsLint']);
    gulp.watch(appsrc.srcPath + 'css/*.css', ['docss']);
    gulp.watch(appsrc.srcPath + 'sass/*.*', ['dosass']);
    gulp.watch(appsrc.srcPath + 'data/*', ['dojson']);
    gulp.watch(appsrc.srcPath + 'img/**/*', ['doimage']);

    gulp.watch(appsrc.srcPath + '**/*', function(event) {
        console.log('->>' + event.path + ' --> ' + event.type + ', ReadLoad Chrome...');

        setTimeout(function() {
            browserSync.reload();
        }, 200);
    });



});


/////////////////////////////////////////////////////////////////

gulp.task('doclean', function() {
    gulp.src([
        '!./dist',
        '!./dist/img',
        '!./dist/fonts',
        '!./dist/data',
        './dist/css',
        './dist/js',
        './dist/html-tpl',
        './dist/*.html'

    ]).pipe(clean());
});


gulp.task('dobuild', function() {
    sequence('dohtml', 'dojs', 'docss', 'dosass', 'dojson', ['dofontfiles', 'doimage']);
});



gulp.task('server', function() {
    browserSync.init({
        server: "./dist/",
        open: "local",
        port: 8888
    });

});



gulp.task('default', ['doclean'], function() {
    setTimeout(function() {
        sequence('dobuild', 'dowatch', 'server');

    }, 200);


    console.log('---- game start--->');
});