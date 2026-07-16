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

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the reciprocal condition number of a real triangular band matrix.
*
* @param {string} norm - norm type: 'one-norm' or 'inf-norm'
* @param {string} uplo - 'upper' or 'lower'
* @param {string} diag - 'unit' or 'non-unit'
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} kd - number of superdiagonals (upper) or subdiagonals (lower)
* @param {Float64Array} AB - triangular band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} rcond - output array of length 1; rcond[0] receives the reciprocal condition number
* @param {Float64Array} WORK - workspace array of length at least 3*N
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - integer workspace array of length at least N
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @throws {TypeError} Second argument must be a valid matrix triangle
* @throws {TypeError} Third argument must be a valid diagonal type
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function dtbcon( norm, uplo, diag, N, kd, AB, strideAB1, strideAB2, offsetAB, rcond, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Caller owns the workspaces; assert they are sufficiently large arrays so
	// an under-sized (or non-array) buffer is a loud RangeError, not a silent
	// NaN from an out-of-bounds read. WORK needs 3*N elements and IWORK needs N
	// (N === 0 is a quick return that references no workspace).
	if ( N > 0 ) {
		if ( !WORK || ( WORK.length - offsetWork ) < ( 3 * N ) ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', 3 * N, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
		if ( !IWORK || ( IWORK.length - offsetIWork ) < N ) {
			throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', N, offsetIWork, ( IWORK ) ? IWORK.length : 0 ) );
		}
	}
	return base( norm, uplo, diag, N, kd, AB, strideAB1, strideAB2, offsetAB, rcond, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtbcon;
