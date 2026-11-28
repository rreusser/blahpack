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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import strided from './strided.js';
import { computeOptimalWorkSize } from './base.js';


// MAIN //

/**
* Computes the eigenvalues and, optionally, the left and/or right eigenvectors for general matrices.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('no-vectors'|'compute-vectors')} jobvl - `'no-vectors'`: left eigenvectors of A are not computed; `'compute-vectors'`: left eigenvectors of are computed.
* @param {('no-vectors'|'compute-vectors')} jobvr - `'no-vectors'`: right eigenvectors of A are not computed; `'compute-vectors'`: right eigenvectors of A are computed.
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {Complex128Array} A - on entry, the N-by-N matrix A. On exit, A has been overwritten.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} w - w contains the computed eigenvalues.
* @param {integer} strideW - stride length for `w`
* @param {Complex128Array} VL - if `jobvl === 'compute-vectors'`, the left eigenvectors u(j) are stored one after another in the columns of VL, in the same order as their eigenvalues.
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Complex128Array} VR - if `jobvr === 'compute-vectors'`, the right eigenvectors v(j) are stored one after another in the columns of VR, in the same order as their eigenvalues.
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {(Complex128Array|null)} WORK - workspace of at least `max(1,2*N)` complex elements, or `null` to allocate the reference's optimum (MAXWRK, with the callees' optima, NB from `ilaenv`: zgehrd `N*NB + 4160`, zunghr `(N-1)*NB`, ztrevc3 `N + 2*N*NB` with eigenvectors, and zhseqr's LWKOPT)
* @param {(Float64Array|null)} RWORK - caller-provided workspace of at least `2 * N` elements
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} third argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} tenth argument is invalid (rejected when `LDVL < 1 || ( jobvl === "compute-vectors" && LDVL < N )`)
* @throws {RangeError} twelfth argument is invalid (rejected when `LDVR < 1 || ( jobvr === "compute-vectors" && LDVR < N )`)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function zgeev( order, jobvl, jobvr, N, A, LDA, w, strideW, VL, LDVL, VR, LDVR, WORK, RWORK ) { // eslint-disable-line max-len, max-params

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
	if ( LDVL < 1 || ( jobvl === 'compute-vectors' && LDVL < N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument is invalid (rejected when `LDVL < 1 || ( jobvl === "compute-vectors" && LDVL < N )`). Value: `%d`.', LDVL ) );
	}
	if ( LDVR < 1 || ( jobvr === 'compute-vectors' && LDVR < N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument is invalid (rejected when `LDVR < 1 || ( jobvr === "compute-vectors" && LDVR < N )`). Value: `%d`.', LDVR ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const svl1 = ( order === 'column-major' ) ? 1 : LDVL;
	const svl2 = ( order === 'column-major' ) ? LDVL : 1;
	const svr1 = ( order === 'column-major' ) ? 1 : LDVR;
	const svr2 = ( order === 'column-major' ) ? LDVR : 1;
	const ow = stride2offset( N, strideW );
	if ( WORK === null || WORK === void 0 ) {
		// The reference's optimum (MAXWRK), with the JS callees' optima:
		WORK = new Complex128Array( computeOptimalWorkSize( jobvl, jobvr, N ) );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, 2 * N );
		RWORK = new Float64Array( minRwork );
	}
	return strided( jobvl, jobvr, N, A, sa1, sa2, 0, w, strideW, ow, VL, svl1, svl2, 0, VR, svr1, svr2, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgeev;
