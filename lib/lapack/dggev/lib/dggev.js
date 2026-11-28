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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import strided from './strided.js';
import { computeOptimalWorkSize } from './base.js';


// MAIN //

/**
* Computes the generalized eigenvalues and, optionally, the left and/or right.
* generalized eigenvectors for a pair of N-by-N real nonsymmetric matrices (A,B).
*
* When `work` is `null`, this LAPACKE-style wrapper allocates the optimal
* workspace, `max( 8*N, 7*N + N*NB + TSIZE )` elements, as a convenience.
* Prefer passing a caller-owned buffer for batched use.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('no-vectors'|'compute-vectors')} jobvl - `'compute-vectors'` to compute left eigenvectors, `'no-vectors'` to not
* @param {('no-vectors'|'compute-vectors')} jobvr - `'compute-vectors'` to compute right eigenvectors, `'no-vectors'` to not
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} A - input matrix A (N x N), overwritten on exit
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Float64Array} B - input matrix B (N x N), overwritten on exit
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Float64Array} ALPHAR - output: real parts of alpha (length N)
* @param {integer} strideALPHAR - stride length for `ALPHAR`
* @param {Float64Array} ALPHAI - output: imaginary parts of alpha (length N)
* @param {integer} strideALPHAI - stride length for `ALPHAI`
* @param {Float64Array} BETA - output: beta values (length N)
* @param {integer} strideBETA - stride length for `BETA`
* @param {Float64Array} VL - output: left eigenvectors (N x N)
* @param {PositiveInteger} LDVL - leading dimension of VL
* @param {Float64Array} VR - output: right eigenvectors (N x N)
* @param {PositiveInteger} LDVR - leading dimension of VR
* @param {(Float64Array|null)} [work=null] - workspace of length at least `max(1,8*N)`; for optimal performance at least `max( 8*N, 7*N + N*NB + TSIZE )` (`NB` from `ilaenv`, `TSIZE = 4160`), the reference's `N*(7+NB)` with the dormqr optimum's T part, which enables the blocked QR steps; or `null` to allocate the optimal size
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} third argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} sixteenth argument is invalid (rejected when `LDVL < 1 || ( ( jobvl === "compute-vectors" ) && LDVL < N )`)
* @throws {RangeError} eighteenth argument is invalid (rejected when `LDVR < 1 || ( ( jobvr === "compute-vectors" ) && LDVR < N )`)
* @throws {RangeError} LDA must be >= max(1,N)
* @throws {RangeError} LDB must be >= max(1,N)
* @returns {integer} info - 0 on success, 1..N if QZ iteration failed, N+1 for other errors
*/
function dggev( order, jobvl, jobvr, N, A, LDA, B, LDB, ALPHAR, strideALPHAR, ALPHAI, strideALPHAI, BETA, strideBETA, VL, LDVL, VR, LDVR, work ) {
	let svl1, svl2, svr1, svr2, sa1, sa2, sb1, sb2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( jobvl !== 'no-vectors' && jobvl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'no-vectors' && jobvr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobvr ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( LDVL < 1 || ( ( jobvl === 'compute-vectors' ) && LDVL < N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument is invalid (rejected when `LDVL < 1 || ( ( jobvl === "compute-vectors" ) && LDVL < N )`). Value: `%d`.', LDVL ) );
	}
	if ( LDVR < 1 || ( ( jobvr === 'compute-vectors' ) && LDVR < N ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument is invalid (rejected when `LDVR < 1 || ( ( jobvr === "compute-vectors" ) && LDVR < N )`). Value: `%d`.', LDVR ) );
	}
	const oalphar = stride2offset( N, strideALPHAR );
	const oalphai = stride2offset( N, strideALPHAI );
	const obeta = stride2offset( N, strideBETA );
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
		svl1 = 1;
		svl2 = LDVL;
		svr1 = 1;
		svr2 = LDVR;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
		svl1 = LDVL;
		svl2 = 1;
		svr1 = LDVR;
		svr2 = 1;
	}
	if ( work === null || work === void 0 ) {
		work = new Float64Array( max( max( 1, 8 * N ), computeOptimalWorkSize( jobvl, N ) ) );
	}
	return strided( jobvl, jobvr, N, A, sa1, sa2, 0, B, sb1, sb2, 0, ALPHAR, strideALPHAR, oalphar, ALPHAI, strideALPHAI, oalphai, BETA, strideBETA, obeta, VL, svl1, svl2, 0, VR, svr1, svr2, 0, work, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dggev;
