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

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// VARIABLES //

// Block size (see base.js): reference LAPACK ILAENV returns NB = 1 for this routine.
const NB = 1;


// MAIN //

/**
* Computes the inverse of a real symmetric indefinite matrix `A` using the factorization from `dsytrf_rk`. Blocked driver that picks a block size and forwards to `dsytri_3x`, using alternative indexing semantics.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - input/output symmetric matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} e - super/sub-diagonal of the block diagonal matrix `D`
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Int32Array} IPIV - pivot indices from `dsytrf_rk`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Float64Array} WORK - workspace
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} status code
*/
function dsytri3( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) {
	let need;
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Caller owns the workspace; assert it is a sufficiently large array so an under-sized (or non-array) buffer is a loud RangeError, not a silent NaN.
	if ( N > 0 ) {
		need = ( N+NB+1 ) * ( NB+3 );
		if ( !WORK || ( WORK.length - offsetWork ) < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default dsytri3;
