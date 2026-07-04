#!/usr/bin/env node

/**
 * Codemod: Add string param validation and dimension validation to <routine>.js
 * and ndarray.js files.
 *
 * For <routine>.js: adds string enum validation (TypeError) and dimension
 * validation (RangeError) after the existing isLayout check.
 *
 * For ndarray.js: adds dimension validation (RangeError) before the call to base.
 *
 * Usage:
 *   node bin/codemod-routine-validation.js [--dry-run] [module-path...]
 *   node bin/codemod-routine-validation.js --all [--dry-run]
 */

'use strict';

var fs = require( 'fs' );
var path = require( 'path' );
var util = require( './gate/util.js' );

// ── Configuration ──

var STRING_PARAMS = {
	'trans': {
		validator: 'isMatrixTranspose',
		require: '@stdlib/blas/base/assert/is-transpose-operation',
		label: 'a valid transpose operation'
	},
	'transa': {
		validator: 'isMatrixTranspose',
		require: '@stdlib/blas/base/assert/is-transpose-operation',
		label: 'a valid transpose operation'
	},
	'transb': {
		validator: 'isMatrixTranspose',
		require: '@stdlib/blas/base/assert/is-transpose-operation',
		label: 'a valid transpose operation'
	},
	'uplo': {
		validator: 'isMatrixTriangle',
		require: '@stdlib/blas/base/assert/is-matrix-triangle',
		label: 'a valid matrix triangle'
	},
	'side': {
		validator: 'isOperationSide',
		require: '@stdlib/blas/base/assert/is-operation-side',
		label: 'a valid operation side'
	},
	'diag': {
		validator: 'isDiagonalType',
		require: '@stdlib/blas/base/assert/is-diagonal-type',
		label: 'a valid diagonal type'
	}
};

var DIMENSION_PARAMS = new Set([ 'M', 'N', 'K', 'nrhs' ]);

var ORDINALS = [
	'', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth',
	'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth',
	'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth',
	'Eighteenth', 'Nineteenth', 'Twentieth'
];

function ordinal( n ) {
	return ORDINALS[ n ] || ( n + 'th' );
}

// ── Helpers ──

function extractParams( content ) {
	var m = content.match( /function\s+\w+\(\s*([^)]+)\)/ );
	if ( !m ) {
		return null;
	}
	return m[ 1 ].split( /,\s*/ ).map( function( s ) {
		return s.trim();
	});
}

function detectStringParams( params ) {
	var result = [];
	var i, lower;
	for ( i = 0; i < params.length; i++ ) {
		lower = params[ i ].toLowerCase();
		if ( lower !== 'order' && STRING_PARAMS[ lower ] ) {
			result.push({
				name: params[ i ],
				index: i,
				config: STRING_PARAMS[ lower ]
			});
		}
	}
	return result;
}

function detectDimensionParams( params ) {
	var result = [];
	var i;
	for ( i = 0; i < params.length; i++ ) {
		if ( DIMENSION_PARAMS.has( params[ i ] ) ) {
			result.push({
				name: params[ i ],
				index: i
			});
		}
	}
	return result;
}

// ── Codemod: routine.js string + dimension validation ──

