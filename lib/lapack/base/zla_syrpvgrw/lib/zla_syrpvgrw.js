
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a complex symmetric indefinite matrix.
*
* @param {string} uplo - specifies whether the upper or lower triangle is stored (`upper` or `lower`)
* @param {NonNegativeInteger} N - number of rows and columns of the matrix A
* @param {NonNegativeInteger} info - value of INFO returned from zsytrf (0 = success, k > 0 = singular at column k, 1-based)
* @param {Complex128Array} A - input matrix A (column-major, in complex elements)
* @param {NonNegativeInteger} LDA - leading dimension of `A`
* @param {Complex128Array} AF - factored matrix from zsytrf (column-major, in complex elements)
* @param {NonNegativeInteger} LDAF - leading dimension of `AF`
* @param {Int32Array} IPIV - pivot indices from zsytrf (0-based)
* @param {Float64Array} WORK - workspace array of length at least `2*N`
* @returns {number} reciprocal pivot growth factor
*/
function zla_syrpvgrw( uplo, N, info, A, LDA, AF, LDAF, IPIV, WORK ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDAF < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAF ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 2 * N );
		WORK = new Float64Array( minWork );
	}
	return base( uplo, N, info, A, 1, LDA, 0, AF, 1, LDAF, 0, IPIV, 1, 0, WORK, 1, 0 );
}


// EXPORTS //

export default zla_syrpvgrw;
