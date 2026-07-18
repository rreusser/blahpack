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
* @param {NonNegativeInteger} M - number of selected eigenvalues
* @param {number} pl - pl
* @param {number} pr - pr
* @param {Float64Array} DIF - output array of length 2
* @param {integer} strideDIF - stride length for `DIF`
* @param {NonNegativeInteger} offsetDIF - starting index for `DIF`
* @param {Complex128Array} WORK - caller-owned workspace of at least `max(1,4*M*(N-M)+1)` complex elements
* @param {integer} strideWork - stride length for `WORK` (must be 1; workspace is contiguous)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - caller-owned integer workspace of at least `max(1,2*M*(N-M),N+6)` elements
* @param {integer} strideIWork - stride length for `IWORK` (must be 1; workspace is contiguous)
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @throws {RangeError} WORK array must be large enough
* @throws {RangeError} IWORK array must be large enough
* @returns {Object} result object with `info`, `m`, `pl`, `pr`
*/
function ztgsen( ijob, wantq, wantz, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, M, pl, pr, DIF, strideDIF, offsetDIF, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	let minIwork, minWork;

	// Quick return for an empty problem: no workspace is required, so return
	// before asserting WORK/IWORK sizes.
	if ( N === 0 ) {
		return base( ijob, wantq, wantz, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, M, pl, pr, DIF, strideDIF, offsetDIF, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork );
	}
	// Caller owns the workspace; assert it is large enough so an under-sized
	// buffer is a loud RangeError, not a silent NaN from an out-of-bounds read.
	// Workspace is only consumed when a proper subset is selected (0 < M < N).
	const n1n2 = M * ( N - M );
	if ( n1n2 > 0 ) {
		minWork = ( 4 * n1n2 ) + 1;
		if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
		minIwork = max( 2 * n1n2, N + 6 );
		if ( !IWORK || ( IWORK.length - offsetIWork ) < minIwork ) {
			throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', minIwork, offsetIWork, ( IWORK ) ? IWORK.length : 0 ) );
		}
	}
	return base( ijob, wantq, wantz, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, M, pl, pr, DIF, strideDIF, offsetDIF, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork );
}


// EXPORTS //

export default ztgsen;
