import gulp from 'gulp';
import pump from 'pump';
import del from 'del';
import copy from 'gulp-copy';
import rename from 'gulp-rename';
import inject from 'gulp-inject-string';
import replace from 'gulp-replace';
import copydeps from './scripts/copydeps';
import file from 'gulp-file';
import editjson from 'gulp-json-editor';

import corepkg from './core/package';
import clientpkg from './client/package';
import editorpkg from './editor/package';

// core-release >

gulp.task('core-main', function() {
    return pump([
        gulp.src('core/dist/main.js'),
        replace('/*PRODUCTION*/', 'const PRODUCTION = true;'),
        rename(`core.${corepkg.version}.js`),
        gulp.dest('release/core')
    ]);
});

gulp.task('core-pkg', function() {
    return pump([
        gulp.src('core/package.json'),
        editjson(function(pkg) {
            pkg.main = `core.${corepkg.version}.js`;
            delete pkg.devDependencies;
            delete pkg.scripts;
            return pkg;
        }),
        gulp.dest('release/core')
    ]);
});

gulp.task('core-modules', function() {
    return pump([
        gulp.src('core/dist/modules/**/*'),
        copy('release/core', { prefix: 2 })
    ]);
});

gulp.task('core-sparkplug', function() {
    return pump([
        gulp.src('core/dist/sparkplug.js'),
        gulp.dest('release/core')
    ]);
});

gulp.task('core-extras', function() {
    return pump([
        gulp.src(['core/src/csp.json']),
        gulp.dest('release/core')
    ]);
});

gulp.task('core-release', gulp.parallel('core-main', 'core-pkg', 'core-sparkplug', 'core-modules', 'core-extras'));

// < core-release

// client

gulp.task('client-main', function() {
    return pump([
        gulp.src('client/dist/*.client-release.js'),
        rename(`client.${clientpkg.version}.js`),
        gulp.dest('release/client')
    ]);
});

gulp.task('client-pkg', function() {
    return pump([
        gulp.src('client/package.json'),
        editjson(function (pkg) {
            pkg.main = `client.${clientpkg.version}.js`;
            delete pkg.scripts;
            return pkg;
        }),
        gulp.dest('release/client')
    ]);
});

gulp.task('client-release', gulp.parallel('client-main', 'client-pkg'));

// Editor

gulp.task('editor-main', function() {
    return pump([
        gulp.src('editor/dist/editor.release.js'),
        rename(`editor.${editorpkg.version}.js`),
        gulp.dest('release/editor')
    ]);
});

gulp.task('editor-pkg', function() {
    return pump([
        gulp.src('editor/package.json'),
        editjson(function(pkg) {
            pkg.main = `editor.${editorpkg.version}.js`;
            delete pkg.scripts;
            return pkg;
        }),
        gulp.dest('release/editor')
    ]);
});

gulp.task('editor-release', gulp.parallel('editor-main', 'editor-pkg'));

// Deps

gulp.task('node-modules', function() {
    return pump([
        gulp.src(copydeps({ignore: ['fsevents']}), { base: '.' }),
        gulp.dest('./release/core')
    ]);
});

gulp.task('node-sass-bindings', gulp.series(function() {
    return del(['release/node_modules/node-sass/vendor']);
}, function() {
    return pump([
        gulp.src('other/node_sass_bindings/**/*'),
        copy('release/core/node_modules/node-sass/vendor', { prefix: 2 })
    ]);
}));

gulp.task('keytar-bindings', gulp.series(function() {
    return del(['release/node_modules/keytar/build']);
}, function() {
    return pump([
        gulp.src('other/keytar/**/*'),
        copy('release/core/node_modules/keytar/build/Release', { prefix: 2 })
    ]);
}));

// Other

gulp.task('del-release', function() {
    return del(['release/**/*']);
});

gulp.task('dependencies', gulp.series('node-modules', gulp.parallel('node-sass-bindings', 'keytar-bindings')));
gulp.task('build-release', gulp.parallel('core-release', 'client-release', 'editor-release', 'dependencies'));
gulp.task('release', gulp.series('del-release', 'build-release'));
