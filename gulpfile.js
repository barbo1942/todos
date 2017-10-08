var gulp=require('gulp');
var $ = require('gulp-load-plugins')();
var watch = require('gulp-watch');
var autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync').create();
var minimist = require('minimist');
var mainBowerFiles=require('main-bower-files')
var gulpSequence=require('gulp-sequence')
var request=require('request-json')

var envOptions = {
    string: 'env',
    default: {env: 'dev'}
}
var options = minimist(process.argv.slice(2),envOptions)
console.log(options)

gulp.task('clean',function () {
    return gulp.src(['./.tmp','./public'],{read:false})
        .pipe($.clean())
})

gulp.task('copyHTML',function () {  
    return gulp.src('./source/**/*.html')
               .pipe(gulp.dest('./public/'))
  });


gulp.task('pug', function buildHTML() {
  return gulp.src('./source/**/*.pug')
    .pipe($.plumber())
    .pipe($.pug({
      pretty: true 
      }))
    .pipe(gulp.dest('./public/'))
    .pipe(browserSync.stream())
});


gulp.task('sass', function () {
  var plugins = [
      autoprefixer({browsers: ['last 2 version','>5%']})
  ];  
    return gulp.src(['./source/sass/**/*.sass', './source/sass/**/*.scss'])
    .pipe($.plumber())
    .pipe( $.sourcemaps.init())
    .pipe($.sass({outputStyle: 'nested', includePaths: './node_modules/bootstrap/scss'})
      .on('error', $.sass.logError))
    .pipe($.postcss(plugins))
    .pipe( $.if(options.env === 'production', $.minifyCss()) ) // 假設開發環境則壓縮 CSS
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./public/css'))
    .pipe(browserSync.reload({
      stream: true
    }));

});

gulp.task('babel', () =>
    gulp.src('./source/js/**/*.js')
        .pipe($.sourcemaps.init())
        .pipe($.babel({
            presets: ['es2015']
        }))
        .pipe($.concat('all.js'))
        .pipe($.if( options.env==='pro',  $.uglify({
            compress: {
                drop_console: true
            }
        }))
        )//if
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/js'))
        .pipe(browserSync.stream())
);


gulp.task('bower',function () {
    return gulp.src(mainBowerFiles({
        'overrides':{
            'vue':{
                'main': 'dist/vue.js'
            }
        }
    }))
        .pipe(gulp.dest('./.tmp/venders'))
        cb(err)
  })

gulp.task('vendorJs',['bower'],function () {
    return gulp.src('./.tmp/venders/**/*.js')
            .pipe($.order([
                'jquery.js',
                'popper.js',
                'bootstrap.js'
            ]))
            .pipe($.concat('venders.js'))
            .pipe($.if( options.env==='pro', $.uglify()) )
            .pipe(gulp.dest('./public/js'))
})


gulp.task('imagemin', function buildHTML() {
    return gulp.src('./source/img/**/*.*')
      .pipe($.plumber())
      .pipe($.if(options.env==='pro',$.imagemin()))
      .pipe(gulp.dest('./public/img'))
      .pipe(browserSync.stream())
  });
  


gulp.task('browser-sync', function() {
  browserSync.init({
      server: {
          baseDir: "./public"
      }
  });
});


gulp.task('watch', function () { 
    gulp.watch(['./source/data/**/*.json','./source/**/*.pug'],['pug'])
    gulp.watch(['./source/sass/**/*.sass','./bower_components/bootstrap/scss/*.scss'], ['sass'])
    gulp.watch('./source/js/**/*.js', ['babel']) 
});

gulp.task('deploy',function () {
    return gulp.src('./public/**/*')
        .pipe($.ghPages())
})


// gulp.task('build', gulpSequence('clean','pug','vendorSass','sass','babel','vendorJs'))
gulp.task('build', gulpSequence('clean','pug','sass','babel','vendorJs'))

// gulp.task('default',['pug','sass','babel','imagemin','browser-sync','addPug','addSass','bower','vendorJs','vendorSass','watch']);
gulp.task('default',['pug','sass','babel','imagemin','browser-sync','bower','vendorJs','watch']);