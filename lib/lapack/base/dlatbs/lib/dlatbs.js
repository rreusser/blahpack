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
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a triangular banded system of equations.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} uplo - specifies whether the matrix A is upper or lower triangular. `'upper'`: Upper triangular `'lower'`: Lower triangular.
* @param {string} trans - specifies the operation applied to A. `'no-transpose'`: Solve A * x = s*b (No transpose) `'transpose'`: Solve A**T* x = s*b (Transpose)
* @param {string} diag - specifies whether or not the matrix A is unit triangular. `'non-unit'`: Non-unit triangular `'unit'`: Unit triangular.
* @param {string} normin - specifies whether CNORM has been set or not. `'yes'`: CNORM contains the column norms on entry `'no'`: CNORM is not set on entry. On exit, the norms will be computed and stored in CNORM.
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {NonNegativeInteger} kd - the number of subdiagonals or superdiagonals in the triangular matrix A.
* @param {Float64Array} AB - the upper or lower triangular band matrix A, stored in the first KD+1 rows of the array.
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} x - on entry, the right hand side b of the triangular system. On exit, X is overwritten by the solution vector x.
* @param {integer} strideX - stride length for `x`
* @param {Float64Array} scale - the scaling factor s for the triangular system A * x = s*b or A**T* x = s*b.
* @param {Float64Array} CNORM - if `normin === 'yes'`, CNORM is an input argument and CNORM(j) contains the norm of the off-diagonal part of the j-th column of A.
* @param {integer} strideCNORM - stride length for `CNORM`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {TypeError} third argument must be a valid transpose operation
* @throws {TypeError} fourth argument must be a valid diagonal type
* @throws {TypeError} fifth argument must be one of the following: "no", "yes"
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be a nonnegative integer
* @throws {RangeError} ninth argument must be greater than or equal to `kd + 1` (column-major)
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function dlatbs( order, uplo, trans, diag, normin, N, kd, AB, LDAB, x, strideX, scale, CNORM, strideCNORM ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( normin !== 'no' && normin !== 'yes' ) {
		throw new TypeError( format( 'invalid argument. Fifth argument must be one of the following: "no", "yes". Value: `%s`.', normin ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kd < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', kd ) );
	}
	if ( order === 'column-major' && ( LDAB < kd + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to %d. Value: `%d`.', kd + 1, LDAB ) );
	}
	if ( order === 'row-major' && ( LDAB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDAB ) );
	}
	const sab1 = ( order === 'column-major' ) ? 1 : LDAB;
	const sab2 = ( order === 'column-major' ) ? LDAB : 1;
	const ox = stride2offset( N, strideX );
	const ocnorm = stride2offset( N, strideCNORM );
	return base( uplo, trans, diag, normin, N, kd, AB, sab1, sab2, 0, x, strideX, ox, scale, CNORM, strideCNORM, ocnorm ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlatbs;
