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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution to a real system of linear equations and provides error bounds and backward error estimates for the solution.
*
* Column-major LAPACK-style interface.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} trans - 'no-transpose' or 'transpose'
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} AB - original band matrix (LDAB by N)
* @param {PositiveInteger} LDAB - leading dimension of AB
* @param {Float64Array} AFB - factored band matrix (LDAFB by N)
* @param {PositiveInteger} LDAFB - leading dimension of AFB
* @param {Int32Array} IPIV - pivot indices (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {Float64Array} B - right-hand side matrix (LDB by NRHS)
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Float64Array} X - solution matrix (LDX by NRHS)
* @param {PositiveInteger} LDX - leading dimension of X
* @param {Float64Array} FERR - output forward error bounds
* @param {integer} strideFERR - stride length for `FERR`
* @param {Float64Array} BERR - output backward error bounds
* @param {integer} strideBERR - stride length for `BERR`
* @param {Float64Array} WORK - workspace (length >= 3*N)
* @param {Int32Array} IWORK - integer workspace (length >= N)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function dgbrfs( order, trans, N, kl, ku, nrhs, AB, LDAB, AFB, LDAFB, IPIV, strideIPIV, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, IWORK ) { // eslint-disable-line max-len, max-params
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const oipiv = stride2offset( N, strideIPIV );
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
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'column-major' && ( LDAB < kl + ku + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument violates the reference leading-dimension rule (column-major: rejected when `LDAB.LT.KL+KU+1`). Value: `%d`.', LDAB ) );
	}
	if ( order === 'row-major' && ( LDAB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument violates the reference leading-dimension rule (row-major: must also cover the N columns). Value: `%d`.', LDAB ) );
	}
	if ( order === 'column-major' && ( LDAFB < 2 * kl + ku + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument violates the reference leading-dimension rule (column-major: rejected when `LDAFB.LT.2*KL+KU+1`). Value: `%d`.', LDAFB ) );
	}
	if ( order === 'row-major' && ( LDAFB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument violates the reference leading-dimension rule (row-major: must also cover the N columns). Value: `%d`.', LDAFB ) );
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
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 3*N );
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
	}
	return base( trans, N, kl, ku, nrhs, AB, sab1, sab2, 0, AFB, safb1, safb2, 0, IPIV, strideIPIV, oipiv, B, sb1, sb2, 0, X, sx1, sx2, 0, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgbrfs;
