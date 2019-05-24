const path = require('path');
const stream = require('stream');
const through2 = require('through2');
const gulp = require('gulp');
const Vinyl = require('vinyl');
const pump = require('pump');
const merge = require('merge2');
const tar = require('gulp-tar');
const gzip = require('gulp-gzip');
const file = require('gulp-file');
const replace = require('gulp-replace');
const rename = require('gulp-rename');

/**
 * Return a transform stream that create a Debian package from debian-binary, control.tar and data.tar files.
 * @param {string} name The name of the .deb file to create
 * @return {stream.TransformStream}
 */
function deb(name) {
    const files = [];

    return through2({objectMode: true}, (file, enc, callback) => {
        files.push(file);
        callback(null, file);
    }, function (callback) { (async () => {
        if (files.length !== 3) throw new Error('Must have three files');
        if (!files[0].path.match(/\/debian-binary$/)) throw new Error('Missing debian-binary file');
        if (!files[1].path.match(/\/control\.tar(\.gz)?$/)) throw new Error('Missing control archive');
        if (!files[2].path.match(/\/data\.tar(\.gz)?$/)) throw new Error('Missing data archive');

        const contents = new stream.Readable();
        contents._read = () => {};

        const debfile = new Vinyl({
            cwd: '/',
            base: '/',
            path: '/' + name,
            contents
        });

        // console.log('Returning deb', debfile, files);

        contents.push('!<arch>' + String.fromCharCode(0x0A)); // Signature

        for (const [index, file] of files.entries()) {
            // console.log(file, index, file.stat);

            const size = file.stat ? file.stat.size.toString() : file.contents && file.contents.length ? file.contents.length : 0;

            contents.push(rightPaddedWithSpaces(16, path.basename(file.path)));  // Filename (ASCII, 16 bytes long)
            contents.push(rightPaddedWithSpaces(12, (Math.floor(file.stat ? file.stat.mtime / 1000 : 0)).toString())); // File modification timestamp (Decimal, 12 bytes long)
            contents.push(rightPaddedWithSpaces(6, '0')); // Owner ID (Decimal, 6 bytes long)
            contents.push(rightPaddedWithSpaces(6, '0')); // Group ID (Decimal, 6 bytes long)
            contents.push(rightPaddedWithSpaces(8, '100644')); // File mode (Octal, 8 bytes long)
            contents.push(rightPaddedWithSpaces(10, size.toString())); // File size in bytes (Decimal, 10 bytes long)
            contents.push(String.fromCharCode(0x60) + String.fromCharCode(0x0A)); // Ending characters ("0x60 0x0A")

            // stream.write(file.contents);
            if (file.isStream()) await new Promise((resolve, reject) => {
                file.contents.on('data', data => contents.push(data));
                // file.contents.pipe(contents);
                file.contents.on('end', resolve);
                file.contents.on('error', reject);
            }); else contents.push(file.contents);

            // If the data for an archive member ends at an odd byte offset, then a padding byte with value 0x0A is
            // used to position the next archive header on an even byte offset.
            if (size % 2 === 1 && index !== 2) {
                contents.push(String.fromCharCode(0x0A));
            }
        }

        contents.push(null);

        this.push(debfile);
        callback();
    })().catch(err => {
        console.error(err);
        callback(err);
    }); });
}

function rightPaddedWithSpaces(n, string) {
    if (!string) string = '';
    if (string.length > n) throw new Error('string is longer than n padding');
    return string + (new Array(n - string.length + 1)).join(String.fromCharCode(0x20));
}

/**
 * Creates a Debian package.
 * @param {string} name
 * @param {string} datafiles Path to the data directory
 * @param {string} dataprefix The directory the files in the data directory should be unpacked to when installing
 * @param {string} controlfiles Path to the control directory
 * @param {Object<string, string>} [controlvars] Variables to replace in the control files
 * @return {stream.TransformStream}
 */
function mkdeb(name, datafiles, dataprefix, controlfiles, controlvars) {
    return pump([
        merge([
            file('debian-binary', '2.0\n', {src: true}),
            pump([
                gulp.src(controlfiles),
                ...Object.keys(controlvars || {}).map(k => replace(`\${${k}}`, controlvars[k])),
                tar('control.tar'),
                gzip()
            ]),
            pump([
                gulp.src(datafiles),
                rename(p => p.dirname = dataprefix + '/' + p.dirname),
                tar(name + '.tar'),
                gzip(),
                gulp.dest('release')
            ])
        ]),

        rename(p => p.basename = p.basename === name ? 'data' : p.basename === name + '.tar' ? 'data.tar' : p.basename),
        deb(name + '.deb'),
        gulp.dest('release')
    ]);
}

exports.deb = deb;
exports.mkdeb = mkdeb;
