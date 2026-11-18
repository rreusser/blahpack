'use strict';

/*
* String-option parity check.
*
* The layout wrapper `<routine>.js` and `ndarray.js` validate the same string
* options (`job`, `compz`, `direct`, ...) before calling the same `base()`.
* They must therefore accept EXACTLY the same set of values. When the wrapper's
* set is narrower, the wrapper rejects valid calls (e.g. `zgeev( ..., 'no-vectors', ... )`
* threw a TypeError); when it is wider, the wrapper forwards a value `base()`
* was never written to handle.
*
* This class produced ~40 defects (2026-11-18): the wrapper validation had been
* generated from only the option values that appeared in test fixtures.
*
* Literal `name !== 'value' && ...` chains followed by `throw new TypeError` are
* compared, and so are stdlib assertion helpers (`if ( !isOperationSide( side ) )`),
* which are expanded to the value set they accept. (`ztgevc.js` validated `side`
* with `isOperationSide`, rejecting LAPACK's `'both'` that ndarray.js accepts.)
*
* An option the wrapper takes but does not validate at all counts as a mismatch
* too: the wrapper then forwards any string to `base()` (`dpftrs.js` passed
* `transr` through unchecked; 41 such options on 2026-11-18). Fix those with
* `node bin/codemod-option-rules.js <routine>`.
*
* There is no exception/skip mechanism: a mismatch is fixed in the code.
*/

var path = require( 'path' );
var util = require( '../util.js' );

var ID = 'option-parity';
var DESC = '<routine>.js and ndarray.js accept the same string options';

var readFile = util.readFile;

// Values accepted by the stdlib BLAS assertion helpers (keyed by local import name):
var HELPER_SETS = {
	'isMatrixTranspose': [ 'no-transpose', 'transpose', 'conjugate-transpose' ],
	'isTransposeOperation': [ 'no-transpose', 'transpose', 'conjugate-transpose' ],
	'isOperationSide': [ 'left', 'right' ],
	'isDiagonalType': [ 'unit', 'non-unit' ],
	'isMatrixTriangle': [ 'upper', 'lower' ]
};


// FUNCTIONS //

/**
* Extract the literal option sets validated in a source file.
*
* @private
* @param {string} content - JS source
* @returns {Object} map from parameter name to array of accepted values
*/
function optionSets( content ) {
	var out = {};
	var re = /if \(\s*((?:\w+ !== '[^']*'(?:\s*&&\s*)?)+)\s*\) \{\s*throw new TypeError/g;
	var tre = /(\w+) !== '([^']*)'/g;
	var m;
	var t;
	while ( ( m = re.exec( content ) ) !== null ) {
		tre.lastIndex = 0;
		while ( ( t = tre.exec( m[ 1 ] ) ) !== null ) {
			if ( !out[ t[ 1 ] ] ) {
				out[ t[ 1 ] ] = [];
			}
			if ( out[ t[ 1 ] ].indexOf( t[ 2 ] ) === -1 ) {
				out[ t[ 1 ] ].push( t[ 2 ] );
			}
		}
	}
	re = /if \(\s*!(\w+)\(\s*(\w+)\s*\)\s*\) \{\s*throw new TypeError/g;
	while ( ( m = re.exec( content ) ) !== null ) {
		if ( HELPER_SETS[ m[ 1 ] ] && !out[ m[ 2 ] ] ) {
			out[ m[ 2 ] ] = HELPER_SETS[ m[ 1 ] ].slice();
		}
	}
	return out;
}


/**
* Options ndarray.js validates that the wrapper takes as a parameter but never validates.
*
* @private
* @param {string} wrapper - wrapper source
* @param {string} routine - routine name
* @param {Object} ws - wrapper option sets
* @param {Object} ns - ndarray option sets
* @returns {Array<string>} parameter names
*/
function unvalidated( wrapper, routine, ws, ns ) {
	var sig = wrapper.match( new RegExp( 'function ' + routine + '\\(([^)]*)\\)' ) );
	var params = ( sig ) ? sig[ 1 ].split( ',' ).map( function t( p ) {
		return p.trim();
	}) : [];
	return Object.keys( ns ).filter( function f( k ) {
		return params.indexOf( k ) >= 0 && !ws[ k ];
	});
}


// MAIN //

/**
* Assert the wrapper and ndarray.js validate identical string-option sets.
*
* @param {Object} mod - { dir, pkg, routine }
* @returns {Array<Object>} check results
*/
function check( mod ) {
	var wrapperPath = path.join( mod.dir, 'lib', mod.routine + '.js' );
	var ndarrayPath = path.join( mod.dir, 'lib', 'ndarray.js' );
	var wrapper = readFile( wrapperPath );
	var ndarray = readFile( ndarrayPath );
	var violations = [];
	var ws;
	var ns;
	var missing;
	var extra;
	var keys;
	var k;
	var i;

	if ( !wrapper || !ndarray ) {
		return [ util.skip( ID, DESC, 'Missing ' + mod.routine + '.js or ndarray.js' ) ];
	}
	ws = optionSets( wrapper );
	ns = optionSets( ndarray );
	unvalidated( wrapper, mod.routine, ws, ns ).forEach( function each( k ) {
		violations.push( path.relative( util.ROOT, wrapperPath ) + '  `' + k + '`  is not validated (ndarray.js accepts [' + ns[ k ].join( ', ' ) + '])' );
	});
	keys = Object.keys( ws );
	for ( i = 0; i < keys.length; i++ ) {
		k = keys[ i ];
		if ( !ns[ k ] ) {
			continue;
		}
		missing = ns[ k ].filter( function f( v ) {
			return ws[ k ].indexOf( v ) === -1;
		});
		extra = ws[ k ].filter( function f( v ) {
			return ns[ k ].indexOf( v ) === -1;
		});
		if ( missing.length > 0 || extra.length > 0 ) {
			violations.push(
				path.relative( util.ROOT, wrapperPath ) + '  `' + k + '`' +
				( ( missing.length ) ? '  rejects [' + missing.join( ', ' ) + ']' : '' ) +
				( ( extra.length ) ? '  accepts extra [' + extra.join( ', ' ) + ']' : '' ) +
				'  (ndarray.js: [' + ns[ k ].join( ', ' ) + '])'
			);
		}
	}
	if ( violations.length > 0 ) {
		return [ util.fail( ID, DESC, violations.length, violations, 'The layout wrapper must accept exactly the option values ndarray.js accepts (verify the set against the reference Fortran).' ) ];
	}
	return [ util.pass( ID, DESC ) ];
}


// EXPORTS //

module.exports = check;
module.exports.optionSets = optionSets;
module.exports.unvalidated = unvalidated;
