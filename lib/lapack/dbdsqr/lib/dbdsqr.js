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
import strided from './strided.js';


// MAIN //

/**
* Computes the singular values and, optionally, the right and/or left.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {MatrixTriangle} uplo - `'upper'`: B is upper bidiagonal; `'lower'`: B is lower bidiagonal.
* @param {NonNegativeInteger} N - the order of the matrix B.
* @param {NonNegativeInteger} ncvt - the number of columns of the matrix VT.
* @param {NonNegativeInteger} nru - the number of rows of the matrix U.
* @param {NonNegativeInteger} ncc - the number of columns of the matrix C.
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
* @param {(Float64Array|null)} WORK - input array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} twelfth argument is invalid (column-major: rejected when `( ncvt === 0 && LDVT < 1 ) || ( ncvt > 0 && LDVT < max( 1, N ) )`)
* @throws {RangeError} twelfth argument is invalid (row-major: rejected when `( ncvt === 0 && LDVT < 1 ) || ( ncvt > 0 && LDVT < max( 1, ncvt ) )`)
* @throws {RangeError} fourteenth argument must be greater than or equal to `max( 1, nru )` (column-major)
* @throws {RangeError} fourteenth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} sixteenth argument is invalid (column-major: rejected when `( ncc === 0 && LDC < 1 ) || ( ncc > 0 && LDC < max( 1, N ) )`)
* @throws {RangeError} sixteenth argument is invalid (row-major: rejected when `( ncc === 0 && LDC < 1 ) || ( ncc > 0 && LDC < max( 1, ncc ) )`)
* @returns {integer} |a| * sign(b)
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
	if ( ncvt < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', ncvt ) );
	}
	if ( nru < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', nru ) );
	}
	if ( ncc < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', ncc ) );
	}
	if ( order === 'column-major' && ( ( ncvt === 0 && LDVT < 1 ) || ( ncvt > 0 && LDVT < max( 1, N ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument is invalid (column-major: rejected when `( ncvt === 0 && LDVT < 1 ) || ( ncvt > 0 && LDVT < max( 1, N ) )`). Value: `%d`.', LDVT ) );
	}
	if ( order === 'row-major' && ( ( ncvt === 0 && LDVT < 1 ) || ( ncvt > 0 && LDVT < max( 1, ncvt ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument is invalid (row-major: rejected when `( ncvt === 0 && LDVT < 1 ) || ( ncvt > 0 && LDVT < max( 1, ncvt ) )`). Value: `%d`.', LDVT ) );
	}
	if ( order === 'column-major' && ( LDU < max( 1, nru ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', nru, LDU ) );
	}
	if ( order === 'row-major' && ( LDU < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDU ) );
	}
	if ( order === 'column-major' && ( ( ncc === 0 && LDC < 1 ) || ( ncc > 0 && LDC < max( 1, N ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument is invalid (column-major: rejected when `( ncc === 0 && LDC < 1 ) || ( ncc > 0 && LDC < max( 1, N ) )`). Value: `%d`.', LDC ) );
	}
	if ( order === 'row-major' && ( ( ncc === 0 && LDC < 1 ) || ( ncc > 0 && LDC < max( 1, ncc ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument is invalid (row-major: rejected when `( ncc === 0 && LDC < 1 ) || ( ncc > 0 && LDC < max( 1, ncc ) )`). Value: `%d`.', LDC ) );
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
	const oe = stride2offset( N - 1, strideE );
	if ( WORK === null || WORK === void 0 ) {
		// The values-only path calls DLASQ1 (dbdsqr.f:337), which needs 4*N:
		WORK = new Float64Array( max( 1, 4 * N ) );
	}
	return strided( uplo, N, ncvt, nru, ncc, d, strideD, od, e, strideE, oe, VT, sv1, sv2, 0, U, su1, su2, 0, C, sc1, sc2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default dbdsqr;
