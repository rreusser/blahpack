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
* Solves a system of linear equations `A * X = scale * RHS` with a general.
* N-by-N matrix A using the LU factorization with complete pivoting computed
* by zgetc2.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - LU-factored N-by-N matrix from zgetc2
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} RHS - right-hand side vector (overwritten with solution)
* @param {integer} strideRHS - stride for RHS
* @param {Int32Array} IPIV - row pivot indices from zgetc2, 0-based
* @param {integer} strideIPIV - stride for IPIV
* @param {Int32Array} JPIV - column pivot indices from zgetc2, 0-based
* @param {integer} strideJPIV - stride for JPIV
* @param {Float64Array} scale - output: `scale[0]` receives the scaling factor
* @throws {TypeError} first argument must be a valid order
* @returns {Complex128Array} `RHS`
*/
function zgesc2( order, N, A, LDA, RHS, strideRHS, IPIV, strideIPIV, JPIV, strideJPIV, scale ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const orhs = stride2offset( N, strideRHS );
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
	return base( N, A, sa1, sa2, 0, RHS, strideRHS, orhs, IPIV, strideIPIV, oipiv, JPIV, strideJPIV, ojpiv, scale ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgesc2;
