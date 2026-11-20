/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MAIN //

/**
* Computes the singular values of a 2-by-2 triangular matrix:.
*
* \[ F  G \]
* \[ 0  H \]
*
* On return, `out[0]` is the smaller singular value (SSMIN) and `out[1]` is the
* larger singular value (SSMAX).
*
* The algorithm is numerically stable, avoiding overflow and unnecessary
* underflow by carefully ordering the arithmetic.
*
* @private
* @param {number} f - the (1,1) element of the 2-by-2 matrix
* @param {number} g - the (1,2) element of the 2-by-2 matrix
* @param {number} h - the (2,2) element of the 2-by-2 matrix
* @param {Float64Array} ssmin - output (length-1 array): the smaller singular value
* @param {Float64Array} ssmax - output (length-1 array): the larger singular value
*/
function dlas2( f, g, h, ssmin, ssmax ) {
	let as, at, au, c;

	const fa = Math.abs( f );
	const ga = Math.abs( g );
	const ha = Math.abs( h );
	const fhmn = Math.min( fa, ha );
	const fhmx = Math.max( fa, ha );

	if ( fhmn === 0.0 ) {
		ssmin[ 0 ] = 0.0;
		if ( fhmx === 0.0 ) {
			ssmax[ 0 ] = ga;
		} else {
			ssmax[ 0 ] = Math.max( fhmx, ga ) * Math.sqrt( 1.0 + (( Math.min( fhmx, ga ) / Math.max( fhmx, ga ) ) * ( Math.min( fhmx, ga ) / Math.max( fhmx, ga ) )) );
		}
	} else if ( ga < fhmx ) {
		as = 1.0 + (fhmn / fhmx);
		at = ( fhmx - fhmn ) / fhmx;
		au = ( ga / fhmx ) * ( ga / fhmx );
		c = 2.0 / ( Math.sqrt( (as * as) + au ) + Math.sqrt( (at * at) + au ) );
		ssmin[ 0 ] = fhmn * c;
		ssmax[ 0 ] = fhmx / c;
	} else {
		au = fhmx / ga;
		if ( au === 0.0 ) {
			// Avoid possible harmful underflow if exponent range
			// Asymmetric (true SSMIN may not underflow even if AU underflows)
			ssmin[ 0 ] = ( fhmn * fhmx ) / ga;
			ssmax[ 0 ] = ga;
		} else {
			as = 1.0 + (fhmn / fhmx);
			at = ( fhmx - fhmn ) / fhmx;
			c = 1.0 / ( Math.sqrt( 1.0 + (( as * au ) * ( as * au )) ) + Math.sqrt( 1.0 + (( at * au ) * ( at * au )) ) );
			ssmin[ 0 ] = ( fhmn * c ) * au;
			ssmin[ 0 ] += ssmin[ 0 ];
			ssmax[ 0 ] = ga / ( c + c );
		}
	}
}


// EXPORTS //

export default dlas2;
