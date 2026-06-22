
// MODULES //

import base from './base.js';


// MAIN //

/**
* Uses inverse iteration to find an eigenvector of a complex upper Hessenberg matrix.
*
* @param {boolean} rightv - rightv
* @param {boolean} noinit - noinit
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} H - upper Hessenberg matrix
* @param {integer} strideH1 - stride of the first dimension of `H`
* @param {integer} strideH2 - stride of the second dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {Complex128} w - complex eigenvalue
* @param {Complex128Array} v - in/out eigenvector
* @param {integer} strideV - stride length for `v`
* @param {NonNegativeInteger} offsetV - starting index for `v`
* @param {Complex128Array} B - workspace matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} RWORK - output array
* @param {integer} strideRWORK - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWORK - starting index for `RWORK`
* @param {number} eps3 - eps3
* @param {number} smlnum - smlnum
* @returns {integer} status code (0 = success)
*/
function zlaein( rightv, noinit, N, H, strideH1, strideH2, offsetH, w, v, strideV, offsetV, B, strideB1, strideB2, offsetB, RWORK, strideRWORK, offsetRWORK, eps3, smlnum ) { // eslint-disable-line max-len, max-params
	return base( rightv, noinit, N, H, strideH1, strideH2, offsetH, w, v, strideV, offsetV, B, strideB1, strideB2, offsetB, RWORK, strideRWORK, offsetRWORK, eps3, smlnum ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlaein;
