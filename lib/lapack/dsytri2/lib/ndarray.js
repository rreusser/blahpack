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
import ilaenv from './../../ilaenv/lib/base.js';
import base from './base.js';


// MAIN //

/**
* Computes the inverse of a real symmetric indefinite matrix using the factorization produced by `dsytrf` (dispatches between `dsytri` and `dsytri2x` based on `N`), using alternative indexing semantics.
*
* @param {MatrixTriangle} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - input matrix (factored form from `dsytrf`); on exit, the inverse stored in symmetric form
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Int32Array} IPIV - pivot indices from `dsytrf`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Float64Array} WORK - workspace; size depends on dispatch (see `lib/base.js`)
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} status code (`0` = success; `> 0` = the `(k,k)` element of `D` is exactly zero so the inverse cannot be computed)
*/
function dsytri2( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) {
	let nbmax;
	let need;
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Caller owns WORK; require the reference's MINSIZE for the reference's block size (N for the unblocked path, (N+NBMAX+1)*(NBMAX+3) for the blocked one), so an undersized buffer is a loud RangeError, not a silent NaN. N===0 is a quick return that needs no workspace.
	if ( N > 0 ) {
		nbmax = ilaenv( 1, 'DSYTRI2', uplo.charAt( 0 ).toUpperCase(), N, -1, -1, -1 );
		need = ( nbmax >= N ) ? N : ( N + nbmax + 1 ) * ( nbmax + 3 );
		if ( !WORK || ( WORK.length - offsetWork ) < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default dsytri2;
