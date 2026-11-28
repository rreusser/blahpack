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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import strided from './strided.js';
import { computeOptimalWorkSize } from './base.js';


// MAIN //

/**
* Computes for a pair of N-by-N real nonsymmetric matrices (A,B) the generalized eigenvalues, and optionally, the left and/or right generalized eigenvectors.
*
* When `work`, `iwork`, or `bwork` are `null`, this LAPACKE-style wrapper
* allocates workspace arrays as a convenience (`work` of the optimal size).
* Prefer passing caller-owned buffers for batched use.
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {('none'|'permute'|'scale'|'both')} balanc - balancing option (`'none'`, `'permute'`, `'scale'`, or `'both'`)
* @param {('no-vectors'|'compute-vectors')} jobvl - `'compute-vectors'` or `'no-vectors'`
* @param {('no-vectors'|'compute-vectors')} jobvr - `'compute-vectors'` or `'no-vectors'`
* @param {('none'|'eigenvalues'|'right-vectors'|'both')} sense - reciprocal condition numbers to compute (`'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`)
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} A - input matrix A (N x N), overwritten on exit
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Float64Array} B - input matrix B (N x N), overwritten on exit
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Float64Array} ALPHAR - output: real parts of alpha (length N)
* @param {integer} strideALPHAR - stride for ALPHAR
* @param {Float64Array} ALPHAI - output: imaginary parts of alpha (length N)
* @param {integer} strideALPHAI - stride for ALPHAI
* @param {Float64Array} BETA - output: beta values (length N)
* @param {integer} strideBETA - stride for BETA
* @param {Float64Array} VL - output: left eigenvectors (N x N)
* @param {PositiveInteger} LDVL - leading dimension of VL
* @param {Float64Array} VR - output: right eigenvectors (N x N)
* @param {PositiveInteger} LDVR - leading dimension of VR
* @param {Int32Array} ilo - output (length-1 array): `ilo`
* @param {Int32Array} ihi - output (length-1 array): iLO and IHI are integer values such that on exit A(i,j) = 0 and B(i,j) = 0 if i > j and j = 1,...,ILO-1 or i = IHI+1,...,N
* @param {Float64Array} LSCALE - output: permutation/scaling factors (length N)
* @param {integer} strideLSCALE - stride for LSCALE
* @param {Float64Array} RSCALE - output: permutation/scaling factors (length N)
* @param {integer} strideRSCALE - stride for RSCALE
* @param {Float64Array} abnrm - output (length-1 array): the one-norm of the balanced matrix A
* @param {Float64Array} bbnrm - output (length-1 array): the one-norm of the balanced matrix B
* @param {Float64Array} RCONDE - output: reciprocal condition numbers of eigenvalues (length N)
* @param {integer} strideRCONDE - stride for RCONDE
* @param {Float64Array} RCONDV - output: reciprocal condition numbers of right eigenvectors (length N)
* @param {integer} strideRCONDV - stride for RCONDV
* @param {(Float64Array|null)} work - real workspace of length at least `2*N` if `balanc` is 'none' or 'permute' and no eigenvectors are computed, else `6*N`; at least `10*N` if `sense` is 'eigenvalues' or 'both'; at least `2*N*(N+4)+16` if `sense` is 'right-vectors' or 'both' (all at least 1). For optimal performance at least `max( minimum, N + N*NB + TSIZE )` (`NB` from `ilaenv`, `TSIZE = 4160`), the reference's `N + N*NB` with the dormqr optimum's T part, which enables the blocked QR steps; or `null` to allocate the optimal size
* @param {(Int32Array|null)} iwork - caller-provided integer workspace of length max(1,N+6), or `null` to auto-allocate; not referenced when sense='none' or 'eigenvalues'
* @param {(Uint8Array|null)} bwork - caller-provided logical workspace of length max(1,N), or `null` to auto-allocate; not referenced when sense='none'
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "both", "none", "permute", "scale"
* @throws {TypeError} third argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} fourth argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} fifth argument must be one of the following: "both", "eigenvalues", "none", "right-vectors"
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} eighteenth argument is invalid (rejected when `LDVL < 1 || ( ( jobvl === "compute-vectors" ) && LDVL < N )`)
* @throws {RangeError} twentieth argument is invalid (rejected when `LDVR < 1 || ( ( jobvr === "compute-vectors" ) && LDVR < N )`)
* @returns {integer} status code (0 = success)
*/
function dggevx( order, balanc, jobvl, jobvr, sense, N, A, LDA, B, LDB, ALPHAR, strideALPHAR, ALPHAI, strideALPHAI, BETA, strideBETA, VL, LDVL, VR, LDVR, ilo, ihi, LSCALE, strideLSCALE, RSCALE, strideRSCALE, abnrm, bbnrm, RCONDE, strideRCONDE, RCONDV, strideRCONDV, work, iwork, bwork ) { // eslint-disable-line max-params
	let svl1, svl2, svr1, svr2, sa1, sa2, sb1, sb2, lwork;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( balanc !== 'both' && balanc !== 'none' && balanc !== 'permute' && balanc !== 'scale' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "both", "none", "permute", "scale". Value: `%s`.', balanc ) );
	}
	if ( jobvl !== 'no-vectors' && jobvl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'no-vectors' && jobvr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobvr ) );
	}
	if ( sense !== 'both' && sense !== 'eigenvalues' && sense !== 'none' && sense !== 'right-vectors' ) {
		throw new TypeError( format( 'invalid argument. Fifth argument must be one of the following: "both", "eigenvalues", "none", "right-vectors". Value: `%s`.', sense ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( LDVL < 1 || ( ( jobvl === 'compute-vectors' ) && LDVL < N ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument is invalid (rejected when `LDVL < 1 || ( ( jobvl === "compute-vectors" ) && LDVL < N )`). Value: `%d`.', LDVL ) );
	}
	if ( LDVR < 1 || ( ( jobvr === 'compute-vectors' ) && LDVR < N ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument is invalid (rejected when `LDVR < 1 || ( ( jobvr === "compute-vectors" ) && LDVR < N )`). Value: `%d`.', LDVR ) );
	}
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

	const wantse = ( sense === 'eigenvalues' );
	const wantsv = ( sense === 'right-vectors' );
	const wantsb = ( sense === 'both' );

	// Auto-allocate workspace arrays when null or not provided:
	if ( work === null || work === void 0 ) {
		lwork = ( ( balanc === 'none' || balanc === 'permute' ) && jobvl !== 'compute-vectors' && jobvr !== 'compute-vectors' ) ? 2 * N : 6 * N;
		if ( wantse || wantsb ) {
			lwork = 10 * N;
		}
		if ( wantsv || wantsb ) {
			lwork = max( lwork, ( 2 * N * ( N + 4 ) ) + 16 );
		}
		work = new Float64Array( computeOptimalWorkSize( jobvl, N, lwork ) );
	}
	if ( iwork === null || iwork === void 0 ) {
		iwork = new Int32Array( max( 1, N + 6 ) );
	}
	if ( bwork === null || bwork === void 0 ) {
		bwork = new Uint8Array( max( 1, N ) );
	}

	return strided( balanc, jobvl, jobvr, sense, N, A, sa1, sa2, 0, B, sb1, sb2, 0, ALPHAR, strideALPHAR, 0, ALPHAI, strideALPHAI, 0, BETA, strideBETA, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, ilo, ihi, LSCALE, strideLSCALE, 0, RSCALE, strideRSCALE, 0, abnrm, bbnrm, RCONDE, strideRCONDE, 0, RCONDV, strideRCONDV, 0, work, 1, 0, iwork, 1, 0, bwork, 1, 0 );
}


// EXPORTS //

export default dggevx;
