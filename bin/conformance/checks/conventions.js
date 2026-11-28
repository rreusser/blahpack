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
	var stridedPath = path.join( mod.dir, 'lib', 'strided.js' );
	var basePath = path.join( mod.dir, 'lib', 'base.js' );
	var indexPath = path.join( mod.dir, 'lib', 'index.js' );

	var routineContent = util.readFile( routinePath );
	var stridedContent = util.readFile( stridedPath );
	var baseContent = util.readFile( basePath );
	var indexContent = util.readFile( indexPath );

	var baseParams = extractParams( baseContent );
	var routineParams = extractParams( routineContent );
	var stridedParams = extractParams( stridedContent );

	// ──────────────────────────────────────────
	// index.js checks
	// ──────────────────────────────────────────

	// Native addon loading is not used in this project.
	results.push( util.skip( ID + '.index-native-loading', 'Not applicable (no native addons in this project)' ) );

	// index.js attaches the offset form (ticket 0124: there is no main.js).
	if ( indexContent ) {
		var hasRoutineImport = indexContent.indexOf( "'./" + mod.routine + ".js'" ) >= 0;
		var hasStridedImport = indexContent.indexOf( "'./strided.js'" ) >= 0;
		if ( hasRoutineImport && hasStridedImport ) {
			results.push( util.pass( ID + '.index-imports-both', 'index.js imports routine.js and strided.js' ) );
		} else {
			var missing = [];
			if ( !hasRoutineImport ) {
				missing.push( mod.routine + '.js' );
			}
			if ( !hasStridedImport ) {
				missing.push( 'strided.js' );
			}
			results.push( util.fail(
				ID + '.index-imports-both',
				'index.js imports routine.js and strided.js',
				missing.length, [ 'index.js' ],
				'index.js missing import of: ' + missing.join( ', ' )
			));
		}

		// index.js should use setReadOnly to attach .strided
		if ( /setReadOnly\(\s*[\w$]+\s*,\s*'strided'/.test( indexContent ) ) {
			results.push( util.pass( ID + '.index-setreadonly', 'index.js uses setReadOnly for .strided' ) );
		} else {
			results.push( util.fail(
				ID + '.index-setreadonly',
				'index.js uses setReadOnly for .strided',
				1, [ 'index.js' ],
				'index.js should use setReadOnly to attach the .strided property'
			));
		}
	} else {
		results.push( util.skip( ID + '.index-imports-both', 'No index.js' ) );
		results.push( util.skip( ID + '.index-setreadonly', 'No index.js' ) );
	}

	// ──────────────────────────────────────────
	// <routine>.js checks (layout wrapper)
	// ──────────────────────────────────────────

	if ( routineContent && routineParams ) {
		// Calls base.js (not strided.js), unless the routine takes a
		// workspace: then strided.js, so a caller's workspace is checked
		// against the minimum (S8, D5d; lint:wrapper-calls-strided).
		if ( takesWorkspace( mod.routine ) ) {
			if ( /\bstrided\(/.test( routineContent ) && /import strided from '\.\/strided\.js'/.test( routineContent ) ) {
				results.push( util.pass( ID + '.routine-calls-base', mod.routine + '.js calls strided.js (the routine takes a workspace)' ) );
			} else {
				results.push( util.fail(
					ID + '.routine-calls-base',
					mod.routine + '.js calls strided.js',
					1, [ mod.routine + '.js' ],
					mod.routine + '.js should call strided.js: the routine takes a workspace (CONVENTIONS D5d)'
				));
			}
		} else if ( /base\(/.test( routineContent ) || /require.*base\.js/.test( routineContent ) ) {
			results.push( util.pass( ID + '.routine-calls-base', mod.routine + '.js calls base.js' ) );
		} else {
			results.push( util.fail(
				ID + '.routine-calls-base',
				mod.routine + '.js calls base.js',
				1, [ mod.routine + '.js' ],
				mod.routine + '.js should call base.js directly (not strided.js)'
			));
		}

	} else if ( !routineContent ) {
		results.push( util.skip( ID + '.routine-calls-base', 'No ' + mod.routine + '.js' ) );
	}

	// ──────────────────────────────────────────
	// strided.js checks
	// ──────────────────────────────────────────

	if ( stridedContent && stridedParams ) {
		// Should call base.js
		if ( /base\(/.test( stridedContent ) || /require.*base\.js/.test( stridedContent ) ) {
			results.push( util.pass( ID + '.strided-calls-base', 'strided.js calls base.js' ) );
		} else {
			results.push( util.fail(
				ID + '.strided-calls-base',
				'strided.js calls base.js',
				1, [ 'strided.js' ],
				'strided.js should call base.js directly'
			));
		}

	} else if ( !stridedContent ) {
		results.push( util.skip( ID + '.strided-calls-base', 'No strided.js' ) );
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
				'base.js imports a string validator — validation should be in strided.js/' + mod.routine + '.js instead'
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
