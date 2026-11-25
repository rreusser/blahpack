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

// LA_CONSTANTS for double precision:

// Dsafmin = 2^(-1022)

// Dsafmax = 1/dsafmin = 2^1022
const SAFMIN = 2.2250738585072014e-308;
const SAFMAX = 4.49423283715579e+307;
const RTMIN = Math.sqrt( SAFMIN );
const RTMAX = Math.sqrt( SAFMAX / 2.0 );


// MAIN //

/**
* Generates a plane rotation with real cosine and real sine.
*
* \[  c  s \] . \[ f \] = \[ r \]
* \[ -s  c \]   \[ g \]   \[ 0 \]
*
* where c^2 + s^2 = 1.
*
* ## Notes
*
* -   The mathematical formulas used are:
*     -   r = sign(f) * sqrt(f^2 + g^2)
*     -   c = f / r
*     -   s = g / r
*
*     Hence c >= 0.
*
* -   The algorithm incorporates scaling to avoid overflow or underflow.
*
* -   If g = 0, then c = 1 and s = 0.
*
* -   If f = 0 and g != 0, then c = 0 and s = sign(1, g).
*
* @private
* @param {number} f - first component of the vector to be rotated
* @param {number} g - second component of the vector to be rotated
* @param {Float64Array} c - output (length-1 array): `c`
* @param {Float64Array} s - output (length-1 array): `s`
* @param {Float64Array} r - output (length-1 array): `r`
*/
function dlartg( f, g, c, s, r ) {
	let fs, gs, d, u;

	const f1 = Math.abs( f );
	const g1 = Math.abs( g );

	if ( g === 0.0 ) {
		c[ 0 ] = 1.0;
		s[ 0 ] = 0.0;
		r[ 0 ] = f;
	} else if ( f === 0.0 ) {
		c[ 0 ] = 0.0;
		s[ 0 ] = ( g > 0.0 ) ? 1.0 : -1.0;
		r[ 0 ] = g1;
	} else if ( f1 > RTMIN && f1 < RTMAX && g1 > RTMIN && g1 < RTMAX ) {
		d = Math.sqrt( (f * f) + (g * g) );
		c[ 0 ] = f1 / d;
		r[ 0 ] = ( f > 0.0 ) ? d : -d;
		s[ 0 ] = g / r[ 0 ];
	} else {
		u = Math.min( SAFMAX, Math.max( SAFMIN, f1, g1 ) );
		fs = f / u;
		gs = g / u;
		d = Math.sqrt( (fs * fs) + (gs * gs) );
		c[ 0 ] = Math.abs( fs ) / d;
		r[ 0 ] = ( f > 0.0 ) ? d * u : -(d * u);
		s[ 0 ] = gs / ( ( f > 0.0 ) ? d : -d );
	}
}


// EXPORTS //

export default dlartg;
