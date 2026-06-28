

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes row and column scalings intended to equilibrate a complex Hermitian positive definite matrix in packed storage and reduce its condition number.
*
* @param {string} uplo - specifies whether the upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} AP - input Hermitian positive definite matrix in packed storage
* @param {Float64Array} s - output scale factors, length N
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Object} result with `info`, `scond`, and `amax` properties
*/
function zppequ( uplo, N, AP, s ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, AP, 1, 0, s, 1, 0 );
}


// EXPORTS //

export default zppequ;
