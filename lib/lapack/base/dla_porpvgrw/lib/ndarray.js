
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a symmetric positive-definite matrix.
*
* @param {string} uplo - specifies whether the upper or lower triangle is stored (`upper` or `lower`)
* @param {NonNegativeInteger} ncols - number of columns of the matrix A
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} AF - triangular factor from the Cholesky factorization
* @param {integer} strideAF1 - stride of the first dimension of `AF`
* @param {integer} strideAF2 - stride of the second dimension of `AF`
* @param {NonNegativeInteger} offsetAF - starting index for `AF`
* @param {Float64Array} WORK - workspace array of length at least `2*ncols`
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {number} reciprocal pivot growth factor
*/
function dla_porpvgrw( uplo, ncols, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	var minWork = 2 * ncols;
	if ( !WORK || ( WORK.length - offsetWORK ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWORK, ( WORK ) ? WORK.length : 0 ) );
	}
	return base( uplo, ncols, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, WORK, strideWORK, offsetWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default dla_porpvgrw;
