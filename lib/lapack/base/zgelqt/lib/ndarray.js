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
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a blocked LQ factorization of a complex `M`-by-`N` matrix `A` using the compact WY representation of `Q`.
*
* @param {NonNegativeInteger} M - number of rows of the matrix `A`
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {NonNegativeInteger} mb - block size (`mb >= 1` and `mb <= min(M,N)` when `min(M,N) > 0`)
* @param {Complex128Array} A - input/output matrix; on exit contains `L` and `V`
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} T - output `mb`-by-min(`M`,`N`) block triangular factor
* @param {integer} strideT1 - stride of the first dimension of `T` (in complex elements)
* @param {integer} strideT2 - stride of the second dimension of `T` (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for `T` (in complex elements)
* @param {Complex128Array} WORK - workspace array (length `mb*N` complex elements)
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument is invalid (rejected when `mb < 1 || ( mb > min( M, N ) && min( M, N ) > 0 )`)
* @returns {integer} status code (`0` = success)
*/
function zgelqt( M, N, mb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork ) {
	let need;
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( mb < 1 || ( mb > min( M, N ) && min( M, N ) > 0 ) ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `mb < 1 || ( mb > min( M, N ) && min( M, N ) > 0 )`). Value: `%d`.', mb ) );
	}

	// Workspace is only touched for a non-empty matrix; the blocked LQ needs
	// `mb*N` complex elements.
	if ( M > 0 && N > 0 ) {
		need = mb * N;
		if ( !WORK || ( WORK.length - offsetWork ) < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( M, N, mb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zgelqt;
