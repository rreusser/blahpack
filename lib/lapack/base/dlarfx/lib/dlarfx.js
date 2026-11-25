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
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies an elementary reflector to a general rectangular matrix, with loop unrolling when the reflector has order ≤ 10.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} side - `'left'`: form H * C `'right'`: form C * H.
* @param {NonNegativeInteger} M - the number of rows of the matrix C.
* @param {NonNegativeInteger} N - the number of columns of the matrix C.
* @param {Float64Array} v - or (N) if `side === 'right'` The vector v in the representation of H.
* @param {integer} strideV - stride length for `v`
* @param {number} tau - the value tau in the representation of H.
* @param {Float64Array} C - on entry, the m by n matrix C. On exit, C is overwritten by the matrix H * C if `side === 'left'`, or C * H if `side === 'right'`.
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {(Float64Array|null)} WORK - caller-provided workspace of at least `N` elements
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )` (row-major)
* @returns {Float64Array} result
*/
function dlarfx( order, side, M, N, v, strideV, tau, C, LDC, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sc1 = ( order === 'column-major' ) ? 1 : LDC;
	const sc2 = ( order === 'column-major' ) ? LDC : 1;
	const ov = stride2offset( ( side === 'left' ) ? M : N, strideV );
	if ( WORK === null || WORK === void 0 ) {
		// Single sanctioned allocation site (base/ndarray never allocate). The
		// general-order path needs length N (side='left') or M (side='right');
		// max(1,M,N) is a safe upper bound covering both.
		WORK = new Float64Array( Math.max( 1, M, N ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDC < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDC ) );
	}
	return base( side, M, N, v, strideV, ov, tau, C, sc1, sc2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default dlarfx;
