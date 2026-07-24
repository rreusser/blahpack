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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the generalized eigenvalues, the generalized complex Schur form.
* (S,T), and optionally the left and/or right matrices of Schur vectors for
* a pair of N-by-N complex nonsymmetric matrices (A,B).
*
* When `WORK`, `RWORK`, or `BWORK` is `null`, this wrapper auto-allocates that
* workspace at the required size as a convenience. Prefer passing caller-owned
* buffers for batched use.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} jobvsl - `'compute-vectors'` or `'no-vectors'`
* @param {string} jobvsr - `'compute-vectors'` or `'no-vectors'`
* @param {string} sort - `'sorted'` or `'not-sorted'`
* @param {Function} selctg - selection function `(alphaRe, alphaIm, betaRe, betaIm) => boolean`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} A - input matrix A (N x N), overwritten on exit
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Complex128Array} B - input matrix B (N x N), overwritten on exit
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Complex128Array} ALPHA - output: eigenvalue numerators (length N)
* @param {Complex128Array} BETA - output: eigenvalue denominators (length N)
* @param {Complex128Array} VSL - output: left Schur vectors (N x N)
* @param {PositiveInteger} LDVSL - leading dimension of VSL
* @param {Complex128Array} VSR - output: right Schur vectors (N x N)
* @param {PositiveInteger} LDVSR - leading dimension of VSR
* @param {(Complex128Array|null)} WORK - caller-provided complex workspace of length at least N + max(8*N, 1), or null to auto-allocate
* @param {(Float64Array|null)} RWORK - caller-provided real workspace of length at least 2*N + max(8*N, 1), or null to auto-allocate
* @param {(Uint8Array|null)} BWORK - caller-provided logical workspace of length at least N, or null to auto-allocate
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} LDA must be >= max(1,N)
* @throws {RangeError} LDB must be >= max(1,N)
* @throws {RangeError} LDVSL must be >= max(1,N)
* @throws {RangeError} LDVSR must be >= max(1,N)
* @returns {Object} result with properties: info (integer status code), sdim (number of sorted eigenvalues)
*/
function zgges( order, jobvsl, jobvsr, sort, selctg, N, A, LDA, B, LDB, ALPHA, BETA, VSL, LDVSL, VSR, LDVSR, WORK, RWORK, BWORK ) {
	let svsl1, svsl2, svsr1, svsr2, sa1, sa2, sb1, sb2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDVSL < 1 ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be >= 1. Value: `%d`.', LDVSL ) );
	}
	if ( LDVSR < 1 ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be >= 1. Value: `%d`.', LDVSR ) );
	}
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
		WORK = new Complex128Array( ( N > 0 ) ? N + max( 8 * N, 1 ) : 1 );
	}
	if ( RWORK === null ) {
		RWORK = new Float64Array( ( N > 0 ) ? ( 2 * N ) + max( 8 * N, 1 ) : 1 );
	}
	if ( BWORK === null ) {
		BWORK = new Uint8Array( max( 1, N ) );
	}
	return base( jobvsl, jobvsr, sort, selctg, N, A, sa1, sa2, 0, B, sb1, sb2, 0, ALPHA, 1, 0, BETA, 1, 0, VSL, svsl1, svsl2, 0, VSR, svsr1, svsr2, 0, WORK, 1, 0, RWORK, 1, 0, BWORK, 1, 0 );
}


// EXPORTS //

export default zgges;
