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
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} jobvl - jobvl
* @param {string} jobvr - jobvr
* @param {NonNegativeInteger} N - N
* @param {Complex128Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} w - w
* @param {integer} strideW - strideW
* @param {Complex128Array} VL - VL
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Complex128Array} VR - VR
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {Complex128Array} WORK - WORK
* @param {Float64Array} RWORK - RWORK
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zgeev( order, jobvl, jobvr, N, A, LDA, w, strideW, VL, LDVL, VR, LDVR, WORK, RWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const svl1 = ( order === 'column-major' ) ? 1 : LDVL;
	const svl2 = ( order === 'column-major' ) ? LDVL : 1;
	const svr1 = ( order === 'column-major' ) ? 1 : LDVR;
	const svr2 = ( order === 'column-major' ) ? LDVR : 1;
	const ow = stride2offset( N, strideW );
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( max( 1, 2*N ) );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, 2 * N );
		RWORK = new Float64Array( minRwork );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument violates the reference leading-dimension rule (rejected when `LDA.LT.MAX( 1, N )`). Value: `%d`.', LDA ) );
	}
	if ( LDVL < 1 || ( ( jobvl === 'compute-vectors' ) && LDVL < N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument violates the reference leading-dimension rule (rejected when `LDVL.LT.1 .OR. ( WANTVL .AND. LDVL.LT.N )`). Value: `%d`.', LDVL ) );
	}
	if ( LDVR < 1 || ( ( jobvr === 'compute-vectors' ) && LDVR < N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument violates the reference leading-dimension rule (rejected when `LDVR.LT.1 .OR. ( WANTVR .AND. LDVR.LT.N )`). Value: `%d`.', LDVR ) );
	}
	if ( jobvl !== 'no-vectors' && jobvl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobvl` value. Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'no-vectors' && jobvr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `jobvr` value. Value: `%s`.', jobvr ) );
	}
	return base( jobvl, jobvr, N, A, sa1, sa2, 0, w, strideW, ow, VL, svl1, svl2, 0, VR, svr1, svr2, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgeev;
