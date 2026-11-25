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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reorders the generalized real Schur decomposition of a real matrix pair.
*
* @param {integer} ijob - specifies whether condition numbers are required for the cluster of eigenvalues (PL and PR) or the deflating subspaces (Difu and Difl): =0: Only reorder w.r.t. SELECT.
* @param {boolean} wantq - `true` : update the left transformation matrix Q; `false`: do not update Q.
* @param {boolean} wantz - `true` : update the right transformation matrix Z; `false`: do not update Z.
* @param {Uint8Array} SELECT - input array
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} offsetSELECT - starting index for `SELECT`
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - input matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} ALPHAR - input array
* @param {integer} strideALPHAR - stride length for `ALPHAR`
* @param {NonNegativeInteger} offsetALPHAR - starting index for `ALPHAR`
* @param {Float64Array} ALPHAI - input array
* @param {integer} strideALPHAI - stride length for `ALPHAI`
* @param {NonNegativeInteger} offsetALPHAI - starting index for `ALPHAI`
* @param {Float64Array} BETA - input array
* @param {integer} strideBETA - stride length for `BETA`
* @param {NonNegativeInteger} offsetBETA - starting index for `BETA`
* @param {Float64Array} Q - input matrix
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {Float64Array} Z - input matrix
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Int32Array} M - number of rows
* @param {Float64Array} pl - if IJOB = 1, 4 or 5, PL, PR are lower bounds on the reciprocal of the norm of "projections" onto left and right eigenspaces with respect to the selected cluster. 0 < PL, PR <= 1.
* @param {Float64Array} pr - if IJOB = 1, 4 or 5, PL, PR are lower bounds on the reciprocal of the norm of "projections" onto left and right eigenspaces with respect to the selected cluster. 0 < PL, PR <= 1.
* @param {Float64Array} DIF - input array
* @param {integer} strideDIF - stride length for `DIF`
* @param {NonNegativeInteger} offsetDIF - starting index for `DIF`
* @param {Float64Array} WORK - input array
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - output array
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @throws {RangeError} first argument is invalid (rejected when `ijob < 0 || ijob > 5`)
* @throws {RangeError} seventh argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dtgsen( ijob, wantq, wantz, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, M, pl, pr, DIF, strideDIF, offsetDIF, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	// Caller owns the workspace; base requires at least `max(1, 4*N+16)` real elements on every path (larger for ijob>=1). Assert the guaranteed floor so an undersized buffer is a loud RangeError, not a silent NaN.
	if ( ijob < 0 || ijob > 5 ) {
		throw new RangeError( format( 'invalid argument. First argument is invalid (rejected when `ijob < 0 || ijob > 5`). Value: `%d`.', ijob ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const need = max( 1, ( 4 * N ) + 16 );
	if ( !WORK || ( WORK.length - offsetWork ) < need ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideIWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideIWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideIWork ) );
	}
	return base( ijob, wantq, wantz, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, M, pl, pr, DIF, strideDIF, offsetDIF, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtgsen;
