// MODULES //

import base from './base.js';


// MAIN //

/**
* Computes the Sturm count of a symmetric tridiagonal matrix with a shift.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal of `D` in the factorization `T = L*D*L^T`
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} LLD - `(N-1)` elements `L(i)*L(i)*D(i)`
* @param {integer} strideLLD - stride length for `LLD`
* @param {NonNegativeInteger} offsetLLD - starting index for `LLD`
* @param {number} sigma - shift amount in `T - sigma*I = L*D*L^T`
* @param {number} pivmin - minimum pivot in the Sturm sequence
* @param {integer} r - twist index for the twisted factorization (1-based)
* @returns {integer} Sturm count (number of negative pivots)
*/
function dlaneg( N, d, strideD, offsetD, LLD, strideLLD, offsetLLD, sigma, pivmin, r ) { // eslint-disable-line max-len, max-params
	return base( N, d, strideD, offsetD, LLD, strideLLD, offsetLLD, sigma, pivmin, r ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaneg;
