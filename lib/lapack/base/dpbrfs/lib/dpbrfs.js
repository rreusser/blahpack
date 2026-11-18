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
* Improves the computed solution to a system `A * X = B` where `A` is symmetric positive definite band, and provides error bounds.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} uplo - specifies whether 'upper' or 'lower' triangle is stored
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} kd - number of superdiagonals (or subdiagonals) of A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} AB - original symmetric band matrix in band storage
* @param {PositiveInteger} LDAB - leading dimension of AB
* @param {Float64Array} AFB - Cholesky-factored band matrix (from dpbtrf)
* @param {PositiveInteger} LDAFB - leading dimension of AFB
* @param {Float64Array} B - right-hand side matrix (column-major)
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Float64Array} X - solution matrix (improved on exit)
* @param {PositiveInteger} LDX - leading dimension of X
* @param {Float64Array} FERR - output forward error bounds (length nrhs)
* @param {integer} strideFERR - stride length for `FERR`
* @param {Float64Array} BERR - output backward error bounds (length nrhs)
* @param {integer} strideBERR - stride length for `BERR`
* @param {Float64Array} WORK - workspace array (length >= 3*N)
* @param {Int32Array} IWORK - integer workspace array (length >= N)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function dpbrfs( order, uplo, N, kd, nrhs, AB, LDAB, AFB, LDAFB, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, IWORK ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const oferr = stride2offset( nrhs, strideFERR );
	const oberr = stride2offset( nrhs, strideBERR );
	const sab1 = ( order === 'column-major' ) ? 1 : LDAB;
	const sab2 = ( order === 'column-major' ) ? LDAB : 1;
	const safb1 = ( order === 'column-major' ) ? 1 : LDAFB;
	const safb2 = ( order === 'column-major' ) ? LDAFB : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'row-major' && LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( order === 'column-major' && LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( order === 'row-major' && LDAFB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAFB ) );
	}
	if ( order === 'column-major' && LDAFB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAFB ) );
	}
	if ( order === 'row-major' && LDB < max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' && LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( order === 'row-major' && LDX < max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDX ) );
	}
	if ( order === 'column-major' && LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 3 * N );
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
	}
	return base( uplo, N, kd, nrhs, AB, sab1, sab2, 0, AFB, safb1, safb2, 0, B, sb1, sb2, 0, X, sx1, sx2, 0, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dpbrfs;
