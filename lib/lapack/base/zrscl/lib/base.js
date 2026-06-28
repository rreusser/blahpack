/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-depth, max-statements */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import zdrscl from '../../zdrscl/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;

// Safe minimum: smallest normalized double-precision number (DLAMCH('S'))
var SAFMIN = 2.2250738585072014e-308;
var SAFMAX = ONE / SAFMIN;

// Overflow threshold (DLAMCH('O'))
var OV = 1.7976931348623157e+308;


// MAIN //

/**
* Multiplies an n-element complex vector by the reciprocal of a complex scalar.
*
* The computation is done without overflow or underflow as long as the final
* result `x/a` does not overflow or underflow.
*
* @private
* @param {NonNegativeInteger} N - number of elements
* @param {Complex128} a - complex scalar divisor
* @param {Complex128Array} x - input/output complex vector
* @param {integer} strideX - stride for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @returns {Complex128Array} input array
*/
function zrscl( N, a, x, strideX, offsetX ) {
	var absi;
	var absr;
	var ar;
	var ai;
	var ur;
	var ui;

	if ( N <= 0 ) {
		return x;
	}

	// Extract real and imaginary parts of the scalar a
	ar = real( a );
	ai = imag( a );
	absr = Math.abs( ar );
	absi = Math.abs( ai );

	if ( ai === ZERO ) {
		// If alpha is real, delegate to ZDRSCL
		zdrscl( N, ar, x, strideX, offsetX );
	} else if ( ar === ZERO ) {
		// If alpha has a zero real part, follow the same overflow/underflow
		// Rules as if alpha were real, but multiply by -i/|ai|
		if ( absi > SAFMAX ) {
			zdscal( N, SAFMIN, x, strideX, offsetX );
			zscal( N, new Complex128( ZERO, -SAFMAX / ai ), x, strideX, offsetX ); // eslint-disable-line max-len
		} else if ( absi < SAFMIN ) {
			zscal( N, new Complex128( ZERO, -SAFMIN / ai ), x, strideX, offsetX ); // eslint-disable-line max-len
			zdscal( N, SAFMAX, x, strideX, offsetX );
		} else {
			zscal( N, new Complex128( ZERO, -ONE / ai ), x, strideX, offsetX );
		}
	} else {
		// General complex case.
		// The following numbers are the inverse of the real and imaginary
		// Parts of 1/alpha. NaNs are only possible if either AR or AI is NaN,
		// Or both AR and AI are infinite.
		ur = ar + ( ai * ( ai / ar ) );
		ui = ai + ( ar * ( ar / ai ) );

		if ( Math.abs( ur ) < SAFMIN || Math.abs( ui ) < SAFMIN ) {
			// Both AR and AI are very small
			zscal( N, new Complex128( SAFMIN / ur, -SAFMIN / ui ), x, strideX, offsetX ); // eslint-disable-line max-len
			zdscal( N, SAFMAX, x, strideX, offsetX );
		} else if ( Math.abs( ur ) > SAFMAX || Math.abs( ui ) > SAFMAX ) {
			if ( absr > OV || absi > OV ) {
				// NB: This branch requires AR or AI > OV (Infinity).
				// Both a.real and a.imag are Inf. No need for scaling.
				zscal( N, new Complex128( ONE / ur, -ONE / ui ), x, strideX, offsetX ); // eslint-disable-line max-len
			} else {
				zdscal( N, SAFMIN, x, strideX, offsetX );
				if ( Math.abs( ur ) > OV || Math.abs( ui ) > OV ) {
					// Infs were generated. We do proper scaling to avoid them.
					if ( absr >= absi ) {
						ur = ( SAFMIN * ar ) + ( SAFMIN * ( ai * ( ai / ar ) ) ); // eslint-disable-line max-len
						ui = ( SAFMIN * ai ) + ( ar * ( ( SAFMIN * ar ) / ai ) ); // eslint-disable-line max-len
					} else {
						ur = ( SAFMIN * ar ) + ( ai * ( ( SAFMIN * ai ) / ar ) ); // eslint-disable-line max-len
						ui = ( SAFMIN * ai ) + ( SAFMIN * ( ar * ( ar / ai ) ) ); // eslint-disable-line max-len
					}
					zscal( N, new Complex128( ONE / ur, -ONE / ui ), x, strideX, offsetX ); // eslint-disable-line max-len
				} else {
					zscal( N, new Complex128( SAFMAX / ur, -SAFMAX / ui ), x, strideX, offsetX ); // eslint-disable-line max-len
				}
			}
		} else {
			zscal( N, new Complex128( ONE / ur, -ONE / ui ), x, strideX, offsetX ); // eslint-disable-line max-len
		}
	}
	return x;
}


// EXPORTS //

export default zrscl;
