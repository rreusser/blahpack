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
* Converts A given by ZHETRF into L and D or vice-versa.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {MatrixTriangle} uplo - specifies whether the details of the factorization are stored as an upper or lower triangular matrix. `'upper'`: Upper triangular, form is A = U*D*U**T; `'lower'`: Lower triangular, form is A = L*D*L**T.
* @param {('convert'|'revert')} way - `'convert'`: Convert `'revert'`: Revert.
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {Complex128Array} A - the block diagonal matrix D and the multipliers used to obtain the factor U or L as computed by ZSYTRF.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Int32Array} IPIV - details of the interchanges and the block structure of D as determined by ZSYTRF (0-based).
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {Complex128Array} E - e stores the supdiagonal/subdiagonal of the symmetric 1-by-1 or 2-by-2 block diagonal matrix D in LDLT.
* @param {integer} strideE - stride length for `E`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {TypeError} third argument must be one of the following: "convert", "revert"
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, N )`
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function zsyconv( order, uplo, way, N, A, LDA, IPIV, strideIPIV, E, strideE ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( way !== 'convert' && way !== 'revert' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "convert", "revert". Value: `%s`.', way ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const oipiv = stride2offset( N, strideIPIV );
	const oe = stride2offset( N, strideE );
	return base( uplo, way, N, A, sa1, sa2, 0, IPIV, strideIPIV, oipiv, E, strideE, oe );
}


// EXPORTS //

export default zsyconv;
