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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import strided from './strided.js';


// MAIN //

/**
* Applies a complex elementary reflector `H`, defined by the `RZ` factorization, to a complex M-by-N matrix `C`, from either the left or the right.
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {OperationSide} side - `'left'` applies `H` from the left; `'right'` applies `H` from the right
* @param {integer} M - number of rows of `C`
* @param {NonNegativeInteger} N - number of columns of `C`
* @param {NonNegativeInteger} l - number of entries of the vector `v` containing the meaningful part of the reflector
* @param {Complex128Array} v - reflector vector
* @param {integer} strideV - stride for `v` (in complex elements)
* @param {Complex128Array} tau - complex scalar
* @param {Complex128Array} C - matrix, modified in place
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {(Complex128Array|null)} WORK - workspace
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid operation side
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} eleventh argument must be greater than or equal to max(1,N) (row-major) or max(1,M) (column-major)
* @returns {Complex128Array} `C`
*/
function zlarz( order, side, M, N, l, v, strideV, tau, C, LDC, WORK ) {
	let sc1, sc2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	const offsetTau = 0;
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDC < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDC ) );
	}
	if ( order === 'column-major' && LDC < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDC ) );
	}
	if ( M === 0 || N === 0 ) {
		return C;
	}
	if ( order === 'column-major' ) {
		sc1 = 1;
		sc2 = LDC;
	} else {
		sc1 = LDC;
		sc2 = 1;
	}
	const ov = stride2offset( l, strideV );
	const nwork = ( side === 'left' ) ? N : M;
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( nwork );
	}
	strided( side, M, N, l, v, strideV, ov, tau, offsetTau, C, sc1, sc2, 0, WORK, 1, 0 );
	return C;
}


// EXPORTS //

export default zlarz;
