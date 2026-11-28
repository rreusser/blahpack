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
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import strided from './strided.js';


// MAIN //

/**
* Reduces a complex Hermitian band matrix to real tridiagonal form by unitary similarity transformation.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('none'|'initialize'|'update')} vect - `'none'`, `'initialize'`, or `'update'`
* @param {MatrixTriangle} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super- (or sub-) diagonals
* @param {Complex128Array} AB - band matrix (LDAB x N)
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} d - output array for diagonal elements (length N)
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} e - output array for off-diagonal elements (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {Complex128Array} Q - unitary matrix (LDQ x N)
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {(Complex128Array|null)} WORK - workspace (length N)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "none", "update", "initialize"
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to `kd + 1` (column-major)
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} thirteenth argument is invalid (rejected when `LDQ < max( 1, N ) && ( vect === "initialize" || vect === "update" )`)
* @returns {integer} status code (0 = success)
*/
function zhbtrd( order, vect, uplo, N, kd, AB, LDAB, d, strideD, e, strideE, Q, LDQ, WORK ) {
	let sab1, sab2, sq1, sq2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( vect !== 'none' && vect !== 'update' && vect !== 'initialize' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "none", "update", "initialize". Value: `%s`.', vect ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kd < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', kd ) );
	}
	if ( order === 'column-major' && ( LDAB < kd + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to %d. Value: `%d`.', kd + 1, LDAB ) );
	}
	if ( order === 'row-major' && ( LDAB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDAB ) );
	}
	if ( LDQ < max( 1, N ) && ( vect === 'initialize' || vect === 'update' ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument is invalid (rejected when `LDQ < max( 1, N ) && ( vect === "initialize" || vect === "update" )`). Value: `%d`.', LDQ ) );
	}
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N - 1, strideE );
	if ( order === 'column-major' ) {
		sab1 = 1;
		sab2 = LDAB;
		sq1 = 1;
		sq2 = LDQ;
	} else {
		sab1 = LDAB;
		sab2 = 1;
		sq1 = LDQ;
		sq2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, N );
		WORK = new Complex128Array( minWork );
	}
	return strided( vect, uplo, N, kd, AB, sab1, sab2, 0, d, strideD, od, e, strideE, oe, Q, sq1, sq2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default zhbtrd;
