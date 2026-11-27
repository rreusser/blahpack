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
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import ndarray from './ndarray.js';


// MAIN //

/**
* Returns the norm of a complex triangular band matrix.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('one-norm'|'max'|'inf-norm'|'frobenius')} norm - norm type
* @param {MatrixTriangle} uplo - `'upper'` or `'lower'`
* @param {DiagonalType} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} K - number of super/sub-diagonals
* @param {Complex128Array} AB - band matrix in band storage
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {(Float64Array|null)} WORK - workspace
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "one-norm", "max", "inf-norm", "frobenius"
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {TypeError} fourth argument must be a valid diagonal type
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, K + 1 )` (column-major)
* @returns {number} norm value
*/
function zlantb( order, norm, uplo, diag, N, K, AB, LDAB, WORK ) { // eslint-disable-line max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( norm !== 'one-norm' && norm !== 'max' && norm !== 'inf-norm' && norm !== 'frobenius' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "one-norm", "max", "inf-norm", "frobenius". Value: `%s`.', norm ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDAB;
	const sa2 = ( order === 'column-major' ) ? LDAB : 1;
	if ( WORK === null || WORK === void 0 ) {
		const minWork = N;
		WORK = new Float64Array( minWork );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( order === 'row-major' && LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( order === 'column-major' && LDAB < max( 1, K + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', K + 1, LDAB ) );
	}
	return ndarray( norm, uplo, diag, N, K, AB, sa1, sa2, 0, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlantb;
