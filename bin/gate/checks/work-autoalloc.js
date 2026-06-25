'use strict';

/**
 * Gate check: LAPACKE-style routine.js must auto-allocate workspace when null.
 *
 * The three-layer convention:
 *   base.js        — raw impl, no allocation, no validation
 *   ndarray.js     — validates WORK.length, throws RangeError on undersize
 *   <routine>.js   — LAPACKE-style convenience wrapper; accepts workspace as
 *                    `null` and auto-allocates so callers don't need to know
 *                    the size formula
 *
 * Without the null branch, callers at the routine.js layer must independently
 * know and implement the workspace size formula, defeating the purpose of the
 * convenience wrapper and making mis-allocation the path of least resistance.
 *
 * The check looks for `=== null` (or `== null`) on each workspace parameter
 * present in the routine's JS function signature. Accepts both UPPERCASE and
 * camelCase naming (WORK/work, IWORK/iwork, RWORK/rwork).
 *
 * Genuine exceptions go in gate.config.json with a mandatory reason.
 */

var path = require( 'path' );
var util = require( '../util.js' );

var ID = 'work-autoalloc';

var WORK_ARGS = util.FORTRAN_WORK_ARGS;


/**
 * True if `content` contains a null-check for the given workspace parameter name.
 * Accepts both original casing and lowercase (work, iwork, rwork, etc.).
 *
 * @param {string} content - JS source
 * @param {string} paramName - parameter name as it appears in the function signature
 * @returns {boolean}
 */
function hasNullBranch( content, paramName ) {
	// Match both `WORK === null`, `work === null`, `WORK == null`, `work === void 0`, etc.
	var patterns = [
		new RegExp( '\\b' + paramName + '\\s*===\\s*null' ),
		new RegExp( '\\b' + paramName + '\\s*==\\s*null' ),
		new RegExp( '\\b' + paramName + '\\s*===\\s*void\\s+0' )
	];
	var i;
	for ( i = 0; i < patterns.length; i++ ) {
		if ( patterns[ i ].test( content ) ) {
			return true;
		}
	}
	return false;
}


// CHECK //

function check( mod ) {
	var results = [];
	var wrapperPath = path.join( mod.dir, 'lib', mod.routine + '.js' );
	var wrapperContent = util.readFile( wrapperPath );
	var fortran = util.readFortran( mod.routine );

	var fArgs;
	var workArgs;
	var jsParamList;
	var jsParamLC;
	var missing;
	var param;
	var i;

	if ( !wrapperContent ) {
		results.push( util.skip( ID, 'No ' + mod.routine + '.js wrapper' ) );
		return results;
	}

	if ( fortran === null ) {
		results.push( util.skip( ID, 'Reference Fortran source not found' ) );
		return results;
	}

	fArgs = util.fortranArgs( fortran, mod.routine );
	workArgs = fArgs.filter( function isWork( a ) {
		return WORK_ARGS.indexOf( a ) !== -1;
	});

	if ( workArgs.length === 0 ) {
		results.push( util.skip( ID, 'No Fortran workspace argument' ) );
		return results;
	}

	// Find which workspace args are actually present in the JS signature.
	jsParamList = util.jsParams( wrapperContent, mod.routine );
	jsParamLC = jsParamList.map( function lc( p ) { return p.toLowerCase(); });

	missing = [];
	for ( i = 0; i < workArgs.length; i++ ) {
		var idx = jsParamLC.indexOf( workArgs[ i ].toLowerCase() );
		if ( idx === -1 ) {
			// Workspace arg not in signature at all — workspace.js handles that failure.
			continue;
		}
		param = jsParamList[ idx ];
		if ( !hasNullBranch( wrapperContent, param ) ) {
			missing.push( param );
		}
	}

	if ( missing.length > 0 ) {
		results.push( util.fail(
			ID,
			'Routine wrapper auto-allocates workspace when null',
			missing.length,
			[ path.relative( util.ROOT, wrapperPath ) ],
			missing.length + ' workspace param(s) lack a null-allocation branch: [' + missing.join( ', ' ) + ']. ' +
			'Add `if ( ' + missing[ 0 ] + ' === null ) { ' + missing[ 0 ] + ' = new Float64Array( minWork ); }` ' +
			'so callers do not need to know the size formula.'
		) );
	} else {
		results.push( util.pass( ID, 'Routine wrapper auto-allocates workspace when null' ) );
	}

	return results;
}

module.exports = check;
