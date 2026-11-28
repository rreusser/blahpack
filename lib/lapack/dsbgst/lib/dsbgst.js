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
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import strided from './strided.js';


// MAIN //

/**
* Reduces a real symmetric-definite banded generalized eigenproblem to standard form.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('none'|'update')} vect - 'none' or 'update'
* @param {MatrixTriangle} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {NonNegativeInteger} ka - number of super/subdiagonals of A
* @param {NonNegativeInteger} kb - number of super/subdiagonals of B (ka >= kb >= 0)
* @param {Float64Array} AB - band matrix A in band storage
* @param {PositiveInteger} LDAB - leading dimension of AB (>= ka+1)
* @param {Float64Array} BB - split Cholesky factor from DPBSTF
* @param {PositiveInteger} LDBB - leading dimension of BB (>= kb+1)
* @param {Float64Array} X - transformation matrix
* @param {PositiveInteger} LDX - leading dimension of X
* @param {(Float64Array|null)} WORK - workspace of dimension 2*N
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "none", "update"
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument is invalid (rejected when `kb < 0 || kb > ka`)
* @throws {RangeError} eighth argument must be greater than or equal to `ka + 1` (column-major)
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} tenth argument must be greater than or equal to `kb + 1` (column-major)
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} twelfth argument is invalid (rejected when `LDX < 1 || ( vect === "update" && LDX < max( 1, N ) )`)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info - 0 if successful
*/
function dsbgst( order, vect, uplo, N, ka, kb, AB, LDAB, BB, LDBB, X, LDX, WORK ) { // eslint-disable-line max-len, max-params
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( vect !== 'none' && vect !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "none", "update". Value: `%s`.', vect ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( ka < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', ka ) );
	}
	if ( kb < 0 || kb > ka ) {
		throw new RangeError( format( 'invalid argument. Sixth argument is invalid (rejected when `kb < 0 || kb > ka`). Value: `%d`.', kb ) );
	}
	if ( order === 'column-major' && ( LDAB < ka + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to %d. Value: `%d`.', ka + 1, LDAB ) );
	}
	if ( order === 'row-major' && ( LDAB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDAB ) );
	}
	if ( order === 'column-major' && ( LDBB < kb + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to %d. Value: `%d`.', kb + 1, LDBB ) );
	}
	if ( order === 'row-major' && ( LDBB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDBB ) );
	}
	if ( LDX < 1 || ( vect === 'update' && LDX < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument is invalid (rejected when `LDX < 1 || ( vect === "update" && LDX < max( 1, N ) )`). Value: `%d`.', LDX ) );
	}
	const sab1 = ( order === 'column-major' ) ? 1 : LDAB;
	const sab2 = ( order === 'column-major' ) ? LDAB : 1;
	const sbb1 = ( order === 'column-major' ) ? 1 : LDBB;
	const sbb2 = ( order === 'column-major' ) ? LDBB : 1;
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 2 * N );
		WORK = new Float64Array( minWork );
	}
	return strided( vect, uplo, N, ka, kb, AB, sab1, sab2, 0, BB, sbb1, sbb2, 0, X, sx1, sx2, 0, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dsbgst;
