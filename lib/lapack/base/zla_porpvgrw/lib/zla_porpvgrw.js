/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a complex Hermitian positive-definite matrix.
*
* @param {string} uplo - specifies whether the upper or lower triangle is stored (`upper` or `lower`)
* @param {NonNegativeInteger} ncols - number of columns of the matrix A
* @param {Complex128Array} A - input matrix A (column-major)
* @param {NonNegativeInteger} LDA - leading dimension of `A`
* @param {Complex128Array} AF - triangular factor from the Cholesky factorization (column-major)
* @param {NonNegativeInteger} LDAF - leading dimension of `AF`
* @param {Float64Array} WORK - workspace array of length at least `2*ncols`
* @returns {number} reciprocal pivot growth factor
*/
function zla_porpvgrw( uplo, ncols, A, LDA, AF, LDAF, WORK ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	return base( uplo, ncols, A, 1, LDA, 0, AF, 1, LDAF, 0, WORK, 1, 0 );
}


// EXPORTS //

export default zla_porpvgrw;
