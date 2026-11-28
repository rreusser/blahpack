#!/usr/bin/env node
'use strict';

// Codemod: type each lib/index.js default export as the routine together with
// the `ndarray` method `setReadOnly` attaches (ticket 0094). `tsc` cannot see a
// property added by a call, so without the type every `routine.ndarray( … )`
// in a caller is unchecked (or an error under `tsc -p tsconfig.callers.json`).
//
//   setReadOnly( dgetrf, 'ndarray', ndarray );
//   export default /** @type {typeof dgetrf & { ndarray: typeof ndarray }} */ ( dgetrf );
//
//   node bin/codemod-spec/main-type.cjs [--dry] [--check] [routine ...]

var fs = require( 'fs' );
var path = require( 'path' );

var ROOT = path.join( __dirname, '..', '..' );
var argv = process.argv.slice( 2 );
var DRY = argv.indexOf( '--dry' ) >= 0;
var CHECK = argv.indexOf( '--check' ) >= 0;
var only = argv.filter( function f( a ) {
	return a.charAt( 0 ) !== '-';
});

// The typed export statement for index.js source `src`, or null when the file
// does not attach an ndarray method.
function typedExport( src ) {
	var m = /setReadOnly\(\s*([\w$]+)\s*,\s*'ndarray'\s*,\s*([\w$]+)\s*\);/.exec( src );
	if ( !m ) {
		return null;
	}
	return { 'fn': m[ 1 ], 'stmt': 'export default /** @type {typeof ' + m[ 1 ] + ' & { ndarray: typeof ' + m[ 2 ] + ' }} */ ( ' + m[ 1 ] + ' );' };
}

function files() {
	var out = [];
	[ 'blas', 'lapack', 'arpack' ].forEach( function each( pkg ) {
		var dir = path.join( ROOT, 'lib', pkg );
		if ( !fs.existsSync( dir ) ) {
			return;
		}
		fs.readdirSync( dir ).forEach( function each( r ) {
			var f = path.join( dir, r, 'lib', 'index.js' );
			if ( fs.existsSync( f ) && ( !only.length || only.indexOf( r ) >= 0 ) ) {
				out.push( f );
			}
		});
	});
	return out;
}

var changed = [];
var missing = [];
files().forEach( function each( f ) {
	var src = fs.readFileSync( f, 'utf8' );
	var t = typedExport( src );
	var next;
	if ( !t ) {
		missing.push( path.relative( ROOT, f ) );
		return;
	}
	next = src.replace( /^export default .*;$/m, t.stmt );
	if ( next !== src ) {
		changed.push( path.relative( ROOT, f ) );
		if ( !DRY && !CHECK ) {
			fs.writeFileSync( f, next );
		}
	}
});
if ( missing.length ) {
	console.error( 'no setReadOnly( <routine>, \'ndarray\', … ): ' + missing.join( ', ' ) );
}
if ( CHECK ) {
	if ( changed.length ) {
		console.error( changed.length + ' index.js default exports untyped (fix: node bin/codemod-spec/main-type.cjs):\n  ' + changed.join( '\n  ' ) );
		process.exit( 1 );
	}
	console.log( 'index.js: every default export carries its ndarray type' );
} else {
	console.log( ( DRY ? 'would write: ' : 'written: ' ) + changed.length );
}
