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

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlartgp from './../../dlartgp/lib/base.js';


// VARIABLES //

// `THRESH = DLAMCH('E')` — machine epsilon in LAPACK convention for IEEE 754 double precision.
var THRESH = 2.220446049250313e-16;

// Scratch output buffer for the internal dlartgp call; reused across calls to avoid per-invocation allocation.
var SCRATCH = new Float64Array( 3 );


// MAIN //

/**
* Generates a plane rotation designed to introduce a bulge in implicit QR iteration for the bidiagonal SVD problem.
*
* ## Notes
*
* -   Computes `cs` and `sn` defining a plane rotation satisfying
*
*     ```text
*     [  cs  sn ]   [ x^2 - sigma ]   [ r ]
*     [ -sn  cs ] . [    x * y    ] = [ 0 ]    with r >= 0.
*     ```
*
* -   If `x^2 - sigma` and `x * y` are both zero, the rotation is by `PI/2`.
*
* @private
* @param {number} x - the `(1,1)` entry of an upper bidiagonal matrix
* @param {number} y - the `(1,2)` entry of an upper bidiagonal matrix
* @param {number} sigma - shift
* @param {Float64Array} out - output array; on return `out[0]=cs`, `out[1]=sn`
* @returns {Float64Array} `out`
*/
function dlartgs( x, y, sigma, out ) {
	var s;
	var w;
	var z;

	// Compute the first column of `B^T * B - sigma^2 * I`, up to a scale factor.
	if (
		( sigma === 0.0 && Math.abs( x ) < THRESH ) ||
		( Math.abs( x ) === sigma && y === 0.0 )
	) {
		z = 0.0;
		w = 0.0;
	} else if ( sigma === 0.0 ) {
		if ( x >= 0.0 ) {
			z = x;
			w = y;
		} else {
			z = -x;
			w = -y;
		}
	} else if ( Math.abs( x ) < THRESH ) {
		z = -sigma * sigma;
		w = 0.0;
	} else {
		s = ( x >= 0.0 ) ? 1.0 : -1.0;
		z = s * ( Math.abs( x ) - sigma ) * ( s + ( sigma / x ) );
		w = s * y;
	}

	// Generate the rotation. The Fortran code calls `DLARTGP(W, Z, SN, CS, R)` with the argument order deliberately swapped: reordering ensures that if `z = 0` then the resulting rotation is by PI/2. In that Fortran call `DLARTGP(f=W, g=Z, cs=SN, sn=CS, r=R)`, dlartgp's cs slot receives the DLARTGS output `SN` and dlartgp's sn slot receives the DLARTGS output `CS`. Our dlartgp uses `out[0]=cs`, `out[1]=sn`, so `out[0]` (dlartgs cs) = `SCRATCH[1]` (dlartgp sn) and `out[1]` (dlartgs sn) = `SCRATCH[0]` (dlartgp cs).
	dlartgp( w, z, SCRATCH );
	out[ 0 ] = SCRATCH[ 1 ];
	out[ 1 ] = SCRATCH[ 0 ];
	return out;
}


// EXPORTS //

export default dlartgs;
