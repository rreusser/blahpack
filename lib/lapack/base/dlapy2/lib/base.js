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
* Returns sqrt(x**2 + y**2), taking care not to cause unnecessary.
* overflow and unnecessary underflow.
*
* @private
* @param {number} x - first value
* @param {number} y - second value
* @returns {number} sqrt(x**2 + y**2)
*/
function dlapy2( x, y ) {

	// Handle NaN
	if ( x !== x ) {
		return x;
	}
	if ( y !== y ) {
		return y;
	}

	const xabs = Math.abs( x );
	const yabs = Math.abs( y );
	const w = Math.max( xabs, yabs );
	const z = Math.min( xabs, yabs );

	if ( z === 0.0 || w > 1.7976931348623157e+308 ) {
		return w;
	}
	return w * Math.sqrt( 1.0 + (( z / w ) * ( z / w )) );
}


// EXPORTS //

export default dlapy2;
