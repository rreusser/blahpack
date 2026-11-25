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
* Solves a system of linear equations using the LU factorization with complete pivoting computed by sgetc2.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {Float64Array} A - on entry, the LU part of the factorization of the n-by-n matrix A computed by DGETC2: A = P * L * U * Q.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} RHS - on entry, the right hand side vector b. On exit, the solution vector X.
* @param {integer} strideRHS - stride length for `RHS`
* @param {Int32Array} IPIV - the pivot indices; for 1 <= i <= N, row i of the matrix has been interchanged with row IPIV(i) (0-based).
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {Int32Array} JPIV - the pivot indices; for 1 <= j <= N, column j of the matrix has been interchanged with column JPIV(j) (0-based).
* @param {integer} strideJPIV - stride length for `JPIV`
* @param {Float64Array} scale - on exit, SCALE contains the scale factor.
* @throws {TypeError} first argument must be a valid order
* @returns {Float64Array} `RHS`
*/
function dgesc2( order, N, A, LDA, RHS, strideRHS, IPIV, strideIPIV, JPIV, strideJPIV, scale ) { // eslint-disable-line max-len, max-params

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

export default dgesc2;