function codemodRoutine( filePath, dryRun ) {
	var content = fs.readFileSync( filePath, 'utf8' );
	var params = extractParams( content );
	if ( !params ) {
		return { changed: false, reason: 'no function signature' };
	}

	var stringParams = detectStringParams( params );
	var dimParams = detectDimensionParams( params );

	if ( stringParams.length === 0 && dimParams.length === 0 ) {
		return { changed: false, reason: 'nothing to add' };
	}

	// Check what's already there
	var hasAllStrings = stringParams.every( function( sp ) {
		return content.indexOf( sp.config.validator ) >= 0;
	});
	var hasAllDims = dimParams.every( function( dp ) {
		return new RegExp( dp.name + '\\s*<\\s*0' ).test( content );
	});

	if ( hasAllStrings && hasAllDims ) {
		return { changed: false, reason: 'already has all validation' };
	}

	var modified = content;
	var addedRequires = [];
	var addedChecks = [];

	// 0. Ensure format is imported
	if ( modified.indexOf( 'format' ) < 0 && ( stringParams.length > 0 || dimParams.length > 0 ) ) {
		var baseReqPattern = /var base = require\( '\.\/base\.js' \);/;
		if ( baseReqPattern.test( modified ) ) {
			modified = modified.replace( baseReqPattern, 'var format = require( \'@stdlib/string/format\' );\n' + 'var base = require( \'./base.js\' );' );
		}
	}

	// 1. Add missing requires
	var i, sp;
	var requiredValidators = new Set();
	for ( i = 0; i < stringParams.length; i++ ) {
		sp = stringParams[ i ];
		if ( content.indexOf( sp.config.validator ) < 0 ) {
			requiredValidators.add( sp.config.require + ':' + sp.config.validator );
		}
	}

	requiredValidators.forEach( function( entry ) {
		var parts = entry.split( ':' );
		var req = parts[ 0 ];
		var validatorName = parts[ 1 ];
		var requireLine = 'var ' + validatorName + ' = require( \'' + req + '\' );';

		// Insert after the last require line before // MAIN //
		if ( modified.indexOf( validatorName ) < 0 ) {
			// Find the line with `var base = require`
			var baseRequirePattern = /var base = require\( '\.\/base\.js' \);/;
			var m = modified.match( baseRequirePattern );
			if ( m ) {
				modified = modified.replace( baseRequirePattern, requireLine + '\n' + m[ 0 ] );
				addedRequires.push( validatorName );
			}
		}
	});

	// 2. Build validation code to insert after isLayout check
	var validationLines = [];

	// String param checks (only missing ones)
	for ( i = 0; i < stringParams.length; i++ ) {
		sp = stringParams[ i ];
		if ( content.indexOf( sp.config.validator ) >= 0 ) {
			continue; // already validated
		}
		var argOrd = ordinal( sp.index + 1 ).toLowerCase();
		validationLines.push( '\tif ( !' + sp.config.validator + '( ' + sp.name + ' ) ) {' );
		validationLines.push( '\t\tthrow new TypeError( format( \'invalid argument. ' + ordinal( sp.index + 1 ) + ' argument must be ' + sp.config.label + '. Value: `%s`.\', ' + sp.name + ' ) );' );
		validationLines.push( '\t}' );
		addedChecks.push( sp.name + ' (TypeError)' );
	}

	// Dimension checks (only missing ones)
	var dp;
	for ( i = 0; i < dimParams.length; i++ ) {
		dp = dimParams[ i ];
		if ( new RegExp( dp.name + '\\s*<\\s*0' ).test( content ) ) {
			continue; // already validated
		}
		validationLines.push( '\tif ( ' + dp.name + ' < 0 ) {' );
		validationLines.push( '\t\tthrow new RangeError( format( \'invalid argument. ' + ordinal( dp.index + 1 ) + ' argument must be a nonnegative integer. Value: `%d`.\', ' + dp.name + ' ) );' );
		validationLines.push( '\t}' );
		addedChecks.push( dp.name + ' (RangeError)' );
	}

	if ( validationLines.length === 0 ) {
		return { changed: false, reason: 'all needed checks already present' };
	}

	// Find insertion point: after the isLayout throw block
	var insertionPattern = /(\tthrow new TypeError\( format\( 'invalid argument\. First argument must be a valid order[^}]+\})\n/;
	var insertMatch = modified.match( insertionPattern );

	if ( insertMatch ) {
		var insertAfter = insertMatch[ 0 ];
		modified = modified.replace( insertAfter, insertAfter + validationLines.join( '\n' ) + '\n' );
	} else {
		// No isLayout check — insert before the first `if ( order ===` or `base(`
		var altPattern = /(\n)(\tif \( order ===|\treturn base\(|\tbase\()/;
		var altMatch = modified.match( altPattern );
		if ( altMatch ) {
			modified = modified.replace( altPattern, '\n' + validationLines.join( '\n' ) + '\n' + altMatch[ 2 ] );
		} else {
			return { changed: false, reason: 'could not find insertion point' };
		}
	}

	if ( !dryRun ) {
		fs.writeFileSync( filePath, modified );
	}

	return {
		changed: true,
		requires: addedRequires,
		checks: addedChecks
	};
}

// ── Codemod: ndarray.js dimension validation ──

function codemodNdarray( filePath, dryRun ) {
	var content = fs.readFileSync( filePath, 'utf8' );
	var params = extractParams( content );
	if ( !params ) {
		return { changed: false, reason: 'no function signature' };
	}

	var dimParams = detectDimensionParams( params );
	if ( dimParams.length === 0 ) {
		return { changed: false, reason: 'no dimension params' };
	}

	// Check what's already there
	var hasAllDims = dimParams.every( function( dp ) {
		return new RegExp( dp.name + '\\s*<\\s*0' ).test( content );
	});
	if ( hasAllDims ) {
		return { changed: false, reason: 'already has all dimension validation' };
	}

	// Need format import?
	var modified = content;
	var addedChecks = [];

	if ( modified.indexOf( 'format' ) < 0 ) {
		// Add format require before base require
		var baseReq = /var base = require\( '\.\/base\.js' \);/;
		if ( baseReq.test( modified ) ) {
			modified = modified.replace( baseReq, 'var format = require( \'@stdlib/string/format\' );\n' + 'var base = require( \'./base.js\' );' );
		}
	}

	// Build dimension validation
	var validationLines = [];
	var i, dp;
	for ( i = 0; i < dimParams.length; i++ ) {
		dp = dimParams[ i ];
		if ( new RegExp( dp.name + '\\s*<\\s*0' ).test( content ) ) {
			continue;
		}
		validationLines.push( '\tif ( ' + dp.name + ' < 0 ) {' );
		validationLines.push( '\t\tthrow new RangeError( format( \'invalid argument. ' + ordinal( dp.index + 1 ) + ' argument must be a nonnegative integer. Value: `%d`.\', ' + dp.name + ' ) );' );
		validationLines.push( '\t}' );
		addedChecks.push( dp.name + ' (RangeError)' );
	}

	if ( validationLines.length === 0 ) {
		return { changed: false, reason: 'all dimension checks already present' };
	}

	// Insert before `return base(`
	var returnPattern = /(\treturn base\()/;
	var returnMatch = modified.match( returnPattern );
	if ( returnMatch ) {
		modified = modified.replace( returnPattern, validationLines.join( '\n' ) + '\n' + returnMatch[ 1 ] );
	} else {
		return { changed: false, reason: 'could not find return base() call' };
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
		console.error( 'Usage: node bin/codemod-routine-validation.js [--dry-run] [--all | module-path...]' );
		process.exit( 1 );
	}

	var routineChanged = 0;
	var ndarrayChanged = 0;
	var routineSkipped = 0;
	var ndarraySkipped = 0;
	var errors = [];
	var i, mod, routinePath, ndarrayPath, result;

	for ( i = 0; i < modules.length; i++ ) {
		mod = modules[ i ];

		// Process <routine>.js
		routinePath = path.join( mod.dir, 'lib', mod.routine + '.js' );
		if ( fs.existsSync( routinePath ) ) {
			try {
				result = codemodRoutine( routinePath, dryRun );
				if ( result.changed ) {
					routineChanged++;
					if ( !dryRun ) {
						// silent
					} else {
						console.log( mod.routine + '.js: would add ' + result.checks.join( ', ' ) );
					}
				} else {
					routineSkipped++;
				}
			} catch ( e ) {
				errors.push( mod.routine + '.js: ' + e.message );
			}
		}

		// Process ndarray.js
		ndarrayPath = path.join( mod.dir, 'lib', 'ndarray.js' );
		if ( fs.existsSync( ndarrayPath ) ) {
			try {
				result = codemodNdarray( ndarrayPath, dryRun );
				if ( result.changed ) {
					ndarrayChanged++;
					if ( dryRun ) {
						console.log( mod.routine + '/ndarray.js: would add ' + result.checks.join( ', ' ) );
					}
				} else {
					ndarraySkipped++;
				}
			} catch ( e ) {
				errors.push( mod.routine + '/ndarray.js: ' + e.message );
			}
		}
	}

	console.log( '' );
	console.log( 'routine.js: ' + routineChanged + ' changed, ' + routineSkipped + ' skipped' );
	console.log( 'ndarray.js: ' + ndarrayChanged + ' changed, ' + ndarraySkipped + ' skipped' );
	if ( errors.length > 0 ) {
		console.log( '' );
		console.log( 'Errors (' + errors.length + '):' );
		errors.forEach( function( e ) { console.log( '  ' + e ); });
	}
	if ( dryRun ) {
		console.log( '\n(dry run — no files changed)' );
	}
}

main();
