/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MAIN //

/**
* Finds the index of the first element having the maximum absolute value.
*
* @private
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Float64Array} x - input array
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @returns {integer} 0-based index of the max element, or -1 if N < 1
*/
function idamax( N, x, strideX, offsetX ) {
	var dmax;
	var imax;
	var ix;
	var i;

	if ( N < 1 || strideX <= 0 ) {
		return -1;
	}
	if ( N === 1 ) {
		return 0;
	}

	ix = offsetX;
	dmax = Math.abs( x[ ix ] );
	imax = 0;
	ix += strideX;

	for ( i = 1; i < N; i++ ) {
		if ( Math.abs( x[ ix ] ) > dmax ) {
			imax = i;
			dmax = Math.abs( x[ ix ] );
		}
		ix += strideX;
	}
	return imax;
}


// EXPORTS //

export default idamax;
