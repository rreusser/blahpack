#!/usr/bin/env node

/**
 * Codemod: Add stride != 0 checks to BLAS L2/L3 ndarray.js files.
 *
 * Checks all 1D array strides (strideX, strideY) and 2D array strides
 * (strideA1, strideA2, etc.) for non-zero.
 *
 * Usage:
 *   node bin/codemod-stride-checks.js [--dry-run] [--all | module-path...]
 */

'use strict';

var fs = require( 'fs' );
var path = require( 'path' );
var util = require( './gate/util.js' );

var ORDINALS = [
	'', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth',
	'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth',
	'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth',
	'Eighteenth', 'Nineteenth', 'Twentieth', 'Twenty-first', 'Twenty-second',
	'Twenty-third', 'Twenty-fourth', 'Twenty-fifth', 'Twenty-sixth',
	'Twenty-seventh', 'Twenty-eighth', 'Twenty-ninth', 'Thirtieth'
];

function ordinal( n ) {
	return ORDINALS[ n ] || ( n + 'th' );
}

// BLAS Level 1 routines — skip these
var BLAS_L1 = new Set([
	'dasum', 'daxpy', 'dcabs1', 'dcopy', 'ddot', 'dnrm2', 'drot', 'drotg',
	'drotm', 'drotmg', 'dscal', 'dsdot', 'dswap', 'dzasum', 'dznrm2',
	'idamax', 'izamax', 'zaxpy', 'zcopy', 'zdotc', 'zdotu', 'zdrot',
	'zdscal', 'zscal', 'zswap'
]);

function extractExportedParams( content ) {
	var exportMatch = content.match( /module\.exports\s*=\s*(\w+)/ );
	var m;
	if ( exportMatch ) {
		var fnName = exportMatch[ 1 ];
		m = content.match( new RegExp( 'function\\s+' + fnName + '\\s*\\(\\s*([^)]+)\\)' ) );
	}
	if ( !m ) {
		m = content.match( /function\s+\w+\(\s*([^)]+)\)/ );
	}
	if ( !m ) {
		return null;
	}
	return m[ 1 ].split( /,\s*/ ).map( function( s ) { return s.trim(); });
}

function codemod( filePath, dryRun ) {
	var content = fs.readFileSync( filePath, 'utf8' );
	var params = extractExportedParams( content );
	if ( !params ) {
		return { changed: false, reason: 'no signature' };
	}

	// Find all stride params
	var strideParams = params.filter( function( p ) {
		return /^stride/.test( p ) && p !== 'stride';
	});

	if ( strideParams.length === 0 ) {
		return { changed: false, reason: 'no stride params' };
	}

	// Filter to ones not already checked
	var unchecked = strideParams.filter( function( sp ) {
		return !new RegExp( sp + '\\s*===\\s*0' ).test( content );
	});

	if ( unchecked.length === 0 ) {
		return { changed: false, reason: 'all strides already checked' };
	}

	// Ensure format is imported
	var modified = content;
	if ( modified.indexOf( 'format' ) < 0 ) {
		var baseReq = /var base = require\( '\.\/base\.js' \);/;
		if ( baseReq.test( modified ) ) {
			modified = modified.replace( baseReq,
				'var format = require( \'@stdlib/string/format\' );\n' +
				'var base = require( \'./base.js\' );'
			);
		}
	}

	// Build stride check lines
	var checks = [];
	var i, sp, idx;
	for ( i = 0; i < unchecked.length; i++ ) {
		sp = unchecked[ i ];
		idx = params.indexOf( sp ) + 1;
		checks.push( '\tif ( ' + sp + ' === 0 ) {' );
		checks.push( '\t\tthrow new RangeError( format( \'invalid argument. ' + ordinal( idx ) + ' argument must be non-zero. Value: `%d`.\', ' + sp + ' ) );' );
		checks.push( '\t}' );
	}

	// Insert before `return base(` or `base(`
	var insertPattern = /(\treturn base\(|\tbase\()/;
	var insertMatch = modified.match( insertPattern );
	if ( !insertMatch ) {
		return { changed: false, reason: 'could not find insertion point' };
	}

	modified = modified.replace( insertPattern, checks.join( '\n' ) + '\n' + insertMatch[ 1 ] );

	if ( !dryRun ) {
		fs.writeFileSync( filePath, modified );
	}

	return {
		changed: true,
		checks: unchecked
	};
}

function main() {
	var args = process.argv.slice( 2 );
	var dryRun = args.indexOf( '--dry-run' ) >= 0;
	var all = args.indexOf( '--all' ) >= 0;
	args = args.filter( function( a ) { return a !== '--dry-run' && a !== '--all'; });

	var modules;
	if ( all ) {
		modules = util.discoverModules().filter( function( m ) {
			// Only BLAS L2/L3
			return m.pkg === 'blas' && !BLAS_L1.has( m.routine );
		});
	} else if ( args.length > 0 ) {
		modules = args.map( function( a ) { return util.resolveModule( a ); }).filter( Boolean );
	} else {
		console.error( 'Usage: node bin/codemod-stride-checks.js [--dry-run] [--all | module-path...]' );
		process.exit( 1 );
	}

	var changed = 0;
	var skipped = 0;
	var errors = [];

	modules.forEach( function( mod ) {
		var fp = path.join( mod.dir, 'lib', 'ndarray.js' );
		if ( !fs.existsSync( fp ) ) {
			skipped++;
			return;
		}
		try {
			var result = codemod( fp, dryRun );
			if ( result.changed ) {
				changed++;
				if ( dryRun ) {
					console.log( mod.routine + ': ' + result.checks.join( ', ' ) );
				}
			} else {
				skipped++;
			}
		} catch ( e ) {
			errors.push( mod.routine + ': ' + e.message );
		}
	});

	console.log( '\nChanged: ' + changed + ', Skipped: ' + skipped );
	if ( errors.length > 0 ) {
		console.log( 'Errors:' );
		errors.forEach( function( e ) { console.log( '  ' + e ); });
	}
	if ( dryRun ) {
		console.log( '(dry run)' );
	}
}

main();
