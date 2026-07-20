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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a complex triangular band system of equations with scaling to prevent overflow.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {string} normin - `'no'` (CNORM is computed)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super-/sub-diagonals
* @param {Complex128Array} AB - triangular band matrix
* @param {PositiveInteger} LDAB - leading dimension of `AB` (>= `kd+1`)
* @param {Complex128Array} x - right-hand side; overwritten by the solution
* @param {integer} strideX - `x` stride length
* @param {Float64Array} scale - output array (single element) receiving the scaling factor
* @param {Float64Array} CNORM - workspace/column norms (length `N`)
* @param {integer} strideCNORM - `CNORM` stride length
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {TypeError} second argument must be a valid transpose operation
* @throws {TypeError} third argument must be a valid diagonal type
* @throws {TypeError} fourth argument must be a valid normin value
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zlatbs( uplo, trans, diag, normin, N, kd, AB, LDAB, x, strideX, scale, CNORM, strideCNORM ) {
	const sab1 = 1;
	const sab2 = LDAB;

	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( normin !== 'no' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid `normin` value. Value: `%s`.', normin ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kd < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', kd ) );
	}
	if ( LDAB < ( kd + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to kd+1. Value: `%d`.', LDAB ) );
	}
	const ox = stride2offset( N, strideX );
	const ocnorm = stride2offset( N, strideCNORM );
	return base( uplo, trans, diag, normin, N, kd, AB, sab1, sab2, 0, x, strideX, ox, scale, CNORM, strideCNORM, ocnorm );
}


// EXPORTS //

export default zlatbs;
