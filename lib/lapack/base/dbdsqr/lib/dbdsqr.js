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
* Computes the singular values and, optionally, the right and/or left.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {*} uplo - uplo
* @param {*} N - N
* @param {*} ncvt - ncvt
* @param {*} nru - nru
* @param {*} ncc - ncc
* @param {Float64Array} d - input array
* @param {integer} strideD - `d` stride length
* @param {Float64Array} e - input array
* @param {integer} strideE - `e` stride length
* @param {Float64Array} VT - input matrix
* @param {PositiveInteger} LDVT - leading dimension of `VT`
* @param {Float64Array} U - input matrix
* @param {PositiveInteger} LDU - leading dimension of `U`
* @param {Float64Array} C - input matrix
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {Float64Array} WORK - input array
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {number} |a| * sign(b)
*/
function dbdsqr( order, uplo, N, ncvt, nru, ncc, d, strideD, e, strideE, VT, LDVT, U, LDU, C, LDC, WORK ) {
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
	if ( LDVT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVT ) );
	}
	if ( LDU < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDU ) );
	}
	if ( LDC < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDC ) );
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
	if ( WORK === null || WORK === void 0 ) {
		const minWork = ( ncvt === 0 && nru === 0 && ncc === 0 ) ? Math.max( 1, 4*N - 4 ) : Math.max( 1, 4*N );
		WORK = new Float64Array( minWork );
	}
	return base( uplo, N, ncvt, nru, ncc, d, strideD, od, e, strideE, oe, VT, sv1, sv2, 0, U, su1, su2, 0, C, sc1, sc2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default dbdsqr;
