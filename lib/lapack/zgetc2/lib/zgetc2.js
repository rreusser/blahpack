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
* Computes an LU factorization with complete pivoting of a general N-by-N complex matrix.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - N-by-N complex matrix (overwritten with L and U)
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Int32Array} IPIV - row pivot indices (length N)
* @param {integer} strideIPIV - stride for IPIV
* @param {Int32Array} JPIV - column pivot indices (length N)
* @param {integer} strideJPIV - stride for JPIV
* @throws {TypeError} first argument must be a valid order
* @returns {integer} info - 0 if successful, >0 if U(info,info) is small
*/
function zgetc2( order, N, A, LDA, IPIV, strideIPIV, JPIV, strideJPIV ) { // eslint-disable-line max-len, max-params

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
	return base( N, A, sa1, sa2, 0, IPIV, strideIPIV, oipiv, JPIV, strideJPIV, ojpiv ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgetc2;
