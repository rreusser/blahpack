
// MODULES //

import base from './base.js';


// MAIN //

/**
* Computes one eigenvalue of a symmetric tridiagonal matrix to suitable accuracy.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {integer} iw - 1-based index of the eigenvalue to compute
* @param {number} gl - lower bound of the initial interval
* @param {number} gu - upper bound of the initial interval
* @param {Float64Array} D - diagonal elements (length `N`)
* @param {integer} strideD - stride length for `D`
* @param {NonNegativeInteger} offsetD - starting index for `D`
* @param {Float64Array} E2 - squared off-diagonal elements (length `N-1`)
* @param {integer} strideE2 - stride length for `E2`
* @param {NonNegativeInteger} offsetE2 - starting index for `E2`
* @param {number} pivmin - minimum pivot in the Sturm sequence
* @param {number} reltol - relative tolerance for the returned eigenvalue
* @param {Float64Array} w - output array for the computed eigenvalue (length >= 1)
* @param {Float64Array} werr - output array for the error bound (length >= 1)
* @returns {integer} info - status code (0 = success, -1 = did not converge)
*/
function dlarrk( N, iw, gl, gu, D, strideD, offsetD, E2, strideE2, offsetE2, pivmin, reltol, w, werr ) { // eslint-disable-line max-len, max-params
	return base( N, iw, gl, gu, D, strideD, offsetD, E2, strideE2, offsetE2, pivmin, reltol, w, werr ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlarrk;
