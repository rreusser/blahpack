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

import zdscal from '../../../../blas/base/zdscal/lib/base.js';


// VARIABLES //

// Safe minimum: smallest normalized double-precision number
const SMLNUM = 2.2250738585072014e-308; // DLAMCH('S')
const BIGNUM = 1.0 / SMLNUM;


// MAIN //

/**
* Scales a complex vector by the reciprocal of a real scalar, performing the.
* scaling carefully to avoid overflow/underflow.
*
* Computes x <- x / sa by iteratively multiplying by safe scale factors.
*
* @private
* @param {NonNegativeInteger} N - number of elements
* @param {number} sa - real scalar divisor
* @param {Complex128Array} x - input/output complex vector
* @param {integer} strideX - stride for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @returns {Complex128Array} input array
*/
function zdrscl( N, sa, x, strideX, offsetX ) {
	let cden1, cnum1, cden, cnum, done, mul;

	if ( N <= 0 ) {
		return x;
	}

	// Initialize: we want to compute x = x * (1/sa)
	cden = sa;
	cnum = 1.0;

	while ( true ) {
		cden1 = cden * SMLNUM;
		cnum1 = cnum / BIGNUM;
		if ( Math.abs( cden1 ) > Math.abs( cnum ) && cnum !== 0.0 ) {
			// Pre-multiply x by SMLNUM if CDEN is large compared to CNUM
			mul = SMLNUM;
			done = false;
			cden = cden1;
		} else if ( Math.abs( cnum1 ) > Math.abs( cden ) ) {
			// Pre-multiply x by BIGNUM if CNUM is large compared to CDEN
			mul = BIGNUM;
			done = false;
			cnum = cnum1;
		} else {
			// Multiply x by CNUM / CDEN
			mul = cnum / cden;
			done = true;
		}
		zdscal( N, mul, x, strideX, offsetX );
		if ( done ) {
			break;
		}
	}
	return x;
}


// EXPORTS //

export default zdrscl;
