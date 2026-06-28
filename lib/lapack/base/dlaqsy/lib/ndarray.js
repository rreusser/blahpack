
// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Equilibrates a symmetric matrix A using the scaling factors in the vector S.
*
* This sets A(i,j) = S(i) _ A(i,j) _ S(j) when the matrix is poorly scaled.
*
* Returns the equilibration type:
* - 'N' - no equilibration was needed
* - 'Y' - equilibration was done
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input/output N-by-N symmetric matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} s - scaling factors, length N
* @param {integer} strideS - stride for s
* @param {NonNegativeInteger} offsetS - index offset for s
* @param {number} scond - ratio of smallest to largest scaling factor
* @param {number} amax - absolute value of largest matrix element
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {string} equed - 'N' or 'Y'
*/
function dlaqsy( uplo, N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, scond, amax, equed ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, scond, amax, equed ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqsy;
