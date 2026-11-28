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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import strided from './strided.js';
import { computeOptimalWorkSize } from './base.js';


// MAIN //

/**
* Computes the generalized eigenvalues, the generalized complex Schur form.
* (S,T), and optionally the left and/or right matrices of Schur vectors for
* a pair of N-by-N complex nonsymmetric matrices (A,B).
*
* When `WORK`, `RWORK`, or `BWORK` is `null`, this wrapper auto-allocates that
* workspace as a convenience: `WORK` at the optimal size (the reference's
* LWKOPT, with NB from `ilaenv`, plus the zunmqr optimum's T part,
* `TSIZE = 4160`), the others at the required size. Prefer passing caller-owned
* buffers for batched use.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('no-vectors'|'compute-vectors')} jobvsl - `'compute-vectors'` or `'no-vectors'`
* @param {('no-vectors'|'compute-vectors')} jobvsr - `'compute-vectors'` or `'no-vectors'`
* @param {('none'|'sort')} sort - `'sort'` or `'none'`
* @param {Function} selctg - selection function `(alphaRe, alphaIm, betaRe, betaIm) => boolean`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} A - input matrix A (N x N), overwritten on exit
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Complex128Array} B - input matrix B (N x N), overwritten on exit
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Int32Array} sdim - output (length-1 array): if SORT = `'N'`, SDIM = 0
* @param {Complex128Array} ALPHA - output: eigenvalue numerators (length N)
* @param {integer} strideALPHA - stride length for `ALPHA`
* @param {Complex128Array} BETA - output: eigenvalue denominators (length N)
* @param {integer} strideBETA - stride length for `BETA`
* @param {Complex128Array} VSL - output: left Schur vectors (N x N)
* @param {PositiveInteger} LDVSL - leading dimension of VSL
* @param {Complex128Array} VSR - output: right Schur vectors (N x N)
* @param {PositiveInteger} LDVSR - leading dimension of VSR
* @param {(Complex128Array|null)} WORK - caller-provided complex workspace of length at least max(1,2*N), or null to auto-allocate
* @param {(Float64Array|null)} RWORK - caller-provided real workspace of length at least 8*N, or null to auto-allocate
* @param {(Uint8Array|null)} BWORK - caller-provided logical workspace of length at least N, or null to auto-allocate
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} third argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} fourth argument must be one of the following: "none", "sort"
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} seventeenth argument is invalid (rejected when `LDVSL < 1 || ( ( jobvsl === "compute-vectors" ) && LDVSL < N )`)
* @throws {RangeError} nineteenth argument is invalid (rejected when `LDVSR < 1 || ( ( jobvsr === "compute-vectors" ) && LDVSR < N )`)
* @throws {RangeError} LDA must be >= max(1,N)
* @throws {RangeError} LDB must be >= max(1,N)
* @throws {RangeError} LDVSL must be >= max(1,N)
* @throws {RangeError} LDVSR must be >= max(1,N)
* @returns {integer} status code (0 = success)
*/
function zgges( order, jobvsl, jobvsr, sort, selctg, N, A, LDA, B, LDB, sdim, ALPHA, strideALPHA, BETA, strideBETA, VSL, LDVSL, VSR, LDVSR, WORK, RWORK, BWORK ) {
	let svsl1, svsl2, svsr1, svsr2, sa1, sa2, sb1, sb2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( jobvsl !== 'no-vectors' && jobvsl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobvsl ) );
	}
	if ( jobvsr !== 'no-vectors' && jobvsr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobvsr ) );
	}
	if ( sort !== 'none' && sort !== 'sort' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be one of the following: "none", "sort". Value: `%s`.', sort ) );
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
	if ( LDVSL < 1 || ( ( jobvsl === 'compute-vectors' ) && LDVSL < N ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument is invalid (rejected when `LDVSL < 1 || ( ( jobvsl === "compute-vectors" ) && LDVSL < N )`). Value: `%d`.', LDVSL ) );
	}
	if ( LDVSR < 1 || ( ( jobvsr === 'compute-vectors' ) && LDVSR < N ) ) {
		throw new RangeError( format( 'invalid argument. Nineteenth argument is invalid (rejected when `LDVSR < 1 || ( ( jobvsr === "compute-vectors" ) && LDVSR < N )`). Value: `%d`.', LDVSR ) );
	}
	const oalpha = stride2offset( N, strideALPHA );
	const obeta = stride2offset( N, strideBETA );
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
		svsl1 = 1;
		svsl2 = LDVSL;
		svsr1 = 1;
		svsr2 = LDVSR;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
		svsl1 = LDVSL;
		svsl2 = 1;
		svsr1 = LDVSR;
		svsr2 = 1;
	}
	if ( WORK === null ) {
		WORK = new Complex128Array( computeOptimalWorkSize( jobvsl, N ) );
	}
	if ( RWORK === null ) {
		RWORK = new Float64Array( max( 1, 8 * N ) );
	}
	if ( BWORK === null ) {
		BWORK = new Uint8Array( max( 1, N ) );
	}
	return strided( jobvsl, jobvsr, sort, selctg, N, A, sa1, sa2, 0, B, sb1, sb2, 0, sdim, ALPHA, strideALPHA, oalpha, BETA, strideBETA, obeta, VSL, svsl1, svsl2, 0, VSR, svsr1, svsr2, 0, WORK, 1, 0, RWORK, 1, 0, BWORK, 1, 0 );
}


// EXPORTS //

export default zgges;
