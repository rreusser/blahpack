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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies one step of incremental condition estimation.
*
* @param {('largest-singular-value'|'smallest-singular-value')} job - specifies whether to estimate the largest or smallest singular value (`'largest-singular-value'` or `'smallest-singular-value'`)
* @param {NonNegativeInteger} J - length of `x` and `w`
* @param {Float64Array} x - input vector of length `J`
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {number} sest - estimated singular value of the `j`-by-`j` matrix
* @param {Float64Array} w - input vector of length `J`
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {number} gamma - diagonal element
* @param {Float64Array} sestpr - output (length-1 array): estimated singular value of (j+1) by (j+1) matrix Lhat
* @param {Float64Array} s - output (length-1 array): sine needed in forming xhat
* @param {Float64Array} c - output (length-1 array): cosine needed in forming xhat
* @throws {TypeError} first argument must be one of the following: "largest-singular-value", "smallest-singular-value"
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlaic1 from '@rreusser/blahpack/lapack/base/dlaic1';
*
* var x = new Float64Array( [ 0.6, 0.8, 0.0 ] );
* var w = new Float64Array( [ 1.0, 2.0, 3.0 ] );
* var sestpr = new Float64Array( 1 );
* var s = new Float64Array( 1 );
* var c = new Float64Array( 1 );
*
* dlaic1.ndarray( 'largest-singular-value', 3, x, 1, 0, 5.0, w, 1, 0, 2.0, sestpr, s, c );
* // sestpr[ 0 ] => ~5.5289
* // s[ 0 ] => ~-0.98656
* // c[ 0 ] => ~-0.16338
*/
function dlaic1( job, J, x, strideX, offsetX, sest, w, strideW, offsetW, gamma, sestpr, s, c ) { // eslint-disable-line max-len, max-params
	if ( job !== 'largest-singular-value' && job !== 'smallest-singular-value' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "largest-singular-value", "smallest-singular-value". Value: `%s`.', job ) );
	}
	return base( job, J, x, strideX, offsetX, sest, w, strideW, offsetW, gamma, sestpr, s, c ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaic1;
