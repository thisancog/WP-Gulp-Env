# WP-Gulp-Env
A Gulp environment to build and deploy Wordpress themes.

I needed a simple Gulp-based collection of tasks to develop Wordpress themes in a local dev directory, automatically deploy to a local staging environment and finally push to the production server. So far, this includes CSS-, JavaScript- and image minification including watch tasks, browser sync, and automatic generation of style.css and .pot files.

### Before you get started

Copy build-default.json as build.json and fill in the settings documented below.


### Settings
build.json holds several settings, both general for this tool and information for style.css:

* localStagingDir: the path to the local staging directory, i.e. from where MAMP or the like runs, down to the themes folder
* localStagingURI: the URI the local staging server runs on
* productionHost: the FTP host for the production server
* productionUser: the FTP user for the production server
* productionPath: the path to the themes folder on the production server
* [according to WP theme development guidelines](https://developer.wordpress.org/themes/basics/main-stylesheet-style-css/): name, themeURI, author, authorURI, description, version, license, licenseURI, textDomain

### Tasks

Several tasks can be run from the CLI. See gulpfile.js for a complete overview.

* `$ gulp dev`: default task which runs all minification tasks, generates a .pot file, deploys to the local staging server, runs browser sync and watches for changes
* `$ gulp build`: all of the above but does not run browser sync nor watches for changes
* `$ gulp deployProduction`: deploys the contents of the staging environment to the production server. Prompts for confirmation and for the password to access the FTP server specified in build.json
