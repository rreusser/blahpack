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
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ndarray from './ndarray.js';


// MAIN //

/**
* Uses the LU factorization to compute the solution to a complex system of.
* linear equations A_X = B, A^T_X = B, or A^H_X = B, where A is a
* tridiagonal matrix of order N and X and B are N-by-NRHS matrices.
*
* Error bounds on the solution and a condition estimate are also provided.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('not-factored'|'factored')} fact - 'not-factored' or 'factored'
* @param {TransposeOperation} trans - 'no-transpose', 'transpose', or 'conjugate-transpose'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right hand sides
* @param {Complex128Array} DL - sub-diagonal of A (length N-1)
* @param {integer} strideDL - stride for DL (in complex elements)
* @param {Complex128Array} d - diagonal of A (length N)
* @param {integer} strideD - stride for d (in complex elements)
* @param {Complex128Array} DU - super-diagonal of A (length N-1)
* @param {integer} strideDU - stride for DU (in complex elements)
* @param {Complex128Array} DLF - factored sub-diagonal (length N-1)
* @param {integer} strideDLF - stride for DLF (in complex elements)
* @param {Complex128Array} DF - factored diagonal (length N)
* @param {integer} strideDF - stride for DF (in complex elements)
* @param {Complex128Array} DUF - factored super-diagonal (length N-1)
* @param {integer} strideDUF - stride for DUF (in complex elements)
* @param {Complex128Array} DU2 - second superdiagonal fill-in (length N-2)
* @param {integer} strideDU2 - stride for DU2 (in complex elements)
* @param {Int32Array} IPIV - pivot indices (length N)
* @param {integer} strideIPIV - stride for IPIV
* @param {Complex128Array} B - right hand side matrix
* @param {PositiveInteger} LDB - leading dimension of B (in complex elements)
* @param {Complex128Array} X - solution matrix (output)
* @param {PositiveInteger} LDX - leading dimension of X (in complex elements)
* @param {Float64Array} rcond - single-element array for reciprocal condition number
* @param {Float64Array} FERR - forward error bounds (output)
* @param {integer} strideFERR - stride for FERR
* @param {Float64Array} BERR - backward error bounds (output)
* @param {integer} strideBERR - stride for BERR
* @param {(Complex128Array|null)} WORK - workspace array
* @param {(Float64Array|null)} RWORK - real workspace array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "factored", "not-factored"
* @throws {TypeError} third argument must be a valid transpose operation
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} twenty-third argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} twenty-third argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {RangeError} twenty-fifth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} twenty-fifth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @returns {integer} info
*/
function zgtsvx( order, fact, trans, N, nrhs, DL, strideDL, d, strideD, DU, strideDU, DLF, strideDLF, DF, strideDF, DUF, strideDUF, DU2, strideDU2, IPIV, strideIPIV, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, RWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( fact !== 'factored' && fact !== 'not-factored' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "factored", "not-factored". Value: `%s`.', fact ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-third argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-third argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDB ) );
	}
	if ( order === 'column-major' && ( LDX < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDX ) );
	}
	if ( order === 'row-major' && ( LDX < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDX ) );
	}
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	const odl = stride2offset( N - 1, strideDL );
	const od = stride2offset( N, strideD );
	const odu = stride2offset( N - 1, strideDU );
	const odlf = stride2offset( N - 1, strideDLF );
	const odf = stride2offset( N, strideDF );
	const oduf = stride2offset( N - 1, strideDUF );
	const odu2 = stride2offset( N - 2, strideDU2 );
	const oipiv = stride2offset( N, strideIPIV );
	const oferr = stride2offset( nrhs, strideFERR );
	const oberr = stride2offset( nrhs, strideBERR );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 2 * N );
		WORK = new Complex128Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
	}
	return ndarray( fact, trans, N, nrhs, DL, strideDL, odl, d, strideD, od, DU, strideDU, odu, DLF, strideDLF, odlf, DF, strideDF, odf, DUF, strideDUF, oduf, DU2, strideDU2, odu2, IPIV, strideIPIV, oipiv, B, sb1, sb2, 0, X, sx1, sx2, 0, rcond, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgtsvx;
