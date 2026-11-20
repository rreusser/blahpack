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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a matrix equation with a complex triangular matrix in Rectangular Full Packed format.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} transr - specifies the RFP storage format (`'no-transpose'` or `'conjugate-transpose'`)
* @param {string} side - specifies whether op(A) appears on the left or right (`'left'` or `'right'`)
* @param {string} uplo - specifies whether A is upper or lower triangular (`'upper'` or `'lower'`)
* @param {string} trans - specifies the operation applied to A (`'no-transpose'` or `'conjugate-transpose'`)
* @param {string} diag - specifies whether A is unit triangular (`'unit'` or `'non-unit'`)
* @param {NonNegativeInteger} M - number of rows of B
* @param {NonNegativeInteger} N - number of columns of B
* @param {Complex128} alpha - complex scalar multiplier
* @param {Complex128Array} A - RFP array
* @param {integer} strideA - stride length for `A`
* @param {Complex128Array} B - M-by-N complex matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "conjugate-transpose", "no-transpose"
* @throws {TypeError} third argument must be a valid operation side
* @throws {TypeError} fourth argument must be a valid matrix triangle
* @throws {TypeError} fifth argument must be one of the following: "conjugate-transpose", "no-transpose"
* @throws {TypeError} sixth argument must be a valid diagonal type
* @throws {RangeError} seventh argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be a nonnegative integer
* @throws {RangeError} thirteenth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} thirteenth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {TypeError} if a string argument is not a valid option
* @returns {Complex128Array} `B`
*/
function ztfsm( order, transr, side, uplo, trans, diag, M, N, alpha, A, strideA, B, LDB ) { // eslint-disable-line max-params
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( transr !== 'conjugate-transpose' && transr !== 'no-transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "conjugate-transpose", "no-transpose". Value: `%s`.', transr ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( trans !== 'conjugate-transpose' && trans !== 'no-transpose' ) {
		throw new TypeError( format( 'invalid argument. Fifth argument must be one of the following: "conjugate-transpose", "no-transpose". Value: `%s`.', trans ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Sixth argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	const oa = stride2offset( ( side === 'left' ) ? ( M * ( M + 1 ) ) / 2 : ( N * ( N + 1 ) ) / 2, strideA );
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	return base( transr, side, uplo, trans, diag, M, N, alpha, A, strideA, oa, B, sb1, sb2, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztfsm;
