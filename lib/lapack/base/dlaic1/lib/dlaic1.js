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
import base from './base.js';


// MAIN //

/**
* Applies one step of incremental condition estimation.
*
* @param {('largest-singular-value'|'smallest-singular-value')} job - specifies whether to estimate the largest or smallest singular value (`'largest-singular-value'` or `'smallest-singular-value'`)
* @param {NonNegativeInteger} J - length of `x` and `w`
* @param {Float64Array} x - input vector of length `J`
* @param {integer} strideX - stride length for `x`
* @param {number} sest - estimated singular value of the `j`-by-`j` matrix
* @param {Float64Array} w - input vector of length `J`
* @param {integer} strideW - stride length for `w`
* @param {number} gamma - diagonal element
* @param {Float64Array} sestpr - output (length-1 array): estimated singular value of (j+1) by (j+1) matrix Lhat
* @param {Float64Array} s - output (length-1 array): sine needed in forming xhat
* @param {Float64Array} c - output (length-1 array): cosine needed in forming xhat
*/
function dlaic1( job, J, x, strideX, sest, w, strideW, gamma, sestpr, s, c ) {
	const ox = stride2offset( J, strideX );
	const ow = stride2offset( J, strideW );
	return base( job, J, x, strideX, ox, sest, w, strideW, ow, gamma, sestpr, s, c ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaic1;
