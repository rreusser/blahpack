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
* Generates one of the real orthogonal matrices Q or P^T determined by DGEBRD when reducing a real matrix to bidiagonal form `A = Q*B*P^T`.
*
* @param {string} vect - `'apply-Q'` to generate Q, `'apply-P'` to generate P^T
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
* @param {Float64Array} WORK - workspace (ignored, allocated internally by dependencies)
* @param {integer} strideWork - stride for WORK (ignored)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (ignored)
* @throws {TypeError} first argument must be a valid vector type
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @returns {integer} info status code (0 if successful)
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var A = new Float64Array( 4 );
* var TAU = new Float64Array( 2 );
* var WORK = new Float64Array( 1 );
*
* var info = dorgbr( 'apply-Q', 2, 2, 2, A, 1, 2, 0, TAU, 1, 0, WORK, 1, 0 );
* // returns 0
*/
function dorgbr( vect, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	if ( vect !== 'apply-Q' && vect !== 'apply-P' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid vector type. Value: `%s`.', vect ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	// dorgbr delegates to the BLOCKED dorgqr/dorglq (which store the block-reflector
	// T factor + dlarfb scratch in WORK, needing ~dim*NB). Our kernels hardcode NB
	// and do NOT adapt it down when WORK is small, so the advertised minimum must
	// mirror the delegate's real need, not the reference's adaptive `min(M,N)` lower
	// bound. Branch on the same vect/(M,K)/(K,N) logic as base.js:
	var NB = 32;
	var minWork;
	if ( vect === 'apply-Q' ) {
		if ( M >= K ) {
			minWork = ( K > NB ) ? Math.max( 1, N * NB ) : Math.max( 1, N );
		} else {
			minWork = ( M > 1 ) ? ( ( M - 1 > NB ) ? Math.max( 1, ( M - 1 ) * NB ) : Math.max( 1, M - 1 ) ) : 1;
		}
	} else if ( K < N ) {
		minWork = ( K > NB ) ? Math.max( 1, M * NB ) : Math.max( 1, M );
	} else {
		minWork = ( N > 1 ) ? ( ( N - 1 > NB ) ? Math.max( 1, ( N - 1 ) * NB ) : Math.max( 1, N - 1 ) ) : 1;
	}
	minWork = Math.max( 1, Math.min( M, N ), minWork );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}

	return base( vect, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default dorgbr;
