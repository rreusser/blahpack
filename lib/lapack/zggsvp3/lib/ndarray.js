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

import format from '@stdlib/string/format/lib/index.js';
import base, { computeWorkSize } from './base.js';


// MAIN //

/**
* Computes unitary matrices U, V, and Q such that A and B have triangular form suitable for GSVD.
*
* This is the preprocessing step for computing the Generalized Singular Value
* Decomposition (GSVD) of a complex matrix pair (A, B).
*
* @param {('compute-U'|'none')} jobu - `'compute-U'` or `'none'`
* @param {('compute-V'|'none')} jobv - `'compute-V'` or `'none'`
* @param {('compute-Q'|'none')} jobq - `'compute-Q'` or `'none'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} p - number of rows of B
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {Complex128Array} A - M-by-N matrix A (overwritten on exit)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - P-by-N matrix B (overwritten on exit)
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {number} tola - tolerance for A
* @param {number} tolb - tolerance for B
* @param {Int32Array} K - output array; K[0] set to the numerical rank of A(:,1:N-L)
* @param {Int32Array} l - output array; l[0] set to the numerical rank of B
* @param {Complex128Array} U - M-by-M unitary matrix (if jobu=`'compute-U'`)
* @param {integer} strideU1 - stride of the first dimension of U
* @param {integer} strideU2 - stride of the second dimension of U
* @param {NonNegativeInteger} offsetU - starting index for U
* @param {Complex128Array} V - P-by-P unitary matrix (if jobv=`'compute-V'`)
* @param {integer} strideV1 - stride of the first dimension of V
* @param {integer} strideV2 - stride of the second dimension of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {Complex128Array} Q - N-by-N unitary matrix (if jobq=`'compute-Q'`)
* @param {integer} strideQ1 - stride of the first dimension of Q
* @param {integer} strideQ2 - stride of the second dimension of Q
* @param {NonNegativeInteger} offsetQ - starting index for Q
* @param {Int32Array} IWORK - integer workspace array of length N
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @param {Float64Array} RWORK - real workspace array of length >= 2*N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @param {Complex128Array} TAU - complex workspace array of length >= min(M,N)
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Complex128Array} WORK - complex workspace of length at least `max(1, N+1, P if jobv = 'compute-V', M if jobu = 'compute-U' or (P > 0 and N > 1))` when `N > 0` and `M + P > 0`, 1 when `M = P = 0`, 0 when `N = 0` (the reference checks only `LWORK >= 1`; `ZGEQP3` rejects less than `N+1`, and the unblocked orthogonal-factor callees write up to M or P for data of full rank); for optimum performance the reference's LWKOPT, `max((N+1)*NB, M, min(N,P), P if jobv = 'compute-V', N if jobq = 'compute-Q')` (`NB = 32`), which enables `zgeqp3`'s blocked path
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @throws {TypeError} first argument must be one of the following: "none", "compute-U"
* @throws {TypeError} second argument must be one of the following: "none", "compute-V"
* @throws {TypeError} third argument must be one of the following: "none", "compute-Q"
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @returns {integer} info - 0 if successful
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import zggsvp3 from '@rreusser/blahpack/lapack/base/zggsvp3';
*
* var A = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
* var B = new Complex128Array( [ 5.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 0.0 ] );
* var U = new Complex128Array( 4 );
* var V = new Complex128Array( 4 );
* var Q = new Complex128Array( 4 );
* var IWORK = new Int32Array( 2 );
* var RWORK = new Float64Array( 4 );
* var TAU = new Complex128Array( 2 );
* var WORK = new Complex128Array( 100 );
* var K = [ 0 ];
* var L = [ 0 ];
*
* zggsvp3.ndarray( 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, A, 1, 2, 0, B, 1, 2, 0, 1e-8, 1e-8, K, L, U, 1, 2, 0, V, 1, 2, 0, Q, 1, 2, 0, IWORK, 1, 0, RWORK, 1, 0, TAU, 1, 0, WORK, 1, 0 );
*/
function zggsvp3( jobu, jobv, jobq, M, p, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, K, l, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWork, offsetIWork, RWORK, strideRWork, offsetRWork, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params, max-statements
	if ( jobu !== 'none' && jobu !== 'compute-U' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "none", "compute-U". Value: `%s`.', jobu ) );
	}
	if ( jobv !== 'none' && jobv !== 'compute-V' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "none", "compute-V". Value: `%s`.', jobv ) );
	}
	if ( jobq !== 'none' && jobq !== 'compute-Q' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "none", "compute-Q". Value: `%s`.', jobq ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( p < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', p ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Caller owns the complex WORK; base hands it to zgeqp3 (panel scratch, up to `(N+2)*32` when `min(M,N)` or `min(p,N)` exceeds 32) and uses it as zung2r/zunm2r scratch (`<= max(1,M,N,p)`); nothing when N is zero. Assert so an undersized buffer is a loud RangeError, not a silent NaN.
	const minWork = computeWorkSize( jobu, jobv, M, p, N );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	// IWORK holds the N column pivots (declared `IWORK( N )`), RWORK the 2N column norms (declared `RWORK( 2*N )`).
	if ( !IWORK || ( IWORK.length - offsetIWork ) < N ) {
		throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', N, offsetIWork, ( IWORK ) ? IWORK.length : 0 ) );
	}
	if ( !RWORK || ( RWORK.length - offsetRWork ) < 2 * N ) {
		throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', 2 * N, offsetRWork, ( RWORK ) ? RWORK.length : 0 ) );
	}
	if ( strideIWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideIWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideIWork ) );
	}
	if ( strideRWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideRWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideRWork ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( jobu, jobv, jobq, M, p, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, K, l, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWork, offsetIWork, RWORK, strideRWork, offsetRWork, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zggsvp3;
