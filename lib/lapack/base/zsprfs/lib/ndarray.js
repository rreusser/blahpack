
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution to a complex symmetric system A * X = B with packed storage and provides error bounds.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} AP - original symmetric matrix in packed storage
* @param {integer} strideAP - stride for `AP`
* @param {NonNegativeInteger} offsetAP - offset into `AP`
* @param {Complex128Array} AFP - factored matrix from `zsptrf` in packed storage
* @param {integer} strideAFP - stride for `AFP`
* @param {NonNegativeInteger} offsetAFP - offset into `AFP`
* @param {Int32Array} IPIV - pivot indices from `zsptrf` (0-based)
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - offset for `IPIV`
* @param {Complex128Array} B - right-hand side matrix
* @param {integer} strideB1 - first stride of `B`
* @param {integer} strideB2 - second stride of `B`
* @param {NonNegativeInteger} offsetB - offset into `B`
* @param {Complex128Array} X - solution matrix (improved on exit)
* @param {integer} strideX1 - first stride of `X`
* @param {integer} strideX2 - second stride of `X`
* @param {NonNegativeInteger} offsetX - offset into `X`
* @param {Float64Array} FERR - output forward error bounds
* @param {integer} strideFERR - stride for `FERR`
* @param {NonNegativeInteger} offsetFERR - offset for `FERR`
* @param {Float64Array} BERR - output backward error bounds
* @param {integer} strideBERR - stride for `BERR`
* @param {NonNegativeInteger} offsetBERR - offset for `BERR`
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWORK - stride for `WORK`
* @param {NonNegativeInteger} offsetWORK - offset for `WORK`
* @param {Float64Array} RWORK - workspace
* @param {integer} strideRWORK - stride for `RWORK`
* @param {NonNegativeInteger} offsetRWORK - offset for `RWORK`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function zsprfs( uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zsprfs;
