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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the LU factorization with complete pivoting of the general n-by-n matrix.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {Float64Array} A - on entry, the n-by-n matrix A to be factored. On exit, the factors L and U from the factorization A = P*L*U*Q; the unit diagonal elements of L are not stored.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Int32Array} IPIV - the pivot indices; for 1 <= i <= N, row i of the matrix has been interchanged with row IPIV(i) (0-based).
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {Int32Array} JPIV - the pivot indices; for 1 <= j <= N, column j of the matrix has been interchanged with column JPIV(j) (0-based).
* @param {integer} strideJPIV - stride length for `JPIV`
* @throws {TypeError} first argument must be a valid order
* @returns {integer} info status code
*/
function dgetc2( order, N, A, LDA, IPIV, strideIPIV, JPIV, strideJPIV ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const oipiv = stride2offset( N, strideIPIV );
	const ojpiv = stride2offset( N, strideJPIV );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	return base( N, A, sa1, sa2, 0, IPIV, strideIPIV, oipiv, JPIV, strideJPIV, ojpiv );
}


// EXPORTS //

export default dgetc2;
