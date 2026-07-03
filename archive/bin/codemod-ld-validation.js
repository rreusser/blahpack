#!/usr/bin/env node

/**
 * Codemod: Add leading dimension validation to <routine>.js files.
 *
 * Rules:
 * - N×N matrix (dims=N only): LDA >= max(1, N)
 * - M×N matrix with order, no transpose: row-major LDA >= max(1, N), col-major LDA >= max(1, M)
 * - M×N matrix without order: LDA >= max(1, M) (column-major assumed)
 * - With transpose: the "rows" dimension depends on trans value
 *
 * Usage:
 *   node bin/codemod-ld-validation.js [--dry-run] [--all | module-path...]
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
	'Twenty-third', 'Twenty-fourth', 'Twenty-fifth'
];

function ordinal( n ) {
	return ORDINALS[ n ] || ( n + 'th' );
}

function extractParams( content ) {
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
	return m[ 1 ].split( /,\s*/ ).map( function( s ) {
		return s.trim();
	});
}

/**
 * Determine the LD check for a given LD param.
 * Returns { dim: 'N', condition: 'LDA >= max(1, N)' } or null if can't determine.
 */
function determineLDCheck( ldParam, params, hasOrder ) {
	// Extract the matrix letter from LD<X> (e.g., LDA → A, LDAB → AB)
	var matrixName = ldParam.replace( /^LD/, '' );

	var dims = params.filter( function( p ) { return /^[MNK]$/.test( p ); });
	var hasM = dims.indexOf( 'M' ) >= 0;
	var hasN = dims.indexOf( 'N' ) >= 0;
	var hasK = dims.indexOf( 'K' ) >= 0;

	// For square matrices (N only): LDA >= max(1, N)
	if ( !hasM && hasN && !hasK ) {
		return { dim: 'N' };
	}

	// For M×N matrices without transpose:
	// Row-major: LDA >= max(1, N) (columns)
	// Column-major: LDA >= max(1, M) (rows)
	// Without order (Fortran column-major): LDA >= max(1, M)
	if ( hasM && hasN ) {
		if ( !hasOrder ) {
			return { dim: 'M' };
		}
		// With order: need to insert inside the order branches
		return { rowMajorDim: 'N', colMajorDim: 'M' };
	}

	// For N×K matrices: LDA >= max(1, N) typically
	if ( hasN && hasK && !hasM ) {
		return { dim: 'N' };
	}

	return null;
}

function codemodRoutine( filePath, routine, dryRun ) {
	var content = fs.readFileSync( filePath, 'utf8' );
	var params = extractParams( content );
	if ( !params ) {
		return { changed: false, reason: 'no signature' };
	}

	// Find LD params
	var ldParams = params.filter( function( p ) { return /^LD[A-Z]+$/.test( p ); });
	if ( ldParams.length === 0 ) {
		return { changed: false, reason: 'no LD params' };
	}

	// Already has LD validation?
	var allHaveChecks = ldParams.every( function( ld ) {
		return new RegExp( ld + '\\s*<\\s*max' ).test( content ) ||
			new RegExp( ld + '\\s*<\\s*[MNK]' ).test( content );
	});
	if ( allHaveChecks ) {
		return { changed: false, reason: 'already validated' };
	}

	var hasOrder = params.indexOf( 'order' ) >= 0;
	var modified = content;
	var addedChecks = [];
	var needsMax = false;

	// Ensure 'max' is imported
	if ( !/var max = require/.test( content ) && !/fast\/max/.test( content ) ) {
		needsMax = true;
	}

	// Build LD checks for each LD param
	var i, ld, check, ldIdx, validationLines;
	for ( i = 0; i < ldParams.length; i++ ) {
		ld = ldParams[ i ];
		ldIdx = params.indexOf( ld ) + 1;

		// Skip if already checked
		if ( new RegExp( ld + '\\s*<\\s*max' ).test( content ) ||
			new RegExp( ld + '\\s*<\\s*[MNK]' ).test( content ) ) {
			continue;
		}

		check = determineLDCheck( ld, params, hasOrder );
		if ( !check ) {
			continue; // Can't determine rule
		}

		if ( check.dim ) {
			// Simple case: LDA >= max(1, N)
			validationLines = [
				'\tif ( ' + ld + ' < max( 1, ' + check.dim + ' ) ) {',
				'\t\tthrow new RangeError( format( \'invalid argument. ' + ordinal( ldIdx ) + ' argument must be greater than or equal to max(1,' + check.dim + '). Value: `%d`.\', ' + ld + ' ) );',
				'\t}'
			];

			// Insert after the last dimension validation or after string validation
			// Find the right place: after the last throw before the order/stride block
			var insertPattern;
			if ( hasOrder ) {
				// Insert before `if ( order ===` or `if ( isColumnMajor` or `if ( isRowMajor`
				insertPattern = /(\n)(\t(?:if \( order ===|if \( isColumnMajor|if \( isRowMajor|var isrm|iscm = |isrm = ))/;
			} else {
				// Insert before `return base(`
				insertPattern = /(\n)(\treturn base\(|\tbase\()/;
			}
			var im = modified.match( insertPattern );
			if ( im ) {
				modified = modified.replace( insertPattern, '\n' + validationLines.join( '\n' ) + '\n' + im[ 2 ] );
				addedChecks.push( ld + ' >= max(1, ' + check.dim + ')' );
			}
		} else if ( check.rowMajorDim && check.colMajorDim ) {
			// Order-dependent: need to insert inside the existing order branches
			// This is more complex — for now, insert before the stride computation
			// as a combined check
			validationLines = [
				'\tif ( order === \'row-major\' && ' + ld + ' < max( 1, ' + check.rowMajorDim + ' ) ) {',
				'\t\tthrow new RangeError( format( \'invalid argument. ' + ordinal( ldIdx ) + ' argument must be greater than or equal to max(1,' + check.rowMajorDim + '). Value: `%d`.\', ' + ld + ' ) );',
				'\t}',
				'\tif ( order === \'column-major\' && ' + ld + ' < max( 1, ' + check.colMajorDim + ' ) ) {',
				'\t\tthrow new RangeError( format( \'invalid argument. ' + ordinal( ldIdx ) + ' argument must be greater than or equal to max(1,' + check.colMajorDim + '). Value: `%d`.\', ' + ld + ' ) );',
				'\t}'
			];

			var insertPattern2 = /(\n)(\t(?:if \( order ===|if \( isColumnMajor|if \( isRowMajor|var isrm|iscm = |isrm = ))/;
			var im2 = modified.match( insertPattern2 );
			if ( im2 ) {
				modified = modified.replace( insertPattern2, '\n' + validationLines.join( '\n' ) + '\n' + im2[ 2 ] );
				addedChecks.push( ld + ' >= max(1, ' + check.rowMajorDim + '/' + check.colMajorDim + ')' );
			}
		}
	}

	if ( addedChecks.length === 0 ) {
		return { changed: false, reason: 'could not determine LD rules' };
	}

	// Add max import if needed
	if ( needsMax && addedChecks.length > 0 ) {
		var baseReq = /var base = require\( '\.\/base\.js' \);/;
		if ( baseReq.test( modified ) ) {
			modified = modified.replace( baseReq,
				'var max = require( \'@stdlib/math/base/special/fast/max\' );\n' +
				'var base = require( \'./base.js\' );'
			);
		}
	}

	if ( !dryRun ) {
		fs.writeFileSync( filePath, modified );
	}

	return {
		changed: true,
		checks: addedChecks
	};
}

// ── Main ──

function main() {
	var args = process.argv.slice( 2 );
	var dryRun = args.indexOf( '--dry-run' ) >= 0;
	var all = args.indexOf( '--all' ) >= 0;
	args = args.filter( function( a ) { return a !== '--dry-run' && a !== '--all'; });

	var modules;
	if ( all ) {
		modules = util.discoverModules();
	} else if ( args.length > 0 ) {
		modules = args.map( function( a ) { return util.resolveModule( a ); }).filter( Boolean );
	} else {
		console.error( 'Usage: node bin/codemod-ld-validation.js [--dry-run] [--all | module-path...]' );
		process.exit( 1 );
	}

	var changed = 0;
	var skipped = 0;
	var errors = [];

	modules.forEach( function( mod ) {
		var fp = path.join( mod.dir, 'lib', mod.routine + '.js' );
		if ( !fs.existsSync( fp ) ) {
			return;
		}
		try {
			var result = codemodRoutine( fp, mod.routine, dryRun );
			if ( result.changed ) {
				changed++;
				if ( dryRun ) {
					console.log( mod.routine + '.js: ' + result.checks.join( ', ' ) );
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
		console.log( 'Errors (' + errors.length + '):' );
		errors.forEach( function( e ) { console.log( '  ' + e ); });
	}
	if ( dryRun ) {
		console.log( '(dry run)' );
	}
}

main();
