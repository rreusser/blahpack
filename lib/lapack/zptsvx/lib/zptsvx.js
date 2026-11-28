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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import strided from './strided.js';


// MAIN //

/**
* Solves a complex Hermitian positive definite tridiagonal system A*X = B, and provides an estimate of the condition number and error bounds on the solution.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('not-factored'|'factored')} fact - `'not-factored'` or `'factored'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} d - diagonal elements of A (length N, real)
* @param {integer} strideD - stride length for `d`
* @param {Complex128Array} e - off-diagonal elements of A (length N-1, complex)
* @param {integer} strideE - stride length for `e`
* @param {Float64Array} DF - factored diagonal (length N)
* @param {integer} strideDF - stride length for `DF`
* @param {Complex128Array} EF - factored off-diagonal (length N-1, complex)
* @param {integer} strideEF - stride length for `EF`
* @param {Complex128Array} B - right-hand side matrix (complex)
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Complex128Array} X - solution matrix (complex, output)
* @param {PositiveInteger} LDX - leading dimension of X
* @param {Float64Array} rcond - single-element array for reciprocal condition number (output)
* @param {Float64Array} FERR - forward error bounds (length NRHS, output)
* @param {integer} strideFERR - stride length for `FERR`
* @param {Float64Array} BERR - backward error bounds (length NRHS, output)
* @param {integer} strideBERR - stride length for `BERR`
* @param {(Complex128Array|null)} WORK - complex workspace array (length at least N)
* @param {(Float64Array|null)} RWORK - real workspace array (length at least N)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "factored", "not-factored"
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fourteenth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} fourteenth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {RangeError} sixteenth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} sixteenth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info - 0 if successful, k>0 if D(k)<=0, N+1 if rcond < machine epsilon
*/
function zptsvx( order, fact, N, nrhs, d, strideD, e, strideE, DF, strideDF, EF, strideEF, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, RWORK ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( fact !== 'factored' && fact !== 'not-factored' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "factored", "not-factored". Value: `%s`.', fact ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDB ) );
	}
	if ( order === 'column-major' && ( LDX < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDX ) );
	}
	if ( order === 'row-major' && ( LDX < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDX ) );
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
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, N );
		WORK = new Complex128Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
	}
	return strided( fact, N, nrhs, d, strideD, od, e, strideE, oe, DF, strideDF, odf, EF, strideEF, oef, B, sb1, sb2, 0, X, sx1, sx2, 0, rcond, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zptsvx;
