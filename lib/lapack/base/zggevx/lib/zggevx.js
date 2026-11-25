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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import base from './base.js';


// FUNCTIONS //

/**
* Returns the minimum complex WORK length required by zggevx.
*
* @private
* @param {string} sense - condition-number selector
* @param {NonNegativeInteger} N - matrix order
* @returns {PositiveInteger} minimum length
*/
function minWorkLength( sense, N ) {
	let need;
	if ( N === 0 ) {
		return 1;
	}
	// TAU (N) plus the QR-step scratch; the JS zgeqrf/zunmqr kernels hardcode NB=32 and need N*NB + (NB+1)*NB once the reduced block exceeds NB:
	need = ( N > 32 ) ? N + ( N * 32 ) + ( 33 * 32 ) : 2 * N;
	if ( sense === 'eigenvalues' ) {
		need = Math.max( need, 4 * N );
	} else if ( sense === 'right-vectors' || sense === 'both' ) {
		need = Math.max( need, ( 2 * N ) + ( 2 * N * N ) + Math.max( 1, 4 * ( N - 1 ) ) );
	}
	return need;
}


// MAIN //

/**
* Computes, for a pair of N-by-N complex matrices (A, B), the generalized.
* eigenvalues and, optionally, the left and/or right generalized eigenvectors,
* with optional balancing (LAPACK-style interface).
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('none'|'permute'|'scale'|'both')} balanc - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {('no-vectors'|'compute-vectors')} jobvl - `'no-vectors'` or `'compute-vectors'`
* @param {('no-vectors'|'compute-vectors')} jobvr - `'no-vectors'` or `'compute-vectors'`
* @param {('none'|'eigenvalues'|'right-vectors'|'both')} sense - `'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} A - input matrix A (N x N)
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Complex128Array} B - input matrix B (N x N)
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Complex128Array} ALPHA - output eigenvalue numerators
* @param {integer} strideALPHA - stride for ALPHA (complex elements)
* @param {Complex128Array} BETA - output eigenvalue denominators
* @param {integer} strideBETA - stride for BETA (complex elements)
* @param {Complex128Array} VL - left eigenvector matrix
* @param {PositiveInteger} LDVL - leading dimension of VL
* @param {Complex128Array} VR - right eigenvector matrix
* @param {PositiveInteger} LDVR - leading dimension of VR
* @param {Int32Array} ilo - output (length-1 array): `ilo`
* @param {Int32Array} ihi - output (length-1 array): iLO and IHI are integer values such that on exit A(i,j) = 0 and B(i,j) = 0 if i > j and j = 1,...,ILO-1 or i = IHI+1,...,N
* @param {Float64Array} LSCALE - output left scaling/permutation
* @param {integer} strideLSCALE - stride for LSCALE
* @param {Float64Array} RSCALE - output right scaling/permutation
* @param {integer} strideRSCALE - stride for RSCALE
* @param {Float64Array} abnrm - output (length-1 array): the one-norm of the balanced matrix A
* @param {Float64Array} bbnrm - output (length-1 array): the one-norm of the balanced matrix B
* @param {Float64Array} RCONDE - output eigenvalue condition numbers
* @param {integer} strideRCONDE - stride for RCONDE
* @param {Float64Array} RCONDV - output right eigenvector condition numbers
* @param {integer} strideRCONDV - stride for RCONDV
* @param {(Complex128Array|null)} WORK - complex workspace; length >= 2*N for N <= 32, else >= N + 32*N + 33*32 (TAU plus the blocked zgeqrf/zunmqr scratch), and also >= 4*N if `sense` is 'eigenvalues', >= 2*N + 2*N*N + max(1,4*(N-1)) if 'right-vectors' or 'both'; if `null`, allocated internally
* @param {(Float64Array|null)} RWORK - real workspace; length >= 6*N if `balanc` is 'scale' or 'both', else >= 2*N; if `null`, allocated internally
* @param {(Int32Array|null)} IWORK - integer workspace; length >= N+6 if `sense` is 'right-vectors' or 'both' (unreferenced otherwise); if `null`, allocated internally
* @param {(Uint8Array|null)} BWORK - boolean workspace; length >= N unless `sense` is 'none' (unreferenced otherwise); if `null`, allocated internally
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "both", "none", "permute", "scale"
* @throws {TypeError} third argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} fourth argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} fifth argument must be one of the following: "both", "eigenvalues", "none", "right-vectors"
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} sixteenth argument is invalid (rejected when `LDVL < 1 || ( ( jobvl === "compute-vectors" ) && LDVL < N )`)
* @throws {RangeError} eighteenth argument is invalid (rejected when `LDVR < 1 || ( ( jobvr === "compute-vectors" ) && LDVR < N )`)
* @throws {RangeError} N must be a nonnegative integer
* @throws {RangeError} LDA, LDB, LDVL, LDVR must be valid
* @returns {integer} status code (0 = success)
*/
function zggevx( order, balanc, jobvl, jobvr, sense, N, A, LDA, B, LDB, ALPHA, strideALPHA, BETA, strideBETA, VL, LDVL, VR, LDVR, ilo, ihi, LSCALE, strideLSCALE, RSCALE, strideRSCALE, abnrm, bbnrm, RCONDE, strideRCONDE, RCONDV, strideRCONDV, WORK, RWORK, IWORK, BWORK ) { // eslint-disable-line max-len, max-params
	let svl1, svl2, svr1, svr2, sa1, sa2, sb1, sb2;

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
		throw new RangeError( format( 'invalid argument. Sixteenth argument is invalid (rejected when `LDVL < 1 || ( ( jobvl === "compute-vectors" ) && LDVL < N )`). Value: `%d`.', LDVL ) );
	}
	if ( LDVR < 1 || ( ( jobvr === 'compute-vectors' ) && LDVR < N ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument is invalid (rejected when `LDVR < 1 || ( ( jobvr === "compute-vectors" ) && LDVR < N )`). Value: `%d`.', LDVR ) );
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
	const minWork = minWorkLength( sense, N );
	const minRWork = ( balanc === 'scale' || balanc === 'both' ) ? Math.max( 1, 6 * N ) : Math.max( 1, 2 * N );
	const minIWork = ( sense === 'right-vectors' || sense === 'both' ) ? N + 6 : 0;
	const minBWork = ( sense === 'none' ) ? 0 : N;
	if ( WORK === null ) {
		WORK = new Complex128Array( minWork );
	}
	if ( RWORK === null ) {
		RWORK = new Float64Array( minRWork );
	}
	if ( IWORK === null ) {
		IWORK = new Int32Array( Math.max( 1, minIWork ) );
	}
	if ( BWORK === null ) {
		BWORK = new Uint8Array( Math.max( 1, minBWork ) );
	}
	return base( balanc, jobvl, jobvr, sense, N, A, sa1, sa2, 0, B, sb1, sb2, 0, ALPHA, strideALPHA, 0, BETA, strideBETA, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, ilo, ihi, LSCALE, strideLSCALE, 0, RSCALE, strideRSCALE, 0, abnrm, bbnrm, RCONDE, strideRCONDE, 0, RCONDV, strideRCONDV, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, BWORK, 1, 0 );
}


// EXPORTS //

export default zggevx;
