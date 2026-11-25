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
* Computes the solution to a complex system of linear equations A·X = B.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - the number of linear equations, i.e., the order of the matrix A.
* @param {NonNegativeInteger} nrhs - the number of right hand sides, i.e., the number of columns of the matrix B.
* @param {Complex128Array} A - on entry, the N-by-N coefficient matrix A. On exit, the factors L and U from the factorization A = P*L*U; the unit diagonal elements of L are not stored.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Int32Array} IPIV - the pivot indices that define the permutation matrix P; row i of the matrix was interchanged with row IPIV(i) (0-based).
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {Complex128Array} B - on entry, the N-by-NRHS matrix of right hand side matrix B. On exit, if INFO = 0, the N-by-NRHS solution matrix X.
* @param {PositiveInteger} LDB - leading dimension of `B`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @returns {integer} info status code
*/
function zgesv( order, N, nrhs, A, LDA, IPIV, strideIPIV, B, LDB ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDB ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const oipiv = stride2offset( N, strideIPIV );
	return base( N, nrhs, A, sa1, sa2, 0, IPIV, strideIPIV, oipiv, B, sb1, sb2, 0 );
}


// EXPORTS //

export default zgesv;
