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
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number of a complex Hermitian matrix in packed storage.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} uplo - specifies whether the upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} AP - factored packed matrix from zhptrf
* @param {Int32Array} IPIV - pivot indices from zhptrf
* @param {integer} strideIPIV - stride for IPIV
* @param {number} anorm - the 1-norm of the original matrix A
* @param {Float64Array} rcond - output: rcond[0] is the reciprocal condition number
* @param {Complex128Array} WORK - workspace array of length at least 2*N
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function zhpcon( order, uplo, N, AP, IPIV, strideIPIV, anorm, rcond, WORK ) {

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( order === 'row-major' ) {
		throw new TypeError( format( 'invalid argument. First argument must be \'column-major\'; packed storage is LAPACK column-major packed. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	const oipiv = stride2offset( N, strideIPIV );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 2 * N );
		WORK = new Complex128Array( minWork );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, AP, 1, 0, IPIV, strideIPIV, oipiv, anorm, rcond, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhpcon;
