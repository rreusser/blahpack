/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// VARIABLES //

const SAFMIN = 2.2250738585072014e-308;
const EPS = 2.220446049250313e-16;
const LN2 = Math.log( 2.0 );
const EXP2 = Math.trunc( Math.log( SAFMIN / EPS ) / LN2 / 2.0 );
const SAFMN2 = Math.pow( 2.0, EXP2 );
const SAFMX2 = 1.0 / SAFMN2;


// MAIN //

/**
* Generates a plane rotation so that:.
*
* ```text
* [  cs  sn ]   [ f ]   [ r ]
* [ -sn  cs ] . [ g ] = [ 0 ]    where cs^2 + sn^2 = 1.
* ```
*
* ## Notes
*
* -   This is a slower, more accurate variant of the Level-1 BLAS routine
*     `drotg`. Unlike `dlartg`, the sign is chosen so that `r >= 0`.
*
* -   If `g = 0`, then `cs = sign(1, f)` and `sn = 0`.
*
* -   If `f = 0` and `g != 0`, then `cs = 0` and `sn = sign(1, g)`.
*
* -   The algorithm incorporates iterative rescaling to avoid overflow or
*     underflow.
*
* @private
* @param {number} f - first component of the vector to be rotated
* @param {number} g - second component of the vector to be rotated
* @param {Float64Array} cs - output (length-1 array): the cosine of the rotation
* @param {Float64Array} sn - output (length-1 array): the sine of the rotation
* @param {Float64Array} r - output (length-1 array): the nonzero component of the rotated vector
*/
function dlartgp( f, g, cs, sn, r ) {
	let count, scale, af, ag, f1, g1, i, rLocal;

	if ( g === 0.0 ) {
		cs[ 0 ] = ( f >= 0.0 ) ? 1.0 : -1.0;
		sn[ 0 ] = 0.0;
		r[ 0 ] = Math.abs( f );
		return;
	}
	if ( f === 0.0 ) {
		cs[ 0 ] = 0.0;
		sn[ 0 ] = ( g >= 0.0 ) ? 1.0 : -1.0;
		r[ 0 ] = Math.abs( g );
		return;
	}
	f1 = f;
	g1 = g;
	af = Math.abs( f1 );
	ag = Math.abs( g1 );
	scale = ( af > ag ) ? af : ag;
	if ( scale >= SAFMX2 ) {
		count = 0;
		do {
			count += 1;
			f1 *= SAFMN2;
			g1 *= SAFMN2;
			af = Math.abs( f1 );
			ag = Math.abs( g1 );
			scale = ( af > ag ) ? af : ag;
		} while ( scale >= SAFMX2 && count < 20 );
		rLocal = Math.sqrt( ( f1 * f1 ) + ( g1 * g1 ) );
		cs[ 0 ] = f1 / rLocal;
		sn[ 0 ] = g1 / rLocal;
		for ( i = 0; i < count; i += 1 ) {
			rLocal *= SAFMX2;
		}
	} else if ( scale <= SAFMN2 ) {
		count = 0;
		do {
			count += 1;
			f1 *= SAFMX2;
			g1 *= SAFMX2;
			af = Math.abs( f1 );
			ag = Math.abs( g1 );
			scale = ( af > ag ) ? af : ag;
		} while ( scale <= SAFMN2 );
		rLocal = Math.sqrt( ( f1 * f1 ) + ( g1 * g1 ) );
		cs[ 0 ] = f1 / rLocal;
		sn[ 0 ] = g1 / rLocal;
		for ( i = 0; i < count; i += 1 ) {
			rLocal *= SAFMN2;
		}
	} else {
		rLocal = Math.sqrt( ( f1 * f1 ) + ( g1 * g1 ) );
		cs[ 0 ] = f1 / rLocal;
		sn[ 0 ] = g1 / rLocal;
	}
	if ( rLocal < 0.0 ) {
		cs[ 0 ] = -cs[ 0 ];
		sn[ 0 ] = -sn[ 0 ];
		rLocal = -rLocal;
	}
	r[ 0 ] = rLocal;
}


// EXPORTS //

export default dlartgp;
