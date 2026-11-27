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
* Generates one of the real orthogonal matrices Q or P^T determined by DGEBRD when reducing a real matrix to bidiagonal form `A = Q*B*P^T`.
*
* @param {('apply-Q'|'apply-P')} vect - `'apply-Q'` to generate Q, `'apply-P'` to generate P^T
* @param {NonNegativeInteger} M - number of rows of the matrix Q or P^T
* @param {NonNegativeInteger} N - number of columns of the matrix Q or P^T
* @param {NonNegativeInteger} K - number of columns/rows in original matrix
* @param {Float64Array} A - matrix containing reflectors from DGEBRD
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - scalar factors of reflectors
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} WORK - workspace of length at least `max(1,min(M,N))`; for optimum performance it should hold `min(M,N)*NB` elements (`NB = 32`, the dorgqr/dorglq block size), which enables the blocked path
* @param {integer} strideWork - stride for WORK (must be 1)
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @throws {TypeError} first argument must be one of the following: "apply-P", "apply-Q"
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument is invalid (rejected when `( N < 0 || ( vect === "apply-Q" && ( N > M || N < min( M, K ) ) ) ) || ( vect !== "apply-Q" && ( M > N || M < min( N, K ) ) )`)
* @throws {RangeError} fourth argument must be a nonnegative integer
* @returns {integer} info status code (0 if successful)
*
* @example
* import dgebrd from '@rreusser/blahpack/lapack/dgebrd';
* import dorgbr from '@rreusser/blahpack/lapack/dorgbr';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
*
* // Reduce A = [ [ 3, 0 ], [ 4, 5 ] ] (column-major) to bidiagonal form A = Q*B*P^T:
* var A = new Float64Array( [ 3.0, 4.0, 0.0, 5.0 ] );
* var d = new Float64Array( 2 );
* var e = new Float64Array( 1 );
* var TAUQ = new Float64Array( 2 );
* var TAUP = new Float64Array( 2 );
* var WORK = new Float64Array( 2 );
* dgebrd.ndarray( 2, 2, A, 1, 2, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 );
*
* // Overwrite A with the orthogonal matrix Q:
* var info = dorgbr.ndarray( 'apply-Q', 2, 2, 2, A, 1, 2, 0, TAUQ, 1, 0, WORK, 1, 0 );
* // returns 0
*
* // The first column of Q is -[ 3, 4 ]/5:
* // A => <Float64Array>[ ~-0.6, -0.8, -0.8, 0.6 ]
*/
function dorgbr( vect, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	if ( vect !== 'apply-P' && vect !== 'apply-Q' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "apply-P", "apply-Q". Value: `%s`.', vect ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( ( N < 0 || ( vect === 'apply-Q' && ( N > M || N < min( M, K ) ) ) ) || ( vect !== 'apply-Q' && ( M > N || M < min( N, K ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `( N < 0 || ( vect === "apply-Q" && ( N > M || N < min( M, K ) ) ) ) || ( vect !== "apply-Q" && ( M > N || M < min( N, K ) ) )`). Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	// The reference's minimum (LWORK >= max(1,min(M,N))); dorgqr/dorglq shrink NB, or fall back to unblocked code, to fit a shorter workspace than their optimum:
	const minWork = Math.max( 1, Math.min( M, N ) );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}

	return base( vect, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default dorgbr;
