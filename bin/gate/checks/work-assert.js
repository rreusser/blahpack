'use strict';

/**
 * Gate check: ndarray.js must validate WORK array size.
 *
 * Any module whose base.js takes a caller-provided workspace array (WORK,
 * RWORK, IWORK) must have a corresponding size assertion in ndarray.js before
 * calling base().  Without this, an undersized WORK silently reads past the
 * end of the typed array (returning `undefined`), which propagates as NaN
 * through every subsequent arithmetic operation.
 *
 * The check looks for a RangeError throw that references the WORK array size.
 * We accept either of two canonical patterns:
 *
 *   1. `if ( !WORK || ( WORK.length - offsetWORK ) < minWork )` (new style)
 *   2. `if ( WORK.length < ...` (older style)
 *
 * Genuine exceptions (routines that handle WORK sizing inside base.js for
 * architectural reasons) go in gate.config.json with a mandatory reason.
 */

var path = require( 'path' );
var util = require( '../util.js' );

var ID = 'work-assert';

// Matches the canonical WORK-size assertion pattern in ndarray.js.
// We look for a RangeError throw alongside a WORK/RWORK/IWORK length check.
var ASSERT_RE = /\bWORK\b.*\.length|\.length.*\bWORK\b/;
var THROW_RE = /throw\s+new\s+RangeError/;

// Early return: `return 0;`, `return N;`, `return rcond[...]...`, etc.
// Matches simple literal/short-expression returns (zero-dim quick exits).
var EARLY_RETURN_RE = /^\s*return\s+(?:\d+|rcond\s*\[)/;

/**
 * True if the file contains a WORK size assertion (length check + throw).
 *
 * @param {string} content - file source
 * @returns {boolean}
 */
function hasWorkAssert( content ) {
	if ( !content ) {
		return false;
	}
	var lines = content.split( '\n' );
	var sawLengthCheck = false;
	var i;
	var line;

	for ( i = 0; i < lines.length; i++ ) {
		line = lines[ i ];
		if ( ASSERT_RE.test( line ) ) {
			sawLengthCheck = true;
		}
		if ( sawLengthCheck && THROW_RE.test( line ) ) {
			return true;
		}
	}
	return false;
}

/**
 * Returns 1-based line numbers of early returns that appear AFTER the
 * WORK assertion but BEFORE `return base(...)`. These indicate zero-dim
 * quick exits that should have been placed before the WORK check.
 *
 * @param {string} content - file source
 * @returns {Array<number>}
 */
function misplacedEarlyReturns( content ) {
	if ( !content ) {
		return [];
	}
	var lines = content.split( '\n' );
	var workCheckLine = -1;
	var baseCallLine = -1;
	var i;

	for ( i = 0; i < lines.length; i++ ) {
		if ( ASSERT_RE.test( lines[ i ] ) ) {
			workCheckLine = i;
			break;
		}
	}
	if ( workCheckLine === -1 ) {
		return [];
	}
	for ( i = workCheckLine; i < lines.length; i++ ) {
		if ( /return\s+base\s*\(/.test( lines[ i ] ) ) {
			baseCallLine = i;
			break;
		}
	}
	if ( baseCallLine === -1 ) {
		return [];
	}
	var misplaced = [];
	for ( i = workCheckLine + 1; i < baseCallLine; i++ ) {
		if ( EARLY_RETURN_RE.test( lines[ i ] ) ) {
			misplaced.push( i + 1 );
		}
	}
	return misplaced;
}

/**
 * Check that ndarray.js asserts WORK size when the routine takes workspace.
 */
function check( mod ) {
	var results = [];
	var basePath = path.join( mod.dir, 'lib', 'base.js' );
	var ndarrayPath = path.join( mod.dir, 'lib', 'ndarray.js' );
	var baseContent = util.readFile( basePath );
	var ndarrayContent = util.readFile( ndarrayPath );

	if ( !baseContent ) {
		results.push( util.skip( ID, 'No base.js' ) );
		return results;
	}
	if ( !ndarrayContent ) {
		results.push( util.skip( ID, 'No ndarray.js' ) );
		return results;
	}

	// Only applies to routines whose ndarray.js accepts a WORK parameter.
	if ( !/\bWORK\b/.test( ndarrayContent ) ) {
		results.push( util.skip( ID, 'ndarray.js takes no WORK parameter' ) );
		return results;
	}

	if ( hasWorkAssert( ndarrayContent ) ) {
		results.push( util.pass( ID, 'ndarray.js asserts WORK array size' ) );

		var misplaced = misplacedEarlyReturns( ndarrayContent );
		if ( misplaced.length > 0 ) {
			results.push( util.fail(
				ID + '.early-return-order',
				'ndarray.js zero-dim early return precedes WORK check',
				misplaced.length,
				misplaced.map( function( ln ) {
					return path.relative( util.ROOT, ndarrayPath ) + ':' + ln + ' (return appears after WORK assertion)';
				}),
				'ndarray.js has quick return(s) AFTER the WORK.length assertion (line(s) ' + misplaced.join( ', ' ) + '). Move zero-dim early returns before the WORK check — an empty matrix must not require a valid workspace buffer.'
			));
		} else {
			results.push( util.pass( ID + '.early-return-order', 'ndarray.js zero-dim early return precedes WORK check' ) );
		}
	} else {
		results.push( util.fail(
			ID,
			'ndarray.js asserts WORK array size',
			1,
			[ path.relative( util.ROOT, ndarrayPath ) ],
			'ndarray.js accepts a WORK parameter but contains no WORK.length assertion before calling base(). Add a minWork check that throws RangeError on undersized input — without it, out-of-bounds reads return `undefined`, which silently produces NaN.'
		) );
	}
	return results;
}

module.exports = check;
