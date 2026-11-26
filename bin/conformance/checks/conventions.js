'use strict';

var path = require( 'path' );
var util = require( '../util.js' );

var ID = 'conventions';

var specLib = require( '../../../lint/lib/spec.cjs' );

// Whether the routine's spec has a param of role `workspace` (CONVENTIONS D5d).
function takesWorkspace( routine ) {
	var spec = specLib.load( routine );
	return !!spec && spec.params.some( function some( p ) {
		return p.role === 'workspace';
	});
}

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
	// Find the exported function name, then that function's signature. The
	// modules are ESM (`export default <name>`); older code used CommonJS
	// (`module.exports = <name>`). Support both so the check keys off the
	// real export rather than silently falling back to the first function.
	var exportMatch = content.match( /export\s+default\s+(\w+)/ ) || content.match( /module\.exports\s*=\s*(\w+)/ );
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
		// Calls base.js (not ndarray.js), unless the routine takes a
		// workspace: then ndarray.js, so a caller's workspace is checked
		// against the minimum (S8, D5d; lint:wrapper-calls-ndarray).
		if ( takesWorkspace( mod.routine ) ) {
			if ( /\bndarray\(/.test( routineContent ) && /import ndarray from '\.\/ndarray\.js'/.test( routineContent ) ) {
				results.push( util.pass( ID + '.routine-calls-base', mod.routine + '.js calls ndarray.js (the routine takes a workspace)' ) );
			} else {
				results.push( util.fail(
					ID + '.routine-calls-base',
					mod.routine + '.js calls ndarray.js',
					1, [ mod.routine + '.js' ],
					mod.routine + '.js should call ndarray.js: the routine takes a workspace (CONVENTIONS D5d)'
				));
			}
		} else if ( /base\(/.test( routineContent ) || /require.*base\.js/.test( routineContent ) ) {
			results.push( util.pass( ID + '.routine-calls-base', mod.routine + '.js calls base.js' ) );
		} else {
			results.push( util.fail(
				ID + '.routine-calls-base',
				mod.routine + '.js calls base.js',
				1, [ mod.routine + '.js' ],
				mod.routine + '.js should call base.js directly (not ndarray.js)'
			));
		}

	} else if ( !routineContent ) {
		results.push( util.skip( ID + '.routine-calls-base', 'No ' + mod.routine + '.js' ) );
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

	} else if ( !ndarrayContent ) {
		results.push( util.skip( ID + '.ndarray-calls-base', 'No ndarray.js' ) );
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
