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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a sequence of real plane rotations to a real general rectangular matrix.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {OperationSide} side - `'left'` or `'right'`
* @param {('variable'|'top'|'bottom')} pivot - `'variable'`, `'top'`, or `'bottom'`
* @param {('forward'|'backward')} direct - `'forward'` or `'backward'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Float64Array} c - input array
* @param {integer} strideC - `c` stride length
* @param {Float64Array} s - input array
* @param {integer} strideS - `s` stride length
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid operation side
* @throws {TypeError} third argument must be one of the following: "bottom", "top", "variable"
* @throws {TypeError} fourth argument must be one of the following: "backward", "forward"
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} twelfth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} twelfth argument must be greater than or equal to `max( 1, N )` (row-major)
* @returns {Float64Array} output array
*/
function dlasr( order, side, pivot, direct, M, N, c, strideC, s, strideS, A, LDA ) {
	let sa1, sa2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( pivot !== 'bottom' && pivot !== 'top' && pivot !== 'variable' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "bottom", "top", "variable". Value: `%s`.', pivot ) );
	}
	if ( direct !== 'backward' && direct !== 'forward' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be one of the following: "backward", "forward". Value: `%s`.', direct ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	const oc = stride2offset( M - 1, strideC );
	const os = stride2offset( M - 1, strideS );
	return base( side, pivot, direct, M, N, c, strideC, oc, s, strideS, os, A, sa1, sa2, 0 );
}


// EXPORTS //

export default dlasr;
