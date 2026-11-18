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
import base from './base.js';


// MAIN //

/**
* Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a complex triangular matrix.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} job - `'eigenvalues'`, `'eigenvectors'`, or `'both'`
* @param {string} howmny - `'all'` or `'selected'`
* @param {(Uint8Array|Array)} SELECT - boolean selection array
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} N - order of the matrix T
* @param {Complex128Array} T - input upper triangular matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Complex128Array} VL - left eigenvector matrix
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Complex128Array} VR - right eigenvector matrix
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {Float64Array} s - output: reciprocal condition numbers of eigenvalues
* @param {integer} strideS - stride length for `s`
* @param {Float64Array} SEP - output: reciprocal condition numbers of eigenvectors
* @param {integer} strideSEP - stride length for `SEP`
* @param {integer} mm - column dimension of VL/VR/WORK
* @param {Int32Array} M - output: M[0] = number of condition numbers produced
* @param {Complex128Array} WORK - complex workspace
* @param {PositiveInteger} LDWORK - leading dimension of `WORK`
* @param {Float64Array} RWORK - real workspace
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} must supply valid dimensions
* @returns {integer} status code (0 = success)
*/
function ztrsna( order, job, howmny, SELECT, strideSELECT, N, T, LDT, VL, LDVL, VR, LDVR, s, strideS, SEP, strideSEP, mm, M, WORK, LDWORK, RWORK ) { // eslint-disable-line max-len, max-params
	let swork1, swork2, svl1, svl2, svr1, svr2, st1, st2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be >= max(1,N). Value: `%d`.', LDT ) );
	}
	if ( LDVL < 1 || ( ( job === 'eigenvalues' || job === 'both' ) && LDVL < ( ( order === 'column-major' ) ? N : mm ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be >= 1, and >= N (column-major) or mm (row-major) when computing eigenvalue condition numbers. Value: `%d`.', LDVL ) );
	}
	if ( LDVR < 1 || ( ( job === 'eigenvalues' || job === 'both' ) && LDVR < ( ( order === 'column-major' ) ? N : mm ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be >= 1, and >= N (column-major) or mm (row-major) when computing eigenvalue condition numbers. Value: `%d`.', LDVR ) );
	}
	if ( LDWORK < 1 || ( ( job === 'eigenvectors' || job === 'both' ) && LDWORK < ( ( order === 'column-major' || N < 2 ) ? N : N + 1 ) ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be >= 1, and >= N (column-major) or N+1 (row-major, N > 1; column N holds the norm-estimator vector) when computing eigenvector condition numbers. Value: `%d`.', LDWORK ) );
	}
	if ( order === 'column-major' ) {
		st1 = 1;
		st2 = LDT;
		svl1 = 1;
		svl2 = LDVL;
		svr1 = 1;
		svr2 = LDVR;
		swork1 = 1;
		swork2 = LDWORK;
	} else {
		st1 = LDT;
		st2 = 1;
		svl1 = LDVL;
		svl2 = 1;
		svr1 = LDVR;
		svr2 = 1;
		swork1 = LDWORK;
		swork2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, LDWORK * ( N + 1 ) ); // reference WORK( LDWORK, N+1 )
		WORK = new Complex128Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
	}
	return base( job, howmny, SELECT, strideSELECT, 0, N, T, st1, st2, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, s, strideS, 0, SEP, strideSEP, 0, mm, M, WORK, swork1, swork2, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztrsna;
