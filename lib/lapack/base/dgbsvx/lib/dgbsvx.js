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
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a real system A*X = B where A is general band, with equilibration, condition estimation, and error bounds.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} fact - fact
* @param {string} trans - trans
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} kl - kl
* @param {NonNegativeInteger} ku - ku
* @param {NonNegativeInteger} nrhs - nrhs
* @param {Float64Array} AB - AB
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} AFB - AFB
* @param {PositiveInteger} LDAFB - leading dimension of `AFB`
* @param {Int32Array} IPIV - IPIV
* @param {integer} strideIPIV - strideIPIV
* @param {string} equed - equed
* @param {Float64Array} r - r
* @param {integer} strideR - strideR
* @param {Float64Array} c - c
* @param {integer} strideC - strideC
* @param {Float64Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} X - X
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} FERR - FERR
* @param {integer} strideFERR - strideFERR
* @param {Float64Array} BERR - BERR
* @param {integer} strideBERR - strideBERR
* @param {Float64Array} WORK - WORK
* @param {Int32Array} IWORK - IWORK
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Object} result with info, equed, rcond, rpvgrw
*/
function dgbsvx( order, fact, trans, N, kl, ku, nrhs, AB, LDAB, AFB, LDAFB, IPIV, strideIPIV, equed, r, strideR, c, strideC, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, IWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sab1 = ( order === 'column-major' ) ? 1 : LDAB;
	const sab2 = ( order === 'column-major' ) ? LDAB : 1;
	const safb1 = ( order === 'column-major' ) ? 1 : LDAFB;
	const safb2 = ( order === 'column-major' ) ? LDAFB : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	const oipiv = stride2offset( N, strideIPIV );
	const or = stride2offset( N, strideR );
	const oc = stride2offset( N, strideC );
	const oferr = stride2offset( nrhs, strideFERR );
	const oberr = stride2offset( nrhs, strideBERR );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 3*N );
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'row-major' && LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( order === 'column-major' && LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( order === 'row-major' && LDAFB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAFB ) );
	}
	if ( order === 'column-major' && LDAFB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAFB ) );
	}
	if ( order === 'row-major' && LDB < max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' && LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( order === 'row-major' && LDX < max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-second argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDX ) );
	}
	if ( order === 'column-major' && LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-second argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	if ( fact !== 'not-factored' && fact !== 'equilibrate' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `fact` value. Value: `%s`.', fact ) );
	}
	if ( equed !== 'row' && equed !== 'both' && equed !== 'column' ) {
		throw new TypeError( format( 'invalid argument. Fourteenth argument must be a valid `equed` value. Value: `%s`.', equed ) );
	}
	return base( fact, trans, N, kl, ku, nrhs, AB, sab1, sab2, 0, AFB, safb1, safb2, 0, IPIV, strideIPIV, oipiv, equed, r, strideR, or, c, strideC, oc, B, sb1, sb2, 0, X, sx1, sx2, 0, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgbsvx;
