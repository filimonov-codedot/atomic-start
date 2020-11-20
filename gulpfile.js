const {src, dest, parallel, series, watch} = require('gulp');
const browserSync         = require('browser-sync').create();
const concat              = require('gulp-concat');
const uglify              = require('gulp-uglify-es').default;
const sass                = require('gulp-sass');
const autoprefixer        = require('gulp-autoprefixer');
const cleancss            = require('gulp-clean-css');
const imagemin            = require('gulp-imagemin');
const newer               = require('gulp-newer');
const sourcemaps          = require('gulp-sourcemaps');
const del                 = require('del');
const sassGlob            = require('gulp-sass-glob');

function browsersync() {
	browserSync.init({
		server: { baseDir: './'},
		index: 'html/index.html',
		notify: false,
		online: true,
	})
}

function css() {
	return src('css/scss/styles.scss')
		.pipe(sourcemaps.init())
		.pipe(sassGlob())
		.pipe(sass())
		.pipe(concat('styles.min.css'))
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 2 versions'],
			grid: true
		}))
		.pipe(cleancss((
			{level:
				{1: {specialComments: 0 }},
				// format: 'beautify'
			}
			)))
		.pipe(sourcemaps.write())
		.pipe(dest('css'))
		.pipe(browserSync.stream())
}

function scripts() {
	return src([
		'js/scripts.js',
	])
		.pipe(concat('scripts.min.js'))
		.pipe(uglify())
		.pipe(dest('js/'))
		.pipe(browserSync.stream())
}

function images() {
	return src('img/src/**/*')
		.pipe(newer('img/dest/'))
		.pipe(imagemin())
		.pipe(dest('img/dest/'))
}

function cleanimg() {
	return del('img/*.{png,jpg,gif}')
}

function cleandist() {
	return del('dist/**/*')
}

function cleandest() {
	return del('dist/img/dest/')
}

function imagescleanfolter() {
	return src('dist/img/dest/**/*')
		.pipe(dest('dist/img/'))
}

function build() {
	return src([
		'css/styles.min.css',
		'js/scripts.min.js',
		'img/dest/**/*',
		'html/**/*.html',
	], {base: '/'})
		.pipe(dest('dist'));
}

function startWatch() {
	watch([
		'js/**/*.js',
		'!js/**/*.min.js'
	], scripts);
	watch('css/**/*.scss', css);
	watch('html/**/*.html',).on('change', browserSync.reload);
	watch('img/src/**/*', images);
}

exports.browsersync          = browsersync;
exports.scripts              = scripts;
exports.css                  = css;
exports.images               = images;
exports.cleanimg             = cleanimg;
exports.cleandest            = cleandest;
exports.imagescleanfolter    = imagescleanfolter;

exports.build       = series(cleandist, scripts, images, css, build, imagescleanfolter, cleandest);
exports.default     = parallel(scripts, images, css, browsersync, startWatch);