#!/usr/bin/env node

/**
 * Codemod: Split test.js into test.js + test.<routine>.js + test.ndarray.js
 *
 * - test.js: export checks, arity, .ndarray exists
 * - test.<routine>.js: layout wrapper validation + basic computation via <routine>.js
 * - test.ndarray.js: ndarray validation + all existing computation tests via ndarray.js/base.js
 *
 * Usage:
 *   node bin/codemod-split-tests.js [--dry-run] [--all | module-path...]
 */

'use strict';

var fs = require( 'fs' );
var path = require( 'path' );
var util = require( './gate/util.js' );

var STRING_DEFAULTS = {
	'order': '\'row-major\'',
	'trans': '\'no-transpose\'',
	'transa': '\'no-transpose\'',
	'transb': '\'no-transpose\'',
	'transr': '\'no-transpose\'',
	'uplo': '\'upper\'',
	'side': '\'left\'',
	'diag': '\'non-unit\'',
	'norm': '\'max\'',
	'range': '\'all\'',
	'job': '\'both\'',
	'jobvs': '\'V\'',
	'jobvl': '\'V\'',
	'jobvr': '\'V\'',
	'jobu': '\'A\'',
	'jobvt': '\'A\'',
	'jobz': '\'V\'',
	'compq': '\'V\'',
	'compz': '\'V\'',
	'fact': '\'N\'',
	'equed': '\'N\'',
	'sort': '\'N\'',
	'sense': '\'N\'',
	'direct': '\'forward\'',
	'storev': '\'columnwise\'',
	'vect': '\'Q\'',
	'howmny': '\'A\'',
	'way': '\'1\'',
	'normin': '\'N\'',
	'cmach': '\'E\'',
	'isgn': '1'
};

function defaultStringValue( name ) {
	return STRING_DEFAULTS[ name.toLowerCase() ] || null;
}

var LICENSE = [
	'/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */',
	'',
	'\'use strict\';'
].join( '\n' );

function extractExportedParams( content, filePath ) {
	if ( !content || !fs.existsSync( filePath ) ) {
		return null;
	}
	var c = fs.readFileSync( filePath, 'utf8' );
	var exportMatch = c.match( /module\.exports\s*=\s*(\w+)/ );
	var m;
	if ( exportMatch ) {
		var fnName = exportMatch[ 1 ];
		m = c.match( new RegExp( 'function\\s+' + fnName + '\\s*\\(\\s*([^)]+)\\)' ) );
	}
	if ( !m ) {
		m = c.match( /function\s+\w+\(\s*([^)]+)\)/ );
	}
	if ( !m ) {
		return null;
	}
	var params = m[ 1 ].split( /,\s*/ ).map( function( s ) { return s.trim(); });
	if ( params.length === 1 && params[ 0 ] === '' ) {
		return null;
	}
	return params;
}

// Generate test.js (main entry point tests)
function generateTestJS( routine, hasLayout ) {
	var lines = [];
	lines.push( LICENSE );
	lines.push( '' );
	lines.push( '// MODULES //' );
	lines.push( '' );
	lines.push( 'var test = require( \'node:test\' );' );
	lines.push( 'var assert = require( \'node:assert/strict\' );' );
	lines.push( 'var ' + routine + ' = require( \'./../lib\' );' );
	lines.push( '' );
	lines.push( '' );
	lines.push( '// TESTS //' );
	lines.push( '' );
	lines.push( 'test( \'main export is a function\', function t() {' );
	lines.push( '\tassert.strictEqual( typeof ' + routine + ', \'function\', \'main export is a function\' );' );
	lines.push( '});' );

	if ( hasLayout ) {
		lines.push( '' );
		lines.push( 'test( \'main export has an ndarray method\', function t() {' );
		lines.push( '\tassert.strictEqual( typeof ' + routine + '.ndarray, \'function\', \'has ndarray method\' );' );
		lines.push( '});' );
	}

	lines.push( '' );
	return lines.join( '\n' );
}

// Generate test.<routine>.js (layout wrapper tests)
function generateTestRoutine( routine, layoutParams ) {
	var lines = [];
	lines.push( LICENSE );
	lines.push( '' );
	lines.push( '// MODULES //' );
	lines.push( '' );
	lines.push( 'var test = require( \'node:test\' );' );
	lines.push( 'var assert = require( \'node:assert/strict\' );' );
	lines.push( 'var Float64Array = require( \'@stdlib/array/float64\' );' );
	lines.push( 'var ' + routine + ' = require( \'./../lib/' + routine + '.js\' );' );
	lines.push( '' );
	lines.push( '' );
	lines.push( '// TESTS //' );
	lines.push( '' );
	lines.push( 'test( \'' + routine + ' is a function\', function t() {' );
	lines.push( '\tassert.strictEqual( typeof ' + routine + ', \'function\', \'is a function\' );' );
	lines.push( '});' );
	lines.push( '' );
	lines.push( 'test( \'' + routine + ' has expected arity\', function t() {' );
	lines.push( '\tassert.strictEqual( ' + routine + '.length, ' + layoutParams.length + ', \'has expected arity\' );' );
	lines.push( '});' );

	// Add validation tests for string params
	var stringParams = layoutParams.filter( function( p ) {
		return /^(order|trans|transa|transb|uplo|side|diag|norm|transr|range|job|jobvs|jobvl|jobvr|jobu|jobvt|jobz|compq|compz|fact|equed|sort|sense|direct|storev|vect|howmny|way|normin|cmach|isgn)$/i.test( p );
	});

	stringParams.forEach( function( p, idx ) {
		var paramIdx = layoutParams.indexOf( p );
		lines.push( '' );
		lines.push( 'test( \'' + routine + ' throws TypeError for invalid ' + p + '\', function t() {' );
		lines.push( '\tassert.throws( function throws() {' );

		var args = layoutParams.map( function( lp, i ) {
			if ( i === paramIdx ) {
				return '\'invalid\'';
			}
			if ( defaultStringValue( lp ) ) {
				return defaultStringValue( lp );
			}
			if ( /^LD[A-Z]+$/.test( lp ) ) {
				return '2';
			}
			if ( /^stride/.test( lp ) ) {
				return '1';
			}
			if ( /^[A-Z]/.test( lp ) && lp.length > 1 ) {
				return 'new Float64Array( 4 )';
			}
			if ( /^[A-Z]$/.test( lp ) ) {
				return 'new Float64Array( 4 )';
			}
			return '2';
		});

		lines.push( '\t\t' + routine + '( ' + args.join( ', ' ) + ' );' );
		lines.push( '\t}, TypeError );' );
		lines.push( '});' );
	});

	// Add dimension validation tests
	var dimParams = layoutParams.filter( function( p ) {
		return /^[MNK]$|^nrhs$/.test( p );
	});

	dimParams.forEach( function( p ) {
		var paramIdx = layoutParams.indexOf( p );
		lines.push( '' );
		lines.push( 'test( \'' + routine + ' throws RangeError for negative ' + p + '\', function t() {' );
		lines.push( '\tassert.throws( function throws() {' );

		var args = layoutParams.map( function( lp, i ) {
			if ( i === paramIdx ) {
				return '-1';
			}
			if ( defaultStringValue( lp ) ) {
				return defaultStringValue( lp );
			}
			if ( /^LD[A-Z]+$/.test( lp ) ) {
				return '2';
			}
			if ( /^stride/.test( lp ) ) {
				return '1';
			}
			if ( /^[A-Z]/.test( lp ) && lp.length > 1 ) {
				return 'new Float64Array( 4 )';
			}
			if ( /^[A-Z]$/.test( lp ) ) {
				return 'new Float64Array( 4 )';
			}
			return '2';
		});

		lines.push( '\t\t' + routine + '( ' + args.join( ', ' ) + ' );' );
		lines.push( '\t}, RangeError );' );
		lines.push( '});' );
	});

	lines.push( '' );
	return lines.join( '\n' );
}

function splitTests( mod, dryRun ) {
	var testDir = path.join( mod.dir, 'test' );
	var testPath = path.join( testDir, 'test.js' );
	var routine = mod.routine;

	if ( !fs.existsSync( testPath ) ) {
		return { changed: false, reason: 'no test.js' };
	}

	// Check if already split
	if ( fs.existsSync( path.join( testDir, 'test.ndarray.js' ) ) ) {
		return { changed: false, reason: 'already split' };
	}

	var routinePath = path.join( mod.dir, 'lib', routine + '.js' );
	var ndarrayPath = path.join( mod.dir, 'lib', 'ndarray.js' );
	var basePath = path.join( mod.dir, 'lib', 'base.js' );
	var hasLayout = fs.existsSync( routinePath );
	var hasNdarray = fs.existsSync( ndarrayPath );


	var layoutParams = null;
	if ( hasLayout ) {
		var routineContent = fs.readFileSync( routinePath, 'utf8' );
		layoutParams = extractExportedParams( routineContent, routinePath );
	}

	// Read existing test.js
	var originalContent = fs.readFileSync( testPath, 'utf8' );

	// The existing test.js becomes test.ndarray.js
	// Keep the require pointing at base.js — the computation tests were written
	// for base.js behavior (no validation). test.ndarray.js tests the ndarray API
	// computation, while validation tests go in the existing ndarray blocks.
	var ndarrayTestContent = originalContent;

	// Keep the ndarrayFn import — it tests the ndarray.js validation layer
	// which differs from base.js. No renaming needed.

	if ( dryRun ) {
		return { changed: true, files: [ 'test.js', 'test.ndarray.js', hasLayout ? 'test.' + routine + '.js' : null ].filter( Boolean ) };
	}

	// Write test.ndarray.js (the original tests, now pointing at ndarray.js)
	fs.writeFileSync( path.join( testDir, 'test.ndarray.js' ), ndarrayTestContent );

	// Write new test.js (entry point)
	fs.writeFileSync( testPath, generateTestJS( routine, hasLayout ) );

	// Write test.<routine>.js (layout wrapper tests) if layout exists
	if ( hasLayout && layoutParams && layoutParams.length > 0 ) {
		fs.writeFileSync(
			path.join( testDir, 'test.' + routine + '.js' ),
			generateTestRoutine( routine, layoutParams )
		);
	}

	return {
		changed: true,
		files: [ 'test.js', 'test.ndarray.js', hasLayout ? 'test.' + routine + '.js' : null ].filter( Boolean )
	};
}

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
		console.error( 'Usage: node bin/codemod-split-tests.js [--dry-run] [--all | module-path...]' );
		process.exit( 1 );
	}

	var changed = 0;
	var skipped = 0;
	var errors = [];

	modules.forEach( function( mod ) {
		try {
			var result = splitTests( mod, dryRun );
			if ( result.changed ) {
				changed++;
				if ( dryRun ) {
					console.log( mod.routine + ': ' + result.files.join( ', ' ) );
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
