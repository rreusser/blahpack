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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} fact - fact
* @param {string} trans - trans
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} nrhs - nrhs
* @param {Float64Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} AF - AF
* @param {PositiveInteger} LDAF - leading dimension of `AF`
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
* @param {Float64Array} rcond - output (length-1 array): the estimate of the reciprocal condition number of the matrix A after equilibration (if done)
* @param {Float64Array} FERR - FERR
* @param {integer} strideFERR - strideFERR
* @param {Float64Array} BERR - BERR
* @param {integer} strideBERR - strideBERR
* @param {Float64Array|null} [WORK=null] - workspace array (length >= max(1, 4*N)); auto-allocated if null
* @param {Int32Array|null} [IWORK=null] - integer workspace array (length >= N); auto-allocated if null
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Object} result with `info`, `equed`, `rpvgrw`
*/
function dgesvx( order, fact, trans, N, nrhs, A, LDA, AF, LDAF, IPIV, strideIPIV, equed, r, strideR, c, strideC, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, IWORK ) {

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const saf1 = ( order === 'column-major' ) ? 1 : LDAF;
	const saf2 = ( order === 'column-major' ) ? LDAF : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	const oipiv = stride2offset( N, strideIPIV );
	const or = stride2offset( N, strideR );
	const oc = stride2offset( N, strideC );
	const oferr = stride2offset( nrhs, strideFERR );
	const oberr = stride2offset( nrhs, strideBERR );
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument violates the reference leading-dimension rule (rejected when `LDA.LT.MAX( 1, N )`). Value: `%d`.', LDA ) );
	}
	if ( LDAF < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument violates the reference leading-dimension rule (rejected when `LDAF.LT.MAX( 1, N )`). Value: `%d`.', LDAF ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument violates the reference leading-dimension rule (column-major: rejected when `LDB.LT.MAX( 1, N )`). Value: `%d`.', LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument violates the reference leading-dimension rule (row-major: must also cover the NRHS columns). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' && ( LDX < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument violates the reference leading-dimension rule (column-major: rejected when `LDX.LT.MAX( 1, N )`). Value: `%d`.', LDX ) );
	}
	if ( order === 'row-major' && ( LDX < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument violates the reference leading-dimension rule (row-major: must also cover the NRHS columns). Value: `%d`.', LDX ) );
	}
	if ( fact !== 'not-factored' && fact !== 'equilibrate' && fact !== 'factored' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `fact` value. Value: `%s`.', fact ) );
	}
	if ( equed !== 'none' && equed !== 'row' && equed !== 'column' && equed !== 'both' ) {
		throw new TypeError( format( 'invalid argument. Twelfth argument must be a valid `equed` value. Value: `%s`.', equed ) );
	}
	if ( !WORK ) {
		WORK = new Float64Array( Math.max( 1, 4 * N ) );
	}
	if ( !IWORK ) {
		IWORK = new Int32Array( N );
	}
	if ( WORK === null || WORK === void 0 ) {
		let minWork;
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
	}
	return base( fact, trans, N, nrhs, A, sa1, sa2, 0, AF, saf1, saf2, 0, IPIV, strideIPIV, oipiv, equed, r, strideR, or, c, strideC, oc, B, sb1, sb2, 0, X, sx1, sx2, 0, rcond, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgesvx;
