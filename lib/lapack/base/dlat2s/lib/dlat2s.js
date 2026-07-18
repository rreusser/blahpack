/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Converts a double-precision triangular matrix `A` to a single-precision triangular matrix `SA`.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} uplo - specifies whether `A` is upper (`'upper'`) or lower (`'lower'`) triangular
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - input double-precision matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float32Array} SA - output single-precision matrix
* @param {PositiveInteger} LDSA - leading dimension of `SA`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to `max(1,N)`
* @throws {RangeError} seventh argument must be greater than or equal to `max(1,N)`
* @returns {integer} status code (0 = success, 1 = overflow)
*/
function dlat2s( order, uplo, N, A, LDA, SA, LDSA ) {
	let ssa1, ssa2, sa1, sa2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDSA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDSA ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		ssa1 = 1;
		ssa2 = LDSA;
	} else {
		sa1 = LDA;
		sa2 = 1;
		ssa1 = LDSA;
		ssa2 = 1;
	}
	return base( uplo, N, A, sa1, sa2, 0, SA, ssa1, ssa2, 0 );
}


// EXPORTS //

export default dlat2s;
