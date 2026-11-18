/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Provides error bounds and backward error estimates for the solution to a complex triangular band system of equations.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super-/sub-diagonals
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} AB - triangular band matrix
* @param {PositiveInteger} LDAB - leading dimension of `AB` (>= `kd+1`)
* @param {Complex128Array} B - right-hand side matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} X - solution matrix
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} FERR - output forward error bounds (length `nrhs`)
* @param {Float64Array} BERR - output backward error estimates (length `nrhs`)
* @param {(Complex128Array|null)} WORK - workspace (>= `2*N` complex elements); auto-allocated when `null`
* @param {(Float64Array|null)} RWORK - workspace (>= `N` reals); auto-allocated when `null`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {TypeError} third argument must be a valid transpose operation
* @throws {TypeError} fourth argument must be a valid diagonal type
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function ztbrfs( order, uplo, trans, diag, N, kd, nrhs, AB, LDAB, B, LDB, X, LDX, FERR, BERR, WORK, RWORK ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sab1 = ( order === 'column-major' ) ? 1 : LDAB;
	const sab2 = ( order === 'column-major' ) ? LDAB : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kd < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', kd ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'column-major' && LDAB < ( kd + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to kd+1. Value: `%d`.', LDAB ) );
	}
	if ( order === 'row-major' && LDB < max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' && LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( order === 'row-major' && LDX < max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDX ) );
	}
	if ( order === 'column-major' && LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( max( 1, 2*N ) );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		RWORK = new Float64Array( max( 1, N ) );
	}
	return base( uplo, trans, diag, N, kd, nrhs, AB, sab1, sab2, 0, B, sb1, sb2, 0, X, sx1, sx2, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
}


// EXPORTS //

export default ztbrfs;
