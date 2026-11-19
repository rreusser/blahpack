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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes eigenvalues and, optionally, the left and/or right eigenvectors of a real N-by-N nonsymmetric matrix A, plus optionally a balancing transformation, reciprocal condition numbers of eigenvalues, and reciprocal condition numbers of right eigenvectors.
*
* When `work` is `null`, this wrapper auto-allocates a workspace of size `max(1, N*(N+7))`. When `iwork` is `null`, this wrapper auto-allocates an integer workspace of size `max(1, 2*(N-1))`. Prefer passing caller-owned buffers for batched use.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} balanc - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {string} jobvl - `'compute-vectors'` or `'no-vectors'`
* @param {string} jobvr - `'compute-vectors'` or `'no-vectors'`
* @param {string} sense - `'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input matrix (column-major, LDA x N)
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Float64Array} WR - output: real parts of eigenvalues (length N)
* @param {integer} strideWR - stride for WR
* @param {Float64Array} WI - output: imaginary parts of eigenvalues (length N)
* @param {integer} strideWI - stride for WI
* @param {Float64Array} VL - output: left eigenvectors
* @param {PositiveInteger} LDVL - leading dimension of VL
* @param {Float64Array} VR - output: right eigenvectors
* @param {PositiveInteger} LDVR - leading dimension of VR
* @param {Int32Array} ilo - output (length-1 array): `ilo`
* @param {Int32Array} ihi - output (length-1 array): iLO and IHI are integer values determined when A was balanced
* @param {Float64Array} SCALE - output: balancing/scaling details (length N)
* @param {integer} strideSCALE - stride length for `SCALE`
* @param {Float64Array} abnrm - output (length-1 array): the one-norm of the balanced matrix (the maximum of the sum of absolute values of elements of any column)
* @param {Float64Array} RCONDE - output: reciprocal condition numbers for eigenvalues (length N)
* @param {integer} strideRCONDE - stride length for `RCONDE`
* @param {Float64Array} RCONDV - output: reciprocal condition numbers for right eigenvectors (length N)
* @param {integer} strideRCONDV - stride length for `RCONDV`
* @param {(Float64Array|null)} [work=null] - caller-provided workspace (size >= max(1, N*(N+7))), or `null` to auto-allocate
* @param {(Int32Array|null)} [iwork=null] - caller-provided integer workspace (size >= max(1, 2*(N-1))), or `null` to auto-allocate
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} must supply valid `balanc`, `jobvl`, `jobvr`, `sense`
* @throws {RangeError} `N` must be nonnegative; leading dimensions must be at least `max(1,N)`
* @returns {integer} status code (0 = success)
*/
function dgeevx( order, balanc, jobvl, jobvr, sense, N, A, LDA, WR, strideWR, WI, strideWI, VL, LDVL, VR, LDVR, ilo, ihi, SCALE, strideSCALE, abnrm, RCONDE, strideRCONDE, RCONDV, strideRCONDV, work, iwork ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( jobvl !== 'no-vectors' && jobvl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'no-vectors' && jobvr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobvr ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( LDVL < 1 || ( jobvl === 'compute-vectors' && LDVL < N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument is invalid (rejected when `LDVL < 1 || ( jobvl === "compute-vectors" && LDVL < N )`). Value: `%d`.', LDVL ) );
	}
	if ( LDVR < 1 || ( jobvr === 'compute-vectors' && LDVR < N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument is invalid (rejected when `LDVR < 1 || ( jobvr === "compute-vectors" && LDVR < N )`). Value: `%d`.', LDVR ) );
	}
	const oscale = stride2offset( N, strideSCALE );
	const orconde = stride2offset( N, strideRCONDE );
	const orcondv = stride2offset( N, strideRCONDV );
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const svl1 = ( order === 'column-major' ) ? 1 : LDVL;
	const svl2 = ( order === 'column-major' ) ? LDVL : 1;
	const svr1 = ( order === 'column-major' ) ? 1 : LDVR;
	const svr2 = ( order === 'column-major' ) ? LDVR : 1;
	if ( balanc !== 'none' && balanc !== 'permute' && balanc !== 'scale' && balanc !== 'both' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `balanc` value. Value: `%s`.', balanc ) );
	}
	if ( sense !== 'none' && sense !== 'eigenvalues' && sense !== 'right-vectors' && sense !== 'both' ) {
		throw new TypeError( format( 'invalid argument. Fifth argument must be a valid `sense` value. Value: `%s`.', sense ) );
	}
	if ( work === null || work === void 0 ) {
		work = new Float64Array( max( 1, N * ( N + 7 ) ) );
	}
	if ( iwork === null || iwork === void 0 ) {
		iwork = new Int32Array( max( 1, 2 * ( N - 1 ) ) );
	}
	return base( balanc, jobvl, jobvr, sense, N, A, sa1, sa2, 0, WR, strideWR, 0, WI, strideWI, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, ilo, ihi, SCALE, strideSCALE, oscale, abnrm, RCONDE, strideRCONDE, orconde, RCONDV, strideRCONDV, orcondv, work, 1, 0, iwork, 1, 0 );
}


// EXPORTS //

export default dgeevx;
