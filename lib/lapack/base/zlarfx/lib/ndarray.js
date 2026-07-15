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

import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies an elementary reflector H to a complex M-by-N matrix C, from either the left or the right.
*
* H is represented in the form:
*
* `H = I - tau * v * v^H`
*
* where tau is a complex scalar and v is a complex vector.
*
* If tau = 0, then H is taken to be the unit matrix.
*
* This version uses inline code if H has order <= 10.
*
* @param {string} side - `'left'` or `'right'`
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {Complex128Array} v - the vector v in the reflector
* @param {integer} strideV - stride for v (in complex elements)
* @param {NonNegativeInteger} offsetV - starting index for v (in complex elements)
* @param {Complex128} tau - the complex scalar tau
* @param {Complex128Array} C - the M-by-N matrix
* @param {integer} strideC1 - stride of the first dimension of C (complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (complex elements)
* @param {NonNegativeInteger} offsetC - starting index for C (in complex elements)
* @param {Complex128Array} WORK - caller-owned workspace, referenced only by the general-order path (H order > 10); length N if side=`'left'`, length M if side=`'right'`
* @param {integer} strideWork - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @throws {TypeError} First argument must be a valid operation side
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function zlarfx( side, M, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	var minWork;
	var order;

	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Quick return for an empty matrix. This MUST precede the WORK-size check so
	// an empty problem does not require a valid workspace buffer.
	if ( M === 0 || N === 0 ) {
		return;
	}
	// Caller owns WORK; assert it is large enough so an undersized buffer is a
	// loud RangeError rather than a silent NaN from an out-of-bounds read. WORK
	// is referenced only by the general-order path (H order > 10); the inline
	// order <= 10 formulas use no workspace.
	order = ( side === 'left' ) ? M : N;
	if ( order > 10 ) {
		minWork = ( side === 'left' ) ? N : M;
		if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	return base( side, M, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlarfx;
