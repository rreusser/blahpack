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
* Generates an M-by-N real matrix Q with orthonormal rows from elementary reflectors returned by DGERQF (blocked algorithm).
*
* Q is defined as the last M rows of a product of K elementary reflectors of order N:
*
* `Q = H(1) H(2) ... H(K)`
*
* where each `H(i)` has the form `H(i) = I - tau(i)*v*v^T`, and `v` is stored
* as the (m-k+i)-th row of the input matrix A.
*
* This is the blocked version that uses DLARFT + DLARFB for efficiency on
* large matrices, falling back to DORGR2 for small ones.
*
* ## Notes
*
* -   On entry, the (m-k+i)-th row of A must contain the reflector vector for
* `H(i)`, as returned by DGERQF in the last k rows of A.
*
* -   On exit, A contains the M-by-N matrix Q.
*
* -   WORK must have length _>=_ M*NB (where NB is the block size, 32).
*
* @param {NonNegativeInteger} M - number of rows of Q (M >= 0)
* @param {NonNegativeInteger} N - number of columns of Q (N >= M)
* @param {NonNegativeInteger} K - number of elementary reflectors (0 <= K <= M)
* @param {Float64Array} A - input/output matrix (M x N)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} TAU - scalar factors of reflectors (length K)
* @param {integer} strideTAU - stride for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @param {Float64Array} WORK - workspace (length _>=_ M*NB)
* @param {integer} strideWork - stride for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @returns {integer} info status code (0 = success)
*/
function dorgrq( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	// Blocked path (K > NB) stores the block-reflector T factor and the dlarfb
	// scratch in WORK with leading dimension M, consuming up to M*NB (reference
	// DORGRQ's IWS = LDWORK*NB); the unblocked fallback needs only max(1,M). A bare
	// max(1,M) guard under-advertises the blocked minimum -> silent NaN in Q (see
	// test/harness/LEARNINGS.md, 2026-07-18 dorgrq/zungrq).
	const NB = 32;
	const minWork = ( K > NB ) ? Math.max( 1, M * NB ) : Math.max( 1, M );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}

	return base( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default dorgrq;
