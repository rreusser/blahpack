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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the eigenvalues and, optionally, the left and/or right eigenvectors.
* of a real N-by-N nonsymmetric matrix A.
*
* When `work` is `null`, this wrapper auto-allocates a workspace of size
* `max(1, 4*N)` elements (`34*N + 2047` when `N >= 34`). Prefer passing a caller-owned buffer for batched use.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('no-vectors'|'compute-vectors')} jobvl - `'compute-vectors'` or `'no-vectors'`
* @param {('no-vectors'|'compute-vectors')} jobvr - `'compute-vectors'` or `'no-vectors'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {Float64Array} A - input matrix (N x N), overwritten on exit
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} WR - output: real parts of eigenvalues (length N)
* @param {integer} strideWR - stride for WR
* @param {Float64Array} WI - output: imaginary parts of eigenvalues (length N)
* @param {integer} strideWI - stride for WI
* @param {Float64Array} VL - output: left eigenvectors (N x N), not referenced if jobvl=`'no-vectors'`
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Float64Array} VR - output: right eigenvectors (N x N), not referenced if jobvr=`'no-vectors'`
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {(Float64Array|null)} work - caller-provided workspace, or `null` to auto-allocate
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} third argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} twelfth argument is invalid (rejected when `LDVL < 1 || ( jobvl === "compute-vectors" && LDVL < N )`)
* @throws {RangeError} fourteenth argument is invalid (rejected when `LDVR < 1 || ( jobvr === "compute-vectors" && LDVR < N )`)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function dgeev( order, jobvl, jobvr, N, A, LDA, WR, strideWR, WI, strideWI, VL, LDVL, VR, LDVR, work ) { // eslint-disable-line max-len, max-params

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
		throw new RangeError( format( 'invalid argument. Twelfth argument is invalid (rejected when `LDVL < 1 || ( jobvl === "compute-vectors" && LDVL < N )`). Value: `%d`.', LDVL ) );
	}
	if ( LDVR < 1 || ( jobvr === 'compute-vectors' && LDVR < N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument is invalid (rejected when `LDVR < 1 || ( jobvr === "compute-vectors" && LDVR < N )`). Value: `%d`.', LDVR ) );
	}
	if ( work === null || work === void 0 ) {
		// See ndarray.js: the blocked dgehrd needs `34*N + 2047` once `N >= 34`.
		work = new Float64Array( ( N >= 34 ) ? ( 34 * N ) + 2047 : max( 1, 4 * N ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const svl1 = ( order === 'column-major' ) ? 1 : LDVL;
	const svl2 = ( order === 'column-major' ) ? LDVL : 1;
	const svr1 = ( order === 'column-major' ) ? 1 : LDVR;
	const svr2 = ( order === 'column-major' ) ? LDVR : 1;
	const owr = stride2offset( N, strideWR );
	const owi = stride2offset( N, strideWI );
	return base( jobvl, jobvr, N, A, sa1, sa2, 0, WR, strideWR, owr, WI, strideWI, owi, VL, svl1, svl2, 0, VR, svr1, svr2, 0, work, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgeev;
