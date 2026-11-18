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
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the singular values and, optionally, the right and/0 left.
*
* @param {string} order - storage layout ('row-major' 0 'column-major')
* @param {*} uplo - uplo
* @param {*} N - N
* @param {*} ncvt - ncvt
* @param {*} nru - nru
* @param {*} ncc - ncc
* @param {Float64Array} d - input array
* @param {integer} strideD - `d` stride length
* @param {Float64Array} e - input array
* @param {integer} strideE - `e` stride length
* @param {Complex128Array} VT - input matrix
* @param {PositiveInteger} LDVT - leading dimension of `VT`
* @param {Complex128Array} U - input matrix
* @param {PositiveInteger} LDU - leading dimension of `U`
* @param {Complex128Array} C - input matrix
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {Float64Array} RWORK - input array
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {number} |a| * sign(b)
*/
function zbdsqr( order, uplo, N, ncvt, nru, ncc, d, strideD, e, strideE, VT, LDVT, U, LDU, C, LDC, RWORK ) {
	let sv1, sv2, su1, su2, sc1, sc2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( ( ncvt === 0 && LDVT < 1 ) || ( ncvt > 0 && LDVT < max( 1, N ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument violates the reference leading-dimension rule (column-major: rejected when `( NCVT.EQ.0 .AND. LDVT.LT.1 ) .OR. ( NCVT.GT.0 .AND. LDVT.LT.MAX( 1, N ) )`). Value: `%d`.', LDVT ) );
	}
	if ( order === 'row-major' && ( ( ncvt === 0 && LDVT < 1 ) || ( ncvt > 0 && LDVT < max( 1, ncvt ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument violates the reference leading-dimension rule (row-major: must also cover the NCVT columns). Value: `%d`.', LDVT ) );
	}
	if ( order === 'column-major' && ( LDU < max( 1, nru ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument violates the reference leading-dimension rule (column-major: rejected when `LDU.LT.MAX( 1, NRU )`). Value: `%d`.', LDU ) );
	}
	if ( order === 'row-major' && ( LDU < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument violates the reference leading-dimension rule (row-major: must also cover the N columns). Value: `%d`.', LDU ) );
	}
	if ( order === 'column-major' && ( ( ncc === 0 && LDC < 1 ) || ( ncc > 0 && LDC < max( 1, N ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument violates the reference leading-dimension rule (column-major: rejected when `( NCC.EQ.0 .AND. LDC.LT.1 ) .OR. ( NCC.GT.0 .AND. LDC.LT.MAX( 1, N ) )`). Value: `%d`.', LDC ) );
	}
	if ( order === 'row-major' && ( ( ncc === 0 && LDC < 1 ) || ( ncc > 0 && LDC < max( 1, ncc ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument violates the reference leading-dimension rule (row-major: must also cover the NCC columns). Value: `%d`.', LDC ) );
	}
	if ( order === 'column-major' ) {
		sv1 = 1;
		sv2 = LDVT;
		su1 = 1;
		su2 = LDU;
		sc1 = 1;
		sc2 = LDC;
	} else {
		sv1 = LDVT;
		sv2 = 1;
		su1 = LDU;
		su2 = 1;
		sc1 = LDC;
		sc2 = 1;
	}
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N, strideE );
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, 4 * N );
		RWORK = new Float64Array( minRwork );
	}
	return base( uplo, N, ncvt, nru, ncc, d, strideD, od, e, strideE, oe, VT, sv1, sv2, 0, U, su1, su2, 0, C, sc1, sc2, 0, RWORK, 1, 0 );
}


// EXPORTS //

export default zbdsqr;
