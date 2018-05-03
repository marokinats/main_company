const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const autoprefixer = require('gulp-autoprefixer');
const minifycss = require('gulp-csso');
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const del = require('del');
const runsequence = require('run-sequence');

//Определить режим: production or development
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

// Пути к модулям JavaScript
let moduleJs = [
	//'app/js/jquery-3.2.1.min.js',
	'app/js/main.js'
];

//Пути к внешним плагинам и библиотекам
let vendorJs = [
	'node_modules/jquery/dist/jquery.min.js',
	'node_modules/inputmask/dist/jquery.inputmask.bundle.js'
];

//Пути к внешним стилям
let vendorCss = [
	'node_modules/normalize-css/normalize.css'
];

//Запускаем сервер
gulp.task('browser-sync',
	['html', 'fonts', 'images', 'styles', 'php', 'build:js', 'vendor:js', 'vendor:css'],function () { 
	browserSync.init({
		server: {
			baseDir: './dist' 
		}
	});
	browserSync.watch(['./dist/**/*.*', '!**/*.css'], browserSync.reload); 
});

//Переносим html файлы
gulp.task('html', function () { 
	return gulp.src('app/**/*.html') 
		.pipe(gulp.dest('dist')) 
});

//Переносим fonts шрифты
gulp.task('fonts', function () { 
	return gulp.src('app/fonts/*.*') 
		.pipe(gulp.dest('dist/fonts')) 
});

//Перенос и оптимизация картинок
gulp.task('images', function () {
	return gulp.src('app/img/**/*.{png,svg,jpg,ico}') 
	.pipe(cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true})))
	.pipe(gulp.dest('dist/img/'));
});

//Перенос css стилей
gulp.task('styles', function () {
	return gulp.src('app/css/main.scss')
	.pipe(plumber({
		errorHandler: notify.onError(function (err) {
			return {title: 'Styles', message: err.message}
		})
	}))
	.pipe(gulpif(isDevelopment, sourcemaps.init())) 
	.pipe(sass()) 
	.pipe(autoprefixer('last 2 versions')) 
	.pipe(rename({suffix: '.min'})) 
	.pipe(minifycss()) 
	.pipe(gulpif(isDevelopment, sourcemaps.write()))
	.pipe(gulp.dest('dist/css'))
	.pipe(browserSync.stream()); //auto-inject into browsers
});

//Переносим php файлы
gulp.task('php', function () { 
	return gulp.src('app/**/*.php')  
		.pipe(gulp.dest('dist')) 
});

//Перенос и объединение файлов .js
gulp.task('build:js', function () {
	return gulp.src(moduleJs)
	.pipe(plumber({ 
		errorHandler: notify.onError(function (err) { 
			return {title: 'JavaScript', message: err.message}
		})
	}))
	.pipe(gulpif(isDevelopment, sourcemaps.init())) 
	.pipe(concat('main.min.js'))
	.pipe(uglify()) 
	.pipe(gulpif(isDevelopment, sourcemaps.write())) 
	.pipe(gulp.dest('dist/js'));
});

//Объединение всех подключаемых плагинов в один файл
gulp.task('vendor:js', function () {
	return gulp.src(vendorJs)
	.pipe(concat('vendor.min.js'))
	.pipe(gulp.dest('dist/js'));
});

//Объединение всех подключаемых стилей в один файл
gulp.task('vendor:css', function () {
	return gulp.src(vendorCss)
	.pipe(concat('vendor.min.css'))
	.pipe(minifycss())
	.pipe(gulp.dest('dist/css/'));
});

//Следим за изменениями файлов, и при их изменении запускаем необходимый task
gulp.task('watch', function () { 
	gulp.watch('app/**/*.html', ['html']);
	gulp.watch('app/fonts/*.*', ['fonts']);
	gulp.watch('app/img/**/*.*', ['images']);
	gulp.watch('app/css/**/*.scss', ['styles']);
	gulp.watch('app/**/*.php', ['php']);
	gulp.watch('app/js/*.js', ['build:js']);
});

//Запуск task'ов по умолчанию
gulp.task('default', ['browser-sync', 'watch']);

//Удаление
gulp.task('clean', function () {
	return del(['dist'], {force: true}).then(paths => {
		console.log('Deleted files and folders in dist');
	});
});

//Выполнить сборку проекта
gulp.task('build', function (cb) {
	runsequence( //выполняем последовательно действия в скобках
		['clean'],
		['html', 'fonts', 'images', 'styles', 'php', 'build:js', 'vendor:js', 'vendor:css'],
		cb);
});