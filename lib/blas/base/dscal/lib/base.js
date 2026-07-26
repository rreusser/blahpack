/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// VARIABLES //

const M = 5;


// MAIN //

/**
* Scales a vector by a constant.
*
* @private
* @param {PositiveInteger} N - number of indexed elements
* @param {number} alpha - scalar
* @param {Float64Array} x - input array
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting `x` index
* @returns {Float64Array} input array
*/
function dscal( N, alpha, x, strideX, offsetX ) {
	let ix, m, i;

	if ( N <= 0 ) {
		return x;
	}
	ix = offsetX;

	// Use unrolled loops if stride is 1...
	if ( strideX === 1 ) {
		m = N % M;
		if ( m > 0 ) {
			for ( i = 0; i < m; i++ ) {
				x[ ix ] *= alpha;
				ix += 1;
			}
		}
		if ( N < M ) {
			return x;
		}
		for ( i = m; i < N; i += M ) {
			x[ix] *= alpha;
			x[ix+1] *= alpha;
			x[ix+2] *= alpha;
			x[ix+3] *= alpha;
			x[ix+4] *= alpha;
			ix += M;
		}
		return x;
	}
	for ( i = 0; i < N; i++ ) {
		x[ ix ] *= alpha;
		ix += strideX;
	}
	return x;
}


// EXPORTS //

export default dscal;
