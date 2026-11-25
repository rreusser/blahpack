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
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a complex triangular system with scaling to prevent overflow, where the matrix is in packed storage.
*
* @private
* @param {Layout} order - storage layout
* @param {MatrixTriangle} uplo - specifies whether the matrix is upper or lower triangular
* @param {TransposeOperation} trans - specifies the operation applied to A
* @param {DiagonalType} diag - specifies whether the matrix is unit or non-unit triangular
* @param {('no'|'yes')} normin - specifies whether CNORM is pre-computed
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} AP - packed triangular matrix
* @param {Complex128Array} x - right-hand side vector
* @param {integer} strideX - stride length for `x`
* @param {Float64Array} scale - output scale factor
* @param {Float64Array} CNORM - column norm array
* @param {integer} strideCNORM - stride length for `CNORM`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {TypeError} third argument must be a valid transpose operation
* @throws {TypeError} fourth argument must be a valid diagonal type
* @throws {TypeError} fifth argument must be one of the following: "no", "yes"
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info - 0 if successful
*/
function zlatps( order, uplo, trans, diag, normin, N, AP, x, strideX, scale, CNORM, strideCNORM ) { // eslint-disable-line max-params
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
	const ox = stride2offset( N, strideX );
	const ocnorm = stride2offset( N, strideCNORM );
	if ( order === 'row-major' ) {
		throw new TypeError( format( 'invalid argument. First argument must be \'column-major\'; packed storage is LAPACK column-major packed. Value: `%s`.', order ) );
	}
	return base( uplo, trans, diag, normin, N, AP, 1, 0, x, strideX, ox, scale, CNORM, strideCNORM, ocnorm );
}


// EXPORTS //

export default zlatps;
