/* eslint-disable max-len, max-params */

// Copyright (c) 2026 Ricky Reusser. License is Apache-2.0: http://www.apache.org/licenses/LICENSE-2.0

// VARIABLES //

var SAFMIN = 2.2250738585072014e-308; // 2^(-1022)
var SAFMAX = 8.98846567431158e+307;   // 2^1023


// MAIN //

/**
* Constructs a Givens plane rotation.
*
* The rotation is defined such that:
*
* ```text
* [  c  s ] [ a ] = [ r ]
* [ -s  c ] [ b ]   [ 0 ]
* ```
*
* where `c**2 + s**2 = 1`.
*
* @private
* @param {Float64Array} ab - two-element array containing `[a, b]` on entry; `[r, z]` on exit
* @param {integer} strideAB - stride length for `ab`
* @param {NonNegativeInteger} offsetAB - starting index for `ab`
* @param {Float64Array} cs - two-element array; on exit contains `[c, s]`
* @param {integer} strideCS - stride length for `cs`
* @param {NonNegativeInteger} offsetCS - starting index for `cs`
* @returns {void}
*/
function drotg( ab, strideAB, offsetAB, cs, strideCS, offsetCS ) {
	var anorm;
	var bnorm;
	var sigma;
	var scl;
	var a;
	var b;
	var r;
	var z;

	a = ab[ offsetAB ];
	b = ab[ offsetAB + strideAB ];
	anorm = Math.abs( a );
	bnorm = Math.abs( b );

	if ( bnorm === 0.0 ) {
		cs[ offsetCS ] = 1.0;
		cs[ offsetCS + strideCS ] = 0.0;
		ab[ offsetAB + strideAB ] = 0.0;
	} else if ( anorm === 0.0 ) {
		cs[ offsetCS ] = 0.0;
		cs[ offsetCS + strideCS ] = 1.0;
		ab[ offsetAB ] = b;
		ab[ offsetAB + strideAB ] = 1.0;
	} else {
		scl = Math.min( SAFMAX, Math.max( SAFMIN, anorm, bnorm ) );
		if ( anorm > bnorm ) {
			sigma = ( a > 0.0 ) ? 1.0 : -1.0;
		} else {
			sigma = ( b > 0.0 ) ? 1.0 : -1.0;
		}
		r = sigma * ( scl * Math.sqrt( (( a / scl ) * ( a / scl )) + (( b / scl ) * ( b / scl )) ) );
		cs[ offsetCS ] = a / r;
		cs[ offsetCS + strideCS ] = b / r;
		if ( anorm > bnorm ) {
			z = cs[ offsetCS + strideCS ];
		} else if ( cs[ offsetCS ] === 0.0 ) {
			z = 1.0;
		} else {
			z = 1.0 / cs[ offsetCS ];
		}
		ab[ offsetAB ] = r;
		ab[ offsetAB + strideAB ] = z;
	}
}


// EXPORTS //

export default drotg;
