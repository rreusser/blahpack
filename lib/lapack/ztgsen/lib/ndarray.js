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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reorders the generalized Schur decomposition of a complex matrix pair.
*
* @param {integer} ijob - specifies whether condition numbers are required (0-5)
* @param {boolean} wantq - whether to update the left transformation matrix Q
* @param {boolean} wantz - whether to update the right transformation matrix Z
* @param {Uint8Array} SELECT - boolean selection array of length N
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} offsetSELECT - starting index for `SELECT`
* @param {NonNegativeInteger} N - order of the matrices A, B, Q, Z
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} B - input matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} ALPHA - output array of length N
* @param {integer} strideALPHA - stride length for `ALPHA`
* @param {NonNegativeInteger} offsetALPHA - starting index for `ALPHA`
* @param {Complex128Array} BETA - output array of length N
* @param {integer} strideBETA - stride length for `BETA`
* @param {NonNegativeInteger} offsetBETA - starting index for `BETA`
* @param {Complex128Array} Q - input matrix
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {Complex128Array} Z - input matrix
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Int32Array} M - input/output (length-1 array): number of selected eigenvalues
* @param {Float64Array} pl - input/output (length-1 array): pl
* @param {Float64Array} pr - input/output (length-1 array): pr
* @param {Float64Array} DIF - output array of length 2
* @param {integer} strideDIF - stride length for `DIF`
* @param {NonNegativeInteger} offsetDIF - starting index for `DIF`
* @param {Complex128Array} WORK - workspace of length at least 1; for `ijob` 1, 2 or 4, `2*M*(N-M) + 1` when `M*(N-M) > 0` (the reference's `2*M*(N-M)`, plus the 1 its ZTGSYL checks for); for `ijob` 3 or 5, `max(1, 4*M*(N-M))`; M is the number of selected eigenvalues
* @param {integer} strideWork - stride length for `WORK` (must be 1; workspace is contiguous)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - integer workspace of length at least 1; for `ijob` 1, 2 or 4, `N+2`; for `ijob` 3 or 5, `max(2*M*(N-M), N+2)`
* @param {integer} strideIWork - stride length for `IWORK` (must be 1; workspace is contiguous)
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @throws {RangeError} first argument is invalid (rejected when `ijob < 0 || ijob > 5`)
* @throws {RangeError} seventh argument must be a nonnegative integer
* @throws {RangeError} WORK array must be large enough
* @throws {RangeError} IWORK array must be large enough
* @returns {integer} status code (0 = success)
*/
function ztgsen( ijob, wantq, wantz, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, M, pl, pr, DIF, strideDIF, offsetDIF, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	let minIwork, minWork;

	// Quick return for an empty problem: no workspace is required, so return
	// before asserting WORK/IWORK sizes.
	if ( ijob < 0 || ijob > 5 ) {
		throw new RangeError( format( 'invalid argument. First argument is invalid (rejected when `ijob < 0 || ijob > 5`). Value: `%d`.', ijob ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideIWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideIWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideIWork ) );
	}
	if ( N === 0 ) {
		return base( ijob, wantq, wantz, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, M, pl, pr, DIF, strideDIF, offsetDIF, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork );
	}
	// Caller owns the workspace; assert it is large enough so an under-sized
	// buffer is a loud RangeError, not a silent NaN from an out-of-bounds read.
	// M is an OUTPUT (base.js counts SELECT), so count SELECT here as the
	// reference does before its LWORK/LIWORK checks.
	let nsel = 0;
	for ( let i = 0; i < N; i++ ) {
		if ( SELECT[ offsetSELECT + ( i * strideSELECT ) ] ) {
			nsel += 1;
		}
	}
	const n1n2 = nsel * ( N - nsel );

	// The reference's LWMIN/LIWMIN. For IJOB = 1, 2 or 4 its ZTGSYL also gets
	// `LWORK - 2*M*(N-M)` and checks that against its own minimum of 1, so the
	// smallest LWORK neither rejects is `2*M*(N-M) + 1` when `M*(N-M) > 0`.
	if ( ijob === 1 || ijob === 2 || ijob === 4 ) {
		minWork = ( n1n2 > 0 ) ? ( 2 * n1n2 ) + 1 : 1;
		minIwork = N + 2;
	} else if ( ijob === 3 || ijob === 5 ) {
		minWork = max( 1, 4 * n1n2 );
		minIwork = max( 2 * n1n2, N + 2 );
	} else {
		minWork = 1;
		minIwork = 1;
	}
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	if ( !IWORK || ( IWORK.length - offsetIWork ) < minIwork ) {
		throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', minIwork, offsetIWork, ( IWORK ) ? IWORK.length : 0 ) );
	}
	return base( ijob, wantq, wantz, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, M, pl, pr, DIF, strideDIF, offsetDIF, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork );
}


// EXPORTS //

export default ztgsen;
