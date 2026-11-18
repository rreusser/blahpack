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
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
const isMatrixTranspose = isTransposeOperation;
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Overwrites a general complex M-by-N matrix C with Q_C, C_Q, QH_C, or C_QH, where Q is a complex unitary matrix from ZHPTRD (packed storage).
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} side - 'left' or 'right'
* @param {string} uplo - 'upper' or 'lower'
* @param {string} trans - 'no-transpose' or 'conjugate-transpose'
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {Complex128Array} AP - packed reflector storage from zhptrd
* @param {integer} strideAP - stride length for `AP`
* @param {Complex128Array} TAU - scalar factors from zhptrd
* @param {integer} strideTAU - stride length for `TAU`
* @param {Complex128Array} C - input/output M-by-N matrix (column-major)
* @param {PositiveInteger} LDC - leading dimension of C
* @param {Complex128Array} WORK - workspace array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} Second argument must be a valid operation side
* @throws {TypeError} Third argument must be a valid matrix triangle
* @throws {TypeError} Fourth argument must be a valid transpose operation
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function zupmtr( order, side, uplo, trans, M, N, AP, strideAP, TAU, strideTAU, C, LDC, WORK ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const oap = stride2offset( ( side === 'left' ) ? ( M * ( M + 1 ) ) / 2 : ( N * ( N + 1 ) ) / 2, strideAP );
	const otau = stride2offset( ( side === 'left' ) ? M - 1 : N - 1, strideTAU );
	const sc1 = ( order === 'column-major' ) ? 1 : LDC;
	const sc2 = ( order === 'column-major' ) ? LDC : 1;
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( LDC < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument violates the reference leading-dimension rule (column-major: rejected when `LDC.LT.MAX( 1, M )`). Value: `%d`.', LDC ) );
	}
	if ( order === 'row-major' && ( LDC < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument violates the reference leading-dimension rule (row-major: must also cover the N columns). Value: `%d`.', LDC ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, ( side === 'left' ) ? N : M );
		WORK = new Complex128Array( minWork );
	}
	return base( side, uplo, trans, M, N, AP, strideAP, oap, TAU, strideTAU, otau, C, sc1, sc2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default zupmtr;
