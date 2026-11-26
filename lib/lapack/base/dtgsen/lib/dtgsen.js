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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base, { selectedDimension, computeMinimalWorkSize, computeOptimalIworkSize } from './base.js';


// MAIN //

/**
* Reorders the generalized real Schur decomposition of a real matrix pair.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {integer} ijob - specifies whether condition numbers are required for the cluster of eigenvalues (PL and PR) or the deflating subspaces (Difu and Difl): =0: Only reorder w.r.t. SELECT.
* @param {boolean} wantq - `true` : update the left transformation matrix Q; `false`: do not update Q.
* @param {boolean} wantz - `true` : update the right transformation matrix Z; `false`: do not update Z.
* @param {Uint8Array} SELECT - input array
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} B - input matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} ALPHAR - input array
* @param {integer} strideALPHAR - stride length for `ALPHAR`
* @param {Float64Array} ALPHAI - input array
* @param {integer} strideALPHAI - stride length for `ALPHAI`
* @param {Float64Array} BETA - input array
* @param {integer} strideBETA - stride length for `BETA`
* @param {Float64Array} Q - input matrix
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Float64Array} Z - input matrix
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Int32Array} M - number of rows
* @param {Float64Array} pl - if IJOB = 1, 4 or 5, PL, PR are lower bounds on the reciprocal of the norm of "projections" onto left and right eigenspaces with respect to the selected cluster. 0 < PL, PR <= 1.
* @param {Float64Array} pr - if IJOB = 1, 4 or 5, PL, PR are lower bounds on the reciprocal of the norm of "projections" onto left and right eigenspaces with respect to the selected cluster. 0 < PL, PR <= 1.
* @param {Float64Array} DIF - input array
* @param {integer} strideDIF - stride length for `DIF`
* @param {(Float64Array|null)} WORK - workspace of length at least `max(1,4N+16)`; for `ijob` 1, 2 or 4, also `2*M*(N-M) + 1` when `M*(N-M) > 0` (the reference documents `2*M*(N-M)`, but its DTGSYL calls get `LWORK - 2*M*(N-M)` and reject less than 1); for `ijob` 3 or 5, also `4*M*(N-M)`; M is the dimension of the selected deflating subspaces, or `null` to allocate it (the reference's optimum, raised to that minimum)
* @param {(Int32Array|null)} IWORK - integer workspace of length at least 1; for `ijob` 1, 2 or 4, `max(1,N+6)`; for `ijob` 3 or 5, `max(1,2*M*(N-M),N+6)`, or `null` to allocate the reference's optimum
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument is invalid (rejected when `ijob < 0 || ijob > 5`)
* @throws {RangeError} seventh argument must be a nonnegative integer
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} eleventh argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} nineteenth argument is invalid (rejected when `LDQ < 1 || ( wantq && LDQ < N )`)
* @throws {RangeError} twenty-first argument is invalid (rejected when `LDZ < 1 || ( wantz && LDZ < N )`)
* @returns {integer} status code (0 = success)
*/
function dtgsen( order, ijob, wantq, wantz, SELECT, strideSELECT, N, A, LDA, B, LDB, ALPHAR, strideALPHAR, ALPHAI, strideALPHAI, BETA, strideBETA, Q, LDQ, Z, LDZ, M, pl, pr, DIF, strideDIF, WORK, IWORK ) { // eslint-disable-line max-len, max-params
	let sa1, sa2, sb1, sb2, sq1, sq2, sz1, sz2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( ijob < 0 || ijob > 5 ) {
		throw new RangeError( format( 'invalid argument. Second argument is invalid (rejected when `ijob < 0 || ijob > 5`). Value: `%d`.', ijob ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( LDQ < 1 || ( wantq && LDQ < N ) ) {
		throw new RangeError( format( 'invalid argument. Nineteenth argument is invalid (rejected when `LDQ < 1 || ( wantq && LDQ < N )`). Value: `%d`.', LDQ ) );
	}
	if ( LDZ < 1 || ( wantz && LDZ < N ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-first argument is invalid (rejected when `LDZ < 1 || ( wantz && LDZ < N )`). Value: `%d`.', LDZ ) );
	}
	const offsetIWork = 0;
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
		sq1 = 1;
		sq2 = LDQ;
		sz1 = 1;
		sz2 = LDZ;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
		sq1 = LDQ;
		sq2 = 1;
		sz1 = LDZ;
		sz2 = 1;
	}
	// The reference's LWMIN and LIWMIN (also what its workspace query returns), from the dimension M of the selected subspaces; WORK is raised to the 2M(N-M)+1 its DTGSYL calls need:
	const m = selectedDimension( N, SELECT, strideSELECT, 0, A, sa1, sa2, 0 );
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Float64Array( computeMinimalWorkSize( ijob, N, m ) );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		IWORK = new Int32Array( computeOptimalIworkSize( ijob, N, m ) );
	}
	return base( ijob, wantq, wantz, SELECT, strideSELECT, 0, N, A, sa1, sa2, 0, B, sb1, sb2, 0, ALPHAR, strideALPHAR, 0, ALPHAI, strideALPHAI, 0, BETA, strideBETA, 0, Q, sq1, sq2, 0, Z, sz1, sz2, 0, M, pl, pr, DIF, strideDIF, 0, WORK, 1, 0, IWORK, 1, offsetIWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtgsen;
