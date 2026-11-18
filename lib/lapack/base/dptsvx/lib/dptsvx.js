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
import base from './base.js';


// MAIN //

/**
* Solves a real symmetric positive definite tridiagonal system A_X = B, and provides an estimate of the condition number and error bounds on the solution.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} fact - `'not-factored'` or `'factored'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} d - diagonal elements of A (length N)
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} e - off-diagonal elements of A (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {Float64Array} DF - factored diagonal (length N)
* @param {integer} strideDF - stride length for `DF`
* @param {Float64Array} EF - factored off-diagonal (length N-1)
* @param {integer} strideEF - stride length for `EF`
* @param {Float64Array} B - right-hand side matrix
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Float64Array} X - solution matrix (output)
* @param {PositiveInteger} LDX - leading dimension of X
* @param {Float64Array} rcond - single-element array for reciprocal condition number (output)
* @param {Float64Array} FERR - forward error bounds (length NRHS, output)
* @param {integer} strideFERR - stride length for `FERR`
* @param {Float64Array} BERR - backward error bounds (length NRHS, output)
* @param {integer} strideBERR - stride length for `BERR`
* @param {Float64Array} WORK - workspace array (length at least 2*N)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, k>0 if D(k)<=0, N+1 if rcond < machine epsilon
*/
function dptsvx( order, fact, N, nrhs, d, strideD, e, strideE, DF, strideDF, EF, strideEF, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N - 1, strideE );
	const odf = stride2offset( N, strideDF );
	const oef = stride2offset( N - 1, strideEF );
	const oferr = stride2offset( nrhs, strideFERR );
	const oberr = stride2offset( nrhs, strideBERR );
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument violates the reference leading-dimension rule (column-major: rejected when `LDB.LT.MAX( 1, N )`). Value: `%d`.', LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument violates the reference leading-dimension rule (row-major: must also cover the NRHS columns). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' && ( LDX < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument violates the reference leading-dimension rule (column-major: rejected when `LDX.LT.MAX( 1, N )`). Value: `%d`.', LDX ) );
	}
	if ( order === 'row-major' && ( LDX < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument violates the reference leading-dimension rule (row-major: must also cover the NRHS columns). Value: `%d`.', LDX ) );
	}
	if ( fact !== 'not-factored' && fact !== 'factored' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `fact` value. Value: `%s`.', fact ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 2 * N );
		WORK = new Float64Array( minWork );
	}
	return base( fact, N, nrhs, d, strideD, od, e, strideE, oe, DF, strideDF, odf, EF, strideEF, oef, B, sb1, sb2, 0, X, sx1, sx2, 0, rcond, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dptsvx;
