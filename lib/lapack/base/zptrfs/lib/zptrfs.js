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
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} uplo - uplo
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} nrhs - nrhs
* @param {Float64Array} d - d
* @param {integer} strideD - strideD
* @param {Complex128Array} e - e
* @param {integer} strideE - strideE
* @param {Float64Array} DF - DF
* @param {integer} strideDF - strideDF
* @param {Complex128Array} EF - EF
* @param {integer} strideEF - strideEF
* @param {Complex128Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} X - X
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} FERR - FERR
* @param {integer} strideFERR - strideFERR
* @param {Float64Array} BERR - BERR
* @param {integer} strideBERR - strideBERR
* @param {Complex128Array} WORK - WORK
* @param {Float64Array} RWORK - RWORK
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zptrfs( order, uplo, N, nrhs, d, strideD, e, strideE, DF, strideDF, EF, strideEF, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, RWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N, strideE );
	const odf = stride2offset( N, strideDF );
	const oef = stride2offset( N, strideEF );
	const oferr = stride2offset( N, strideFERR );
	const oberr = stride2offset( N, strideBERR );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, N );
		WORK = new Complex128Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'row-major' && LDB < max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' && LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( order === 'row-major' && LDX < max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDX ) );
	}
	if ( order === 'column-major' && LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	return base( uplo, N, nrhs, d, strideD, od, e, strideE, oe, DF, strideDF, odf, EF, strideEF, oef, B, sb1, sb2, 0, X, sx1, sx2, 0, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zptrfs;
