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
* Computes a blocked LQ factorization of a real `M`-by-`N` matrix `A` using the compact WY representation of `Q`.
*
* @param {NonNegativeInteger} M - number of rows of the matrix `A`
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {PositiveInteger} mb - block size (`mb >= 1` and `mb <= min(M,N)` when `min(M,N) > 0`)
* @param {Float64Array} A - input/output matrix; on exit contains `L` and `V`
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} T - output `mb`-by-min(`M`,`N`) block triangular factor
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} WORK - workspace array (length `mb*N`)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a positive integer not exceeding min(M,N)
* @returns {integer} status code (`0` = success)
*/
function dgelqt( M, N, mb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, offsetWork ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const k = ( M < N ) ? M : N;
	if ( mb < 1 || ( mb > k && k > 0 ) ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a positive integer not exceeding min(M,N). Value: `%d`.', mb ) );
	}
	// Advertised WORK minimum. The trailing block update (`dlarfb`, side='right',
	// rowwise) uses WORK as a `(M-i-ib)`-by-`ib` scratch, so its size scales with
	// the trailing ROW count, peaking at the first block: `(M-min(mb,K))*min(mb,K)`.
	// The reference `mb*N` figure is a lower bound valid only for M<=N; take the max
	// so tall (M>N) inputs are covered without ever lowering the documented minimum.
	const ib0 = ( mb < k ) ? mb : k;
	const peak = ( M - ib0 ) * ib0;
	const minWork = ( k === 0 ) ? 0 : ( ( mb * N > peak ) ? ( mb * N ) : peak );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	return base( M, N, mb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, offsetWork );
}


// EXPORTS //

export default dgelqt;
