var gulp			= require('gulp'),
	autoprefixer	= require('autoprefixer'),
	browserSync		= require('browser-sync'),
	cleanCSS		= require('gulp-clean-css'),
	fs 				= require('fs'),
	gulpIf			= require('gulp-if'),
	imageMin		= require('gulp-imagemin'),
	minify			= require('gulp-babel-minify'),
	postCSS			= require('gulp-postcss'),
	prompt			= require('gulp-prompt'),
	rename			= require('gulp-rename'),
	rsync			= require('gulp-rsync'),
	settings		= require('./build.json'),
	wpPot			= require('gulp-wp-pot');



var deployToProduction = true;



var	localStagingDir = settings.localStagingDir + '/' + settings.themeURI,
	filesDeploy = ['./src/**/*', '!./src/**/.DS_Store'],
	filesDeployProd = [localStagingDir + '/**/*', '!' + localStagingDir + '/**/.DS_Store'];

const server = browserSync.create();



// Compile style.css for theme definition
gulp.task('themeDefinition', (done) => {
	var info = `/*
Theme Name: ${settings.name}
Theme URI: ${settings.themeURI || ''}
Author: ${settings.author || ''}
Author URI: ${settings.authorURI || ''}
Description: ${settings.description || ''}
Version: ${settings.version || ''}
License: ${settings.license || ''}
License URI: ${settings.licenseURI || settings.authorURI || ''}
Text domain: ${settings.textDomain || settings.themeURI  || ''}
Last build: ${new Date()}
*/`;

	fs.writeFileSync('src/style.css', info);
	done();
});

// Auto-prefix and compress CSS
gulp.task('styles', () =>
	gulp.src('inc/css/main.css')
		.pipe(postCSS([ autoprefixer() ]))
		.pipe(cleanCSS({ compatibility: 'ie8' }))
		.pipe(rename('main.min.css'))
		.pipe(gulp.dest('inc/css/'))
		.pipe(server.stream())
);


// Compress JS
gulp.task('scripts', () =>
	gulp.src('inc/js/main.js')
		.pipe(minify({
			mangle: {
				keepClassName: true
			}
		}))
		.pipe(rename('main.min.js'))
		.pipe(gulp.dest('inc/js/'))
);


// Compress images
gulp.task('images', () =>
	gulp.src('inc/img/src/*.{jpg,jpeg,png,svg,gif}')
		.pipe(imageMin())
		.pipe(gulp.dest('inc/img/'))
);


// Generate .pot file
gulp.task('pot', () =>
	gulp.src('**/*.php')
		.pipe(wpPot({
			domain: settings.textDomain,
			package: settings.themeURI
		}))
		.pipe(gulp.dest(`inc/languages/${settings.themeURI}.pot`))
);


/*********************************************************************
	Deploying and reloading
 *********************************************************************/

// Deploy theme to theme folder
gulp.task('deployLocal', () =>
	gulp.src(filesDeploy)
	    .pipe(gulp.dest(localStagingDir))
);


// Deploy theme to production server
gulp.task('deployProduction', (done) => {
	if (!deployToProduction) return done();

	return gulp.src(filesDeployProd)
			   .pipe(prompt.confirm({
					message: 'Are you sure you want to deploy these files to the production server, potentially overwrite and damage files?',
					default: false
				}))
			   .pipe(rsync({
			   		hostname: settings.productionHost,
					username: settings.productionUser,
					root: localStagingDir,
					destination: settings.productionPath + '/' + settings.themeURI,
					progress: true,
					incremental: true,
					relative: true,
					emptyDirectories: true,
					recursive: true,
					clean: true,
					exclude: []
				}));
});


// Browsersync
gulp.task('serve', (done) => {
	server.init({ proxy: settings.localStagingURI });
	done();
});

gulp.task('reload', (done) => {
	server.reload();
	done();
});



/*********************************************************************
	Bundled and watch tasks
 *********************************************************************/

gulp.task('watch', () => {
	gulp.watch('inc/css/main.css', gulp.series('styles', 'deployLocal'));
	gulp.watch('inc/js/main.js', gulp.series('scripts', 'deployLocal', 'reload'));
	gulp.watch('inc/img/src/*.{jpg,jpeg,png,svg,gif}', gulp.series('images', 'deployLocal', 'reload'));
	gulp.watch('build.json', gulp.series('themeDefinition', 'pot', 'deployLocal'));
	gulp.watch('**/*.php', gulp.series('deployLocal', 'reload'));
});


gulp.task('dev', gulp.series('themeDefinition', gulp.parallel('styles', 'scripts', 'images'), 'pot', 'deployLocal', 'serve', 'watch'));
gulp.task('build', gulp.series('themeDefinition', gulp.parallel('styles', 'scripts', 'images'), 'pot', 'deployLocal'));
gulp.task('default', gulp.series('dev'));



