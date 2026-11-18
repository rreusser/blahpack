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
import base from './base.js';


// MAIN //

/**
* Reduces a real symmetric band matrix to tridiagonal form by orthogonal similarity transformation.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} vect - `'none'`, `'initialize'`, or `'update'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super- (or sub-) diagonals
* @param {Float64Array} AB - band matrix (LDAB x N)
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} d - output array for diagonal elements (length N)
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} e - output array for off-diagonal elements (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {Float64Array} Q - orthogonal matrix (LDQ x N)
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Float64Array} WORK - workspace (length N)
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function dsbtrd( order, vect, uplo, N, kd, AB, LDAB, d, strideD, e, strideE, Q, LDQ, WORK ) {
	let sab1, sab2, sq1, sq2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N - 1, strideE );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( LDAB < ( kd + 1 ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument violates the reference leading-dimension rule (column-major: rejected when `LDAB.LT.KD1`). Value: `%d`.', LDAB ) );
	}
	if ( order === 'row-major' && ( LDAB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument violates the reference leading-dimension rule (row-major: must also cover the N columns). Value: `%d`.', LDAB ) );
	}
	if ( LDQ < max( 1, N ) && ( ( vect === 'initialize' ) || ( vect === 'update' ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument violates the reference leading-dimension rule (rejected when `LDQ.LT.MAX( 1, N ) .AND. WANTQ`). Value: `%d`.', LDQ ) );
	}
	if ( vect !== 'initialize' && vect !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `vect` value. Value: `%s`.', vect ) );
	}
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
		WORK = new Float64Array( minWork );
	}
	return base( vect, uplo, N, kd, AB, sab1, sab2, 0, d, strideD, od, e, strideE, oe, Q, sq1, sq2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default dsbtrd;
