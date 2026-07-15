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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies an elementary reflector H to a complex M-by-N matrix C.
*
* @param {string} side - `'left'` or `'right'`
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {Complex128Array} v - the vector v in the reflector
* @param {integer} strideV - stride for v (in complex elements)
* @param {Complex128} tau - the complex scalar tau
* @param {Complex128Array} C - the M-by-N matrix
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {Complex128Array} [WORK] - caller-owned workspace, referenced only by the general-order path (H order > 10); length N if side=`'left'`, length M if side=`'right'`. If `null`, a workspace is allocated internally.
* @param {integer} strideWork - stride for WORK (in complex elements)
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function zlarfx( side, M, N, v, strideV, tau, C, LDC, WORK, strideWork ) { // eslint-disable-line max-len, max-params
	var owork;
	var sc1;
	var sc2;
	var ov;

	sc1 = 1;
	sc2 = LDC;
	ov = stride2offset( N, strideV );
	if ( WORK === null || WORK === void 0 ) {
		// Single sanctioned allocation site (base/ndarray never allocate). The
		// general-order path needs length N (side='left') or M (side='right');
		// max(1,M,N) is a safe upper bound covering both.
		WORK = new Complex128Array( max( 1, M, N ) );
		strideWork = 1;
	}
	owork = stride2offset( N, strideWork );
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDC < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,M). Value: `%d`.', LDC ) );
	}
	return base( side, M, N, v, strideV, ov, tau, C, sc1, sc2, 0, WORK, strideWork, owork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlarfx;
