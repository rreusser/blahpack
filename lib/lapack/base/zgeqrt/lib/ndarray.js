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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a blocked QR factorization of a complex `M`-by-`N` matrix `A` using the compact `WY` representation of `Q`.
*
* @param {NonNegativeInteger} M - number of rows of the matrix `A`
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {PositiveInteger} nb - block size
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} T - output matrix
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Complex128Array} WORK - workspace array
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must satisfy `1 <= nb <= min(M,N)` when `min(M,N) > 0`
* @returns {integer} status code (`0` = success)
*/
function zgeqrt( M, N, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork ) {
	var need;
	var K;

	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	K = ( M < N ) ? M : N;
	if ( nb < 1 || ( nb > K && K > 0 ) ) {
		throw new RangeError( format( 'invalid argument. Third argument must satisfy `1 <= nb <= min(M,N)`. Value: `%d`.', nb ) );
	}

	// Workspace is only touched for a non-empty matrix; the blocked QR needs
	// `nb*N` complex elements.
	if ( M > 0 && N > 0 ) {
		need = nb * N;
		if ( !WORK || ( WORK.length - offsetWork ) < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	return base( M, N, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zgeqrt;
