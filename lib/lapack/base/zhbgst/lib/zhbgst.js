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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a complex Hermitian-definite banded generalized eigenproblem to standard form.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} vect - 'none' or 'update'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {integer} ka - number of super/subdiagonals of A
* @param {integer} kb - number of super/subdiagonals of B (ka >= kb >= 0)
* @param {Complex128Array} AB - band matrix A in band storage
* @param {PositiveInteger} LDAB - leading dimension of AB (>= ka+1)
* @param {Complex128Array} BB - split Cholesky factor from ZPBSTF
* @param {PositiveInteger} LDBB - leading dimension of BB (>= kb+1)
* @param {Complex128Array} X - transformation matrix
* @param {PositiveInteger} LDX - leading dimension of X
* @param {Complex128Array} WORK - complex workspace of dimension N
* @param {Float64Array} RWORK - real workspace of dimension N
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function zhbgst( order, vect, uplo, N, ka, kb, AB, LDAB, BB, LDBB, X, LDX, WORK, RWORK ) { // eslint-disable-line max-len, max-params
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sab1 = ( order === 'column-major' ) ? 1 : LDAB;
	const sab2 = ( order === 'column-major' ) ? LDAB : 1;
	const sbb1 = ( order === 'column-major' ) ? 1 : LDBB;
	const sbb2 = ( order === 'column-major' ) ? LDBB : 1;
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( LDAB < ka + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument violates the reference leading-dimension rule (column-major: rejected when `LDAB.LT.KA+1`). Value: `%d`.', LDAB ) );
	}
	if ( order === 'row-major' && ( LDAB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument violates the reference leading-dimension rule (row-major: must also cover the N columns). Value: `%d`.', LDAB ) );
	}
	if ( order === 'column-major' && ( LDBB < kb + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument violates the reference leading-dimension rule (column-major: rejected when `LDBB.LT.KB+1`). Value: `%d`.', LDBB ) );
	}
	if ( order === 'row-major' && ( LDBB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument violates the reference leading-dimension rule (row-major: must also cover the N columns). Value: `%d`.', LDBB ) );
	}
	if ( LDX < 1 || ( vect === 'update' ) && LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument violates the reference leading-dimension rule (rejected when `LDX.LT.1 .OR. WANTX .AND. LDX.LT.MAX( 1, N )`). Value: `%d`.', LDX ) );
	}
	if ( vect !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `vect` value. Value: `%s`.', vect ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, N );
		WORK = new Complex128Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
	}
	return base( vect, uplo, N, ka, kb, AB, sab1, sab2, 0, BB, sbb1, sbb2, 0, X, sx1, sx2, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhbgst;
