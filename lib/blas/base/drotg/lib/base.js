/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */


// VARIABLES //

const SAFMIN = 2.2250738585072014e-308; // 2^(-1022)
const SAFMAX = 8.98846567431158e+307;   // 2^1023


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
* @param {Float64Array} a - input/output (length-1 array): `a`
* @param {Float64Array} b - input/output (length-1 array): `b`
* @param {Float64Array} c - output (length-1 array): `c`
* @param {Float64Array} s - output (length-1 array): `s`
* @returns {void}
*/
function drotg( a, b, c, s ) {
	let sigma, scl, r, z;

	const anorm = Math.abs( a[ 0 ] );
	const bnorm = Math.abs( b[ 0 ] );

	if ( bnorm === 0.0 ) {
		c[ 0 ] = 1.0;
		s[ 0 ] = 0.0;
		b[ 0 ] = 0.0;
	} else if ( anorm === 0.0 ) {
		c[ 0 ] = 0.0;
		s[ 0 ] = 1.0;
		a[ 0 ] = b[ 0 ];
		b[ 0 ] = 1.0;
	} else {
		scl = Math.min( SAFMAX, Math.max( SAFMIN, anorm, bnorm ) );
		if ( anorm > bnorm ) {
			sigma = ( a[ 0 ] > 0.0 ) ? 1.0 : -1.0;
		} else {
			sigma = ( b[ 0 ] > 0.0 ) ? 1.0 : -1.0;
		}
		r = sigma * ( scl * Math.sqrt( (( a[ 0 ] / scl ) * ( a[ 0 ] / scl )) + (( b[ 0 ] / scl ) * ( b[ 0 ] / scl )) ) );
		c[ 0 ] = a[ 0 ] / r;
		s[ 0 ] = b[ 0 ] / r;
		if ( anorm > bnorm ) {
			z = s[ 0 ];
		} else if ( c[ 0 ] === 0.0 ) {
			z = 1.0;
		} else {
			z = 1.0 / c[ 0 ];
		}
		a[ 0 ] = r;
		b[ 0 ] = z;
	}
}


// EXPORTS //

export default drotg;
