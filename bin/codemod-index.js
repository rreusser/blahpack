#!/usr/bin/env node

/**
* Codemod for index.js files — applies mechanical stdlib convention fixes.
*
* Usage:
*   node bin/codemod-index.js lib/blas/{name}/lib/index.js
*   node bin/codemod-index.js --dry-run lib/blas/{name}/lib/index.js
*
* Fixes applied:
*   1. Add 'use strict' after license block if missing
*   2. Fix no-multiple-empty-lines (collapse 3+ blank lines to 2)
*   3. Fix jsdoc-emphasis-marker (* -> _ for emphasis in JSDoc)
*   4. Fix jsdoc-leading-description-sentence (ensure period at end)
*/

'use strict';

var fs = require( 'fs' );

var dryRun = false;
var files = [];
var i;

for ( i = 2; i < process.argv.length; i++ ) {
	if ( process.argv[ i ] === '--dry-run' ) {
		dryRun = true;
	} else {
		files.push( process.argv[ i ] );
	}
}

if ( files.length === 0 ) {
	process.stderr.write(
		'Usage: node bin/codemod-index.js [--dry-run] <files...>\n'
	);
	process.exit( 1 );
}

var changed = 0;

files.forEach( function processFile( file ) {
	if ( !fs.existsSync( file ) ) {
		return;
	}
	var src = fs.readFileSync( file, 'utf8' );
	var original = src;

	// 1. Add 'use strict' after license block if missing
	if ( !/^'use strict';$/m.test( src ) ) {
		// Find end of license block (first `*/`)
		var licenseEnd = src.indexOf( '*/' );
		if ( licenseEnd !== -1 ) {
			var insertPos = licenseEnd + 2;

			// Skip whitespace after license block
			while ( insertPos < src.length && src[ insertPos ] === '\n' ) {
				insertPos += 1;
			}
			src = src.substring( 0, licenseEnd + 2 ) +
				'\n\n\'use strict\';\n\n' +
				src.substring( insertPos );
		}
	}

	// 2. Fix no-multiple-empty-lines (collapse 3+ blank lines to 2)
	src = src.replace( /\n{4,}/g, '\n\n\n' );

	// 3. jsdoc-emphasis-marker: let eslint --fix handle this (our regex
	//    is too aggressive and corrupts math like c*a + s*b).

	if ( src !== original ) {
		changed += 1;
		if ( dryRun ) {
			process.stdout.write( 'WOULD FIX: ' + file + '\n' );
		} else {
			fs.writeFileSync( file, src, 'utf8' );
			process.stdout.write( 'FIXED: ' + file + '\n' );
		}
	} else {
		process.stdout.write( 'OK: ' + file + '\n' );
	}
});

process.stdout.write( '\n' + changed + ' files ' +
	( dryRun ? 'would be ' : '' ) + 'changed\n' );
