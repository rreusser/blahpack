'use strict';

var path = require( 'path' );
var util = require( '../util.js' );

var ID = 'strings';

// Pattern: single-char string in code (not in comments, requires, eslint directives,
// or object-property keys like `'K': 0`).
var SINGLE_CHAR_CODE = /'[A-Z0-9]'/;
var COMMENT_OR_REQUIRE = /\/\/|^\s*\*|eslint|require/;
// Skip lines that contain a single-char literal in object-key position only,
// e.g. `'K': 0,`. We accept the literal when there's also a non-key
// occurrence on the line (e.g. `dlamch( 'E' )` — that's a real flag).
var OBJECT_KEY_ONLY = /^[^']*'[A-Z0-9]'\s*:[^']*(?:'[A-Z0-9]'\s*:[^']*)*$/;

// Pattern: single-char string in @param without backtick quoting
var SINGLE_CHAR_PARAM = /@param.*'[A-Z]'/;
var BACKTICK_QUOTED = /`/;

function check( mod ) {
	var results = [];
	var basePath = path.join( mod.dir, 'lib', 'base.js' );
	var ndarrayPath = path.join( mod.dir, 'lib', 'ndarray.js' );
	var baseContent = util.readFile( basePath );
	var hits;
	var locs;
	var count;
	var i;

	// 1. No single-char Fortran flags in code
	if ( baseContent ) {
		hits = util.grepFile( basePath, SINGLE_CHAR_CODE );
		// Filter out comment and require lines, and lines where the only
		// single-char literals are object-property keys.
		locs = [];
		for ( i = 0; i < hits.length; i++ ) {
			if ( COMMENT_OR_REQUIRE.test( hits[ i ].text ) ) continue;
			if ( OBJECT_KEY_ONLY.test( hits[ i ].text ) ) continue;
			locs.push( 'base.js:' + hits[ i ].line );
		}
		if ( locs.length === 0 ) {
			results.push( util.pass( ID + '.no-single-char-code', 'No single-char Fortran flags in code' ) );
		} else {
			results.push( util.fail(
				ID + '.no-single-char-code',
				'No single-char Fortran flags in code',
				locs.length, locs
			));
		}
	} else {
		results.push( util.skip( ID + '.no-single-char-code', 'No base.js' ) );
	}

	// 2. No single-char flags in @param JSDoc (base.js + ndarray.js)
	count = 0;
	locs = [];
	if ( baseContent ) {
		hits = util.grepFile( basePath, SINGLE_CHAR_PARAM );
		for ( i = 0; i < hits.length; i++ ) {
			if ( !BACKTICK_QUOTED.test( hits[ i ].text ) ) {
				count++;
				locs.push( 'base.js:' + hits[ i ].line );
			}
		}
	}
	if ( util.fileExists( ndarrayPath ) ) {
		hits = util.grepFile( ndarrayPath, SINGLE_CHAR_PARAM );
		for ( i = 0; i < hits.length; i++ ) {
			if ( !BACKTICK_QUOTED.test( hits[ i ].text ) ) {
				count++;
				locs.push( 'ndarray.js:' + hits[ i ].line );
			}
		}
	}
	if ( count === 0 ) {
		results.push( util.pass( ID + '.no-single-char-param', 'No single-char flags in @param' ) );
	} else {
		results.push( util.fail( ID + '.no-single-char-param', 'No single-char flags in @param', count, locs ) );
	}

	// 3. d-prefix has no 'conjugate-transpose'
	if ( util.isDPrefix( mod.routine ) ) {
		if ( baseContent && /conjugate-transpose/.test( baseContent ) ) {
			results.push( util.fail(
				ID + '.no-dprefix-conjtrans',
				'd-prefix has no conjugate-transpose',
				1, [ 'base.js' ],
				'd-prefix routines cannot use conjugate-transpose'
			));
		} else {
			results.push( util.pass( ID + '.no-dprefix-conjtrans', 'd-prefix has no conjugate-transpose' ) );
		}
	} else {
		results.push( util.skip( ID + '.no-dprefix-conjtrans', 'Not d-prefix' ) );
	}

	return results;
}

module.exports = check;
