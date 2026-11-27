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
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the 1-norm of a square matrix, using reverse communication for evaluating matrix-vector products.
*
* @param {NonNegativeInteger} N - the order of the matrix.
* @param {Complex128Array} V - on the final return, V = A*W, where EST = norm(V)/norm(W) (W is not returned).
* @param {integer} strideV - stride length for `V`
* @param {Complex128Array} X - on an intermediate return, X should be overwritten by A * X, if KASE=1, A**H * X, if KASE=2, where A**H is the conjugate transpose of A, and ZLACN2 must be re-called with all the other parameters unchanged.
* @param {integer} strideX - stride length for `X`
* @param {Float64Array} EST - on entry with KASE = 1 or 2 and ISAVE(1) = 3, EST should be unchanged from the previous call to ZLACN2. On exit, EST is an estimate (a lower bound) for norm(A).
* @param {Int32Array} KASE - on the initial call to ZLACN2, KASE should be 0.
* @param {Int32Array} ISAVE - iSAVE is used to save variables between calls to ZLACN2 (0-based).
* @param {integer} strideISAVE - stride length for `ISAVE`
* @returns {Int32Array} `ISAVE`
*/
function zlacn2( N, V, strideV, X, strideX, EST, KASE, ISAVE, strideISAVE ) { // eslint-disable-line max-len, max-params

	const ov = stride2offset( N, strideV );
	const ox = stride2offset( N, strideX );
	const oisave = stride2offset( 3, strideISAVE );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, V, strideV, ov, X, strideX, ox, EST, KASE, ISAVE, strideISAVE, oisave );
}


// EXPORTS //

export default zlacn2;
