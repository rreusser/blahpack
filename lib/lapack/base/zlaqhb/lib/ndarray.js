/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Equilibrates a complex Hermitian band matrix using the scaling factors in the vector S.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super-diagonals (upper) or sub-diagonals (lower)
* @param {Complex128Array} AB - input/output band matrix, dimension (LDAB, N)
* @param {integer} strideAB1 - stride of the first dimension of `AB` (complex elements)
* @param {integer} strideAB2 - stride of the second dimension of `AB` (complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for `AB` (complex elements)
* @param {Float64Array} S - scaling factors, length N
* @param {integer} strideS - stride length for `S`
* @param {NonNegativeInteger} offsetS - starting index for `S`
* @param {number} scond - ratio of smallest to largest scaling factor
* @param {number} amax - absolute value of largest matrix element
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {string} equed - `'none'` or `'yes'`
*/
function zlaqhb( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, S, strideS, offsetS, scond, amax ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, S, strideS, offsetS, scond, amax ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlaqhb;
