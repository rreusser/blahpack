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
import format from '@stdlib/string/format/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes some or all right and/or left eigenvectors of a complex upper triangular matrix using a blocked algorithm.
*
* @param {string} side - `'right'`, `'left'`, or `'both'`
* @param {string} howmny - `'all'`, `'backtransform'`, or `'selected'`
* @param {(Uint8Array|Array)} SELECT - selection array (used when `howmny` is `'selected'`)
* @param {integer} strideSELECT - `SELECT` stride length
* @param {NonNegativeInteger} N - order of the matrix T
* @param {Complex128Array} T - upper triangular matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Complex128Array} VL - left eigenvectors (output when `side` includes left)
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Complex128Array} VR - right eigenvectors (output when `side` includes right)
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {integer} mm - number of columns available in `VL`/`VR`
* @param {Int32Array} M - output count of eigenvectors
* @param {(Complex128Array|null)} WORK - workspace (>= `2*N` complex elements); auto-allocated when `null`
* @param {integer} strideWork - `WORK` stride length
* @param {(Float64Array|null)} RWORK - workspace (>= `N` reals); auto-allocated when `null`
* @param {integer} strideRWork - `RWORK` stride length
* @throws {TypeError} first argument must be a valid operation side
* @throws {TypeError} second argument must be a valid howmny value
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function ztrevc3( side, howmny, SELECT, strideSELECT, N, T, LDT, VL, LDVL, VR, LDVR, mm, M, WORK, strideWork, RWORK, strideRWork ) {
	const st1 = 1;
	const st2 = LDT;
	const svl1 = 1;
	const svl2 = LDVL;
	const svr1 = 1;
	const svr2 = LDVR;

	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( howmny !== 'all' && howmny !== 'backtransform' && howmny !== 'selected' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `howmny` value. Value: `%s`.', howmny ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDT ) );
	}
	if ( LDVL < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVL ) );
	}
	if ( LDVR < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDVR ) );
	}
	const oselect = stride2offset( N, strideSELECT );
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( max( 1, 2*N ) );
		strideWork = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		RWORK = new Float64Array( max( 1, N ) );
		strideRWork = 1;
	}
	const owork = stride2offset( N, strideWork );
	const orwork = stride2offset( N, strideRWork );
	return base( side, howmny, SELECT, strideSELECT, oselect, N, T, st1, st2, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, mm, M, WORK, strideWork, owork, RWORK, strideRWork, orwork );
}


// EXPORTS //

export default ztrevc3;
