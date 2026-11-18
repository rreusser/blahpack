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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes row and column scalings intended to equilibrate a symmetric positive definite band matrix and reduce its condition number.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} uplo - specifies whether the upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of superdiagonals or subdiagonals
* @param {Float64Array} AB - input band matrix in band storage
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} s - output scale factors
* @param {integer} strideS - stride for `s`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Object} result with `info`, `scond`, and `amax` properties
*/
function dpbequ( order, uplo, N, kd, AB, LDAB, s, strideS ) {

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sab1 = ( order === 'column-major' ) ? 1 : LDAB;
	const sab2 = ( order === 'column-major' ) ? LDAB : 1;
	const os = stride2offset( N, strideS );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( order === 'column-major' && LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	return base( uplo, N, kd, AB, sab1, sab2, 0, s, strideS, os );
}


// EXPORTS //

export default dpbequ;
