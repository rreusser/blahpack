'use strict';

// CI-run checks must not read the reference Fortran sources.
//
// The sources under data/ (BLAS-3.12.0, lapack-3.12.0, arpack-ng-*) are
// gitignored and absent in CI. A check that reads them does not fail there; it
// silently does less, so CI goes green on violations a local run reports.
// (This happened: no-internal-workspace-alloc and two bin/conformance checks
// found 23 errors / 12 extra failing modules locally and none in CI.)
//
// Everything a check needs from Fortran comes from the committed parsed cache,
// data/fortran-signatures.json (via lint/lib/fortran-data.cjs or
// bin/conformance/util.js#fortranArgNames). Generating that cache is a
// developer-time step (bin/gen_fortran_signatures.js), never a CI one.
//
// Run:  node --test lint/no-fortran-source.test.cjs

var path = require( 'path' );
var fs = require( 'fs' );
var test = require( 'node:test' );
var assert = require( 'node:assert' );

var ROOT = path.join( __dirname, '..' );
var CI_CODE = [ 'lint', path.join( 'bin', 'conformance' ), path.join( 'bin', 'conformance.js' ) ];
var SOURCE_DIR_RE = /BLAS-3\.12\.0|lapack-3\.12\.0|arpack-ng-/;

function files( p, out ) {
	var full = path.join( ROOT, p );
	if ( fs.statSync( full ).isDirectory() ) {
		fs.readdirSync( full ).forEach( function forEach( name ) {
			if ( name !== 'node_modules' && name !== 'fixtures' ) {
				files( path.join( p, name ), out );
			}
		});
	} else if ( /\.(c|m)?js$/.test( p ) && full !== __filename ) {
		out.push( p );
	}
	return out;
}

test( 'CI-run code does not reference the gitignored Fortran sources', function t() {
	var offenders = [];
	CI_CODE.forEach( function forEach( p ) {
		files( p, [] ).forEach( function check( f ) {
			fs.readFileSync( path.join( ROOT, f ), 'utf8' ).split( '\n' ).forEach( function line( l, i ) {
				if ( SOURCE_DIR_RE.test( l ) ) {
					offenders.push( f + ':' + ( i + 1 ) + ': ' + l.trim() );
				}
			});
		});
	});
	assert.deepStrictEqual( offenders, [], 'Read data/fortran-signatures.json instead:\n' + offenders.join( '\n' ) );
});
