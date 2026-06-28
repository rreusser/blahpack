'use strict';

var path = require( 'path' );
var util = require( '../util.js' );

var ID = 'conventions';

// String parameter names → expected validator require string
var STRING_VALIDATORS = {
	'order': 'is-layout',
	'trans': 'is-transpose-operation',
	'transa': 'is-transpose-operation',
	'transb': 'is-transpose-operation',
	'uplo': 'is-matrix-triangle',
	'side': 'is-operation-side',
	'diag': 'is-diagonal-type'
};

// Dimension parameters that should have >= 0 checks
var DIMENSION_PARAMS = new Set([
	'M', 'N', 'K', 'nrhs'
]);

/**
* Extract the function signature parameters from a file.
*
* @private
* @param {string} content - file content
* @returns {Array|null} array of parameter names or null
*/
function extractParams( content ) {
	if ( !content ) {
		return null;
	}
	// Find the exported function: look for module.exports to get the name,
	// then find that function's signature
	var exportMatch = content.match( /module\.exports\s*=\s*(\w+)/ );
	var m;
	if ( exportMatch ) {
		var fnName = exportMatch[ 1 ];
		var exportedPattern = new RegExp( 'function\\s+' + fnName + '\\s*\\(\\s*([^)]+)\\)' );
		m = content.match( exportedPattern );
	}
	if ( !m ) {
		// Fallback: first function
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
* Detect which string params a signature has.
*
* @private
* @param {Array} params - parameter names
* @returns {Array} array of { name, validator } objects
*/
function detectStringParams( params ) {
	var result = [];
	var i, lower;
	for ( i = 0; i < params.length; i++ ) {
		lower = params[ i ].toLowerCase();
		if ( STRING_VALIDATORS[ lower ] ) {
			result.push({
				name: params[ i ],
				validator: STRING_VALIDATORS[ lower ]
			});
		}
	}
	return result;
}

/**
* Detect which dimension params a signature has.
*
* @private
* @param {Array} params - parameter names
* @returns {Array} parameter names that are dimensions
*/
function detectDimensionParams( params ) {
	var result = [];
	var i;
	for ( i = 0; i < params.length; i++ ) {
		if ( DIMENSION_PARAMS.has( params[ i ] ) ) {
			result.push( params[ i ] );
		}
	}
	return result;
}

/**
* Detect leading dimension params (LD<X> pattern).
*
* @private
* @param {Array} params - parameter names
* @returns {Array} leading dimension parameter names
*/
function detectLeadingDimParams( params ) {
	var result = [];
	var i;
	for ( i = 0; i < params.length; i++ ) {
		if ( /^LD[A-Z]+$/.test( params[ i ] ) ) {
			result.push( params[ i ] );
		}
	}
	return result;
}

/**
* Check if content has a throws for a given validator.
*
* @private
* @param {string} content - file content
* @param {string} validatorName - e.g., 'is-layout'
* @returns {boolean} true if validator is imported and used in a throw
*/
function hasValidatorImport( content, validatorName ) {
	return content.indexOf( validatorName ) >= 0;
}

/**
* Check if content throws TypeError.
*
* @private
* @param {string} content - file content
* @returns {boolean}
*/
function hasTypeError( content ) {
	return /throw new TypeError/.test( content );
}

/**
* Check if content throws RangeError.
*
* @private
* @param {string} content - file content
* @returns {boolean}
*/
function hasRangeError( content ) {
	return /throw new RangeError/.test( content );
}

/**
* Count the number of throw statements.
*
* @private
* @param {string} content - file content
* @returns {number}
*/
function countThrows( content ) {
	var m = content.match( /throw new /g );
	return m ? m.length : 0;
}

/**
* Run convention checks for a single module.
*
* @param {Object} mod - { dir, pkg, routine }
* @returns {Array} array of check results
*/
function check( mod ) {
	var results = [];
	var routinePath = path.join( mod.dir, 'lib', mod.routine + '.js' );
	var ndarrayPath = path.join( mod.dir, 'lib', 'ndarray.js' );
	var basePath = path.join( mod.dir, 'lib', 'base.js' );
	var indexPath = path.join( mod.dir, 'lib', 'index.js' );
	var mainPath = path.join( mod.dir, 'lib', 'main.js' );

	var routineContent = util.readFile( routinePath );
	var ndarrayContent = util.readFile( ndarrayPath );
	var baseContent = util.readFile( basePath );
	var indexContent = util.readFile( indexPath );
	var mainContent = util.readFile( mainPath );

	var baseParams = extractParams( baseContent );
	var routineParams = extractParams( routineContent );
	var ndarrayParams = extractParams( ndarrayContent );

	// ──────────────────────────────────────────
	// index.js checks
	// ──────────────────────────────────────────

	// Native addon loading is not used in this project.
	results.push( util.skip( ID + '.index-native-loading', 'Not applicable (no native addons in this project)' ) );

	// ──────────────────────────────────────────
	// main.js checks
	// ──────────────────────────────────────────

	if ( mainContent ) {
		// main.js should require both routine.js and ndarray.js
		var hasRoutineRequire = mainContent.indexOf( mod.routine + '.js' ) >= 0;
		var hasNdarrayRequire = mainContent.indexOf( 'ndarray.js' ) >= 0;
		if ( hasRoutineRequire && hasNdarrayRequire ) {
			results.push( util.pass( ID + '.main-requires-both', 'main.js requires routine.js and ndarray.js' ) );
		} else {
			var missing = [];
			if ( !hasRoutineRequire ) {
				missing.push( mod.routine + '.js' );
			}
			if ( !hasNdarrayRequire ) {
				missing.push( 'ndarray.js' );
			}
			results.push( util.fail(
				ID + '.main-requires-both',
				'main.js requires routine.js and ndarray.js',
				missing.length, [ 'main.js' ],
				'main.js missing require for: ' + missing.join( ', ' )
			));
		}

		// main.js should use setReadOnly to attach .ndarray
		if ( /setReadOnly/.test( mainContent ) && /ndarray/.test( mainContent ) ) {
			results.push( util.pass( ID + '.main-setreadonly', 'main.js uses setReadOnly for .ndarray' ) );
		} else {
			results.push( util.warn(
				ID + '.main-setreadonly',
				'main.js uses setReadOnly for .ndarray',
				1, [ 'main.js' ],
				'main.js should use setReadOnly to attach .ndarray property'
			));
		}
	} else {
		results.push( util.skip( ID + '.main-requires-both', 'No main.js' ) );
		results.push( util.skip( ID + '.main-setreadonly', 'No main.js' ) );
	}

	// ──────────────────────────────────────────
	// <routine>.js checks (layout wrapper)
	// ──────────────────────────────────────────

	if ( routineContent && routineParams ) {
		// Should call base.js (not ndarray.js)
		if ( /base\(/.test( routineContent ) || /require.*base\.js/.test( routineContent ) ) {
			results.push( util.pass( ID + '.routine-calls-base', mod.routine + '.js calls base.js' ) );
		} else {
			results.push( util.fail(
				ID + '.routine-calls-base',
				mod.routine + '.js calls base.js',
				1, [ mod.routine + '.js' ],
				mod.routine + '.js should call base.js directly (not ndarray.js)'
			));
		}

		// String param validation
		var routineStrings = detectStringParams( routineParams );
		if ( routineStrings.length > 0 ) {
			var missingRoutineValidators = [];
			var i;
			for ( i = 0; i < routineStrings.length; i++ ) {
				if ( !hasValidatorImport( routineContent, routineStrings[ i ].validator ) ) {
					missingRoutineValidators.push( routineStrings[ i ].name + ' (' + routineStrings[ i ].validator + ')' );
				}
			}
			if ( missingRoutineValidators.length === 0 ) {
				results.push( util.pass( ID + '.routine-string-validation', mod.routine + '.js validates all string params' ) );
			} else {
				results.push( util.fail(
					ID + '.routine-string-validation',
					mod.routine + '.js validates all string params',
					missingRoutineValidators.length,
					[ mod.routine + '.js' ],
					'Missing validators for: ' + missingRoutineValidators.join( ', ' )
				));
			}
		} else {
			results.push( util.skip( ID + '.routine-string-validation', 'No string params in ' + mod.routine + '.js' ) );
		}

		// Dimension validation
		var routineDims = detectDimensionParams( routineParams );
		if ( routineDims.length > 0 ) {
			if ( hasRangeError( routineContent ) ) {
				results.push( util.pass( ID + '.routine-dimension-validation', mod.routine + '.js validates dimensions' ) );
			} else {
				results.push( util.fail(
					ID + '.routine-dimension-validation',
					mod.routine + '.js validates dimensions',
					routineDims.length,
					[ mod.routine + '.js' ],
					'Has dimension params (' + routineDims.join( ', ' ) + ') but no RangeError throws'
				));
			}
		} else {
			results.push( util.skip( ID + '.routine-dimension-validation', 'No dimension params in ' + mod.routine + '.js' ) );
		}

		// Leading dimension validation
		var ldParams = detectLeadingDimParams( routineParams );
		if ( ldParams.length > 0 ) {
			// Check for LDA/LDB/LDC validation (should check >= max(1, ...))
			var ldPattern = /LD[A-Z].*<.*max|max.*LD[A-Z]|LD[A-Z]\s*</;
			if ( ldPattern.test( routineContent ) || /throw.*LD[A-Z]/.test( routineContent ) || countThrows( routineContent ) >= routineStrings.length + routineDims.length + ldParams.length ) {
				results.push( util.pass( ID + '.routine-ld-validation', mod.routine + '.js validates leading dimensions' ) );
			} else {
				results.push( util.warn(
					ID + '.routine-ld-validation',
					mod.routine + '.js validates leading dimensions',
					ldParams.length,
					[ mod.routine + '.js' ],
					'Has leading dimension params (' + ldParams.join( ', ' ) + ') but may not validate them'
				));
			}
		} else {
			results.push( util.skip( ID + '.routine-ld-validation', 'No leading dimension params' ) );
		}
	} else if ( !routineContent ) {
		results.push( util.skip( ID + '.routine-calls-base', 'No ' + mod.routine + '.js' ) );
		results.push( util.skip( ID + '.routine-string-validation', 'No ' + mod.routine + '.js' ) );
		results.push( util.skip( ID + '.routine-dimension-validation', 'No ' + mod.routine + '.js' ) );
		results.push( util.skip( ID + '.routine-ld-validation', 'No ' + mod.routine + '.js' ) );
	}

	// ──────────────────────────────────────────
	// ndarray.js checks
	// ──────────────────────────────────────────

	if ( ndarrayContent && ndarrayParams ) {
		// Should call base.js
		if ( /base\(/.test( ndarrayContent ) || /require.*base\.js/.test( ndarrayContent ) ) {
			results.push( util.pass( ID + '.ndarray-calls-base', 'ndarray.js calls base.js' ) );
		} else {
			results.push( util.fail(
				ID + '.ndarray-calls-base',
				'ndarray.js calls base.js',
				1, [ 'ndarray.js' ],
				'ndarray.js should call base.js directly'
			));
		}

		// String param validation in ndarray.js
		var ndarrayStrings = detectStringParams( ndarrayParams );
		if ( ndarrayStrings.length > 0 ) {
			var missingNdarrayValidators = [];
			var j;
			for ( j = 0; j < ndarrayStrings.length; j++ ) {
				if ( !hasValidatorImport( ndarrayContent, ndarrayStrings[ j ].validator ) ) {
					missingNdarrayValidators.push( ndarrayStrings[ j ].name + ' (' + ndarrayStrings[ j ].validator + ')' );
				}
			}
			if ( missingNdarrayValidators.length === 0 ) {
				results.push( util.pass( ID + '.ndarray-string-validation', 'ndarray.js validates all string params' ) );
			} else {
				results.push( util.warn(
					ID + '.ndarray-string-validation',
					'ndarray.js validates all string params',
					missingNdarrayValidators.length,
					[ 'ndarray.js' ],
					'Missing validators for: ' + missingNdarrayValidators.join( ', ' )
				));
			}
		} else {
			results.push( util.skip( ID + '.ndarray-string-validation', 'No string params in ndarray.js' ) );
		}

		// Dimension validation in ndarray.js
		var ndarrayDims = detectDimensionParams( ndarrayParams );
		if ( ndarrayDims.length > 0 ) {
			if ( hasRangeError( ndarrayContent ) ) {
				results.push( util.pass( ID + '.ndarray-dimension-validation', 'ndarray.js validates dimensions' ) );
			} else {
				results.push( util.warn(
					ID + '.ndarray-dimension-validation',
					'ndarray.js validates dimensions',
					ndarrayDims.length,
					[ 'ndarray.js' ],
					'Has dimension params (' + ndarrayDims.join( ', ' ) + ') but no RangeError throws'
				));
			}
		} else {
			results.push( util.skip( ID + '.ndarray-dimension-validation', 'No dimension params in ndarray.js' ) );
		}

		// ndarray.js should NOT validate order (that's routine.js's job)
		if ( ndarrayParams.some( function( p ) { return p.toLowerCase() === 'order'; }) ) {
			results.push( util.fail(
				ID + '.ndarray-no-order',
				'ndarray.js does not have order param',
				1, [ 'ndarray.js' ],
				'ndarray.js should not have an order parameter (that belongs in ' + mod.routine + '.js)'
			));
		} else {
			results.push( util.pass( ID + '.ndarray-no-order', 'ndarray.js does not have order param' ) );
		}

		// Signature should match base.js
		if ( baseParams && ndarrayParams ) {
			var baseSig = baseParams.join( ', ' );
			var ndarraySig = ndarrayParams.join( ', ' );
			if ( baseSig === ndarraySig ) {
				results.push( util.pass( ID + '.ndarray-matches-base-sig', 'ndarray.js signature matches base.js' ) );
			} else {
				results.push( util.warn(
					ID + '.ndarray-matches-base-sig',
					'ndarray.js signature matches base.js',
					1, [ 'ndarray.js', 'base.js' ],
					'Signatures differ — ndarray: (' + ndarraySig + ') vs base: (' + baseSig + ')'
				));
			}
		} else {
			results.push( util.skip( ID + '.ndarray-matches-base-sig', 'Missing base.js or ndarray.js signature' ) );
		}
	} else if ( !ndarrayContent ) {
		results.push( util.skip( ID + '.ndarray-calls-base', 'No ndarray.js' ) );
		results.push( util.skip( ID + '.ndarray-string-validation', 'No ndarray.js' ) );
		results.push( util.skip( ID + '.ndarray-dimension-validation', 'No ndarray.js' ) );
		results.push( util.skip( ID + '.ndarray-no-order', 'No ndarray.js' ) );
		results.push( util.skip( ID + '.ndarray-matches-base-sig', 'No ndarray.js' ) );
	}

	// ──────────────────────────────────────────
	// base.js checks
	// ──────────────────────────────────────────

	if ( baseContent ) {
		// base.js should NOT validate (no throws for TypeError/RangeError on params)
		// Exception: base.js may throw for mathematical reasons (e.g., not positive definite)
		// We only flag if it has the same validator imports as the wrappers
		var baseHasValidatorImport = false;
		var validatorNames = Object.keys( STRING_VALIDATORS );
		var k;
		for ( k = 0; k < validatorNames.length; k++ ) {
			if ( hasValidatorImport( baseContent, STRING_VALIDATORS[ validatorNames[ k ] ] ) ) {
				baseHasValidatorImport = true;
				break;
			}
		}
		if ( baseHasValidatorImport ) {
			results.push( util.warn(
				ID + '.base-no-param-validation',
				'base.js has no parameter validation',
				1, [ 'base.js' ],
				'base.js imports a string validator — validation should be in ndarray.js/' + mod.routine + '.js instead'
			));
		} else {
			results.push( util.pass( ID + '.base-no-param-validation', 'base.js has no parameter validation' ) );
		}
	} else {
		results.push( util.skip( ID + '.base-no-param-validation', 'No base.js' ) );
	}

	return results;
}

module.exports = check;
