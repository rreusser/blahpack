/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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

import dnrm2 from './../../../../blas/base/dnrm2/lib/base.js';
import dscal from './../../../../blas/base/dscal/lib/base.js';
import dlamch from './../../dlamch/lib/base.js';
import dlapy2 from './../../dlapy2/lib/base.js';


// VARIABLES //

// Hoist machine constants to module scope so we never pay for `dlamch` lookups at call time:
var EPS = dlamch( 'precision' );
var SMLNUM = dlamch( 'safe-minimum' ) / dlamch( 'epsilon' );
var BIGNUM = 1.0 / SMLNUM;


// MAIN //

/**
* Generates a real elementary reflector `H` of order `N` with non-negative `beta`, such that.
*
* ```text
* H * ( alpha ) = ( beta ),    H**T * H = I,    beta >= 0.
*     (   x   )   (  0   )
* ```
*
* where `H = I - tau*( 1; v )*( 1 v**T )`. This is a variant of `dlarfg` used by `dgeqr2p`/`dgeqrfp` whenever the diagonal of the factorization must be non-negative.
*
* @private
* @param {NonNegativeInteger} N - order of the reflector
* @param {Float64Array} alpha - on entry, the scalar `alpha`; on exit, the scalar `beta` (non-negative)
* @param {NonNegativeInteger} offsetAlpha - index into `alpha`
* @param {Float64Array} x - vector of length `1 + (N-2)*abs(strideX)`; on exit, overwritten with `v`
* @param {integer} strideX - stride for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} tau - output scalar; on exit, element `offsetTau` is overwritten with `tau`
* @param {NonNegativeInteger} offsetTau - index into `tau`
*/
function dlarfgp( N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau ) {
	var savealpha;
	var xnorm;
	var beta;
	var sign;
	var knt;
	var j;

	if ( N <= 0 ) {
		tau[ offsetTau ] = 0.0;
		return;
	}

	xnorm = dnrm2( N - 1, x, strideX, offsetX );

	if ( xnorm <= EPS * Math.abs( alpha[ offsetAlpha ] ) ) {
		// `H = I` branch: x is (relatively) zero. The sign of alpha determines whether we must flip it to enforce `beta >= 0`:
		if ( alpha[ offsetAlpha ] >= 0.0 ) {
			tau[ offsetTau ] = 0.0;
		} else {
			tau[ offsetTau ] = 2.0;
			for ( j = 0; j < N - 1; j++ ) {
				x[ offsetX + ( j * strideX ) ] = 0.0;
			}
			alpha[ offsetAlpha ] = -alpha[ offsetAlpha ];
		}
		return;
	}

	// General case. Fortran `SIGN(|dlapy2|, alpha)`: magnitude with alpha's sign. Unlike `dlarfg`, the sign is NOT negated, so `alpha + beta` stays large in magnitude (later negated to yield non-negative beta).
	sign = ( alpha[ offsetAlpha ] >= 0.0 ) ? 1.0 : -1.0;
	beta = sign * dlapy2( alpha[ offsetAlpha ], xnorm );
	knt = 0;
	if ( Math.abs( beta ) < SMLNUM ) {
		// `xnorm` and `beta` may be inaccurate near underflow; rescale `x` and recompute:
		do {
			knt += 1;
			dscal( N - 1, BIGNUM, x, strideX, offsetX );
			beta *= BIGNUM;
			alpha[ offsetAlpha ] *= BIGNUM;
		} while ( Math.abs( beta ) < SMLNUM && knt < 20 );

		// New `beta` is now at most 1, at least `SMLNUM`:
		xnorm = dnrm2( N - 1, x, strideX, offsetX );
		sign = ( alpha[ offsetAlpha ] >= 0.0 ) ? 1.0 : -1.0;
		beta = sign * dlapy2( alpha[ offsetAlpha ], xnorm );
	}
	savealpha = alpha[ offsetAlpha ];
	alpha[ offsetAlpha ] += beta;
	if ( beta < 0.0 ) {
		beta = -beta;
		tau[ offsetTau ] = -alpha[ offsetAlpha ] / beta;
	} else {
		// `beta >= 0`: avoid cancellation in `alpha + beta` by using the algebraic identity `(alpha-beta) = -xnorm^2 / (alpha+beta)` so that `v = x / (alpha-beta)` is well defined.
		alpha[ offsetAlpha ] = xnorm * ( xnorm / alpha[ offsetAlpha ] );
		tau[ offsetTau ] = alpha[ offsetAlpha ] / beta;
		alpha[ offsetAlpha ] = -alpha[ offsetAlpha ];
	}

	// NOTE: the following denormal-tau flush branch is effectively unreachable in IEEE 754 double precision. Entering the general branch requires `xnorm > EPS*|alpha|`, so `tau >= xnorm^2/alpha^2 >= EPS^2 ~ 1.2e-32`, which is many orders of magnitude above `SMLNUM ~ 4.5e-292`. The branch is kept for strict faithfulness to the LAPACK reference and as a safety net under potential future compiler reorderings.
	if ( Math.abs( tau[ offsetTau ] ) <= SMLNUM ) {
		// When the computed `tau` is denormalized, relative accuracy is lost; flush `tau` to zero and recover a valid reflector using `savealpha` instead:
		if ( savealpha >= 0.0 ) {
			tau[ offsetTau ] = 0.0;
		} else {
			tau[ offsetTau ] = 2.0;
			for ( j = 0; j < N - 1; j++ ) {
				x[ offsetX + ( j * strideX ) ] = 0.0;
			}
			beta = -savealpha;
		}
	} else {
		// General case: scale `v` in-place so that `v[0] = 1` implicitly and the remaining entries become `x / (alpha - beta)`:
		dscal( N - 1, 1.0 / alpha[ offsetAlpha ], x, strideX, offsetX );
	}

	// Undo the earlier rescaling of `beta` to restore its true magnitude. A subnormal `beta` may lose relative accuracy here, but that is acceptable:
	for ( j = 0; j < knt; j++ ) {
		beta *= SMLNUM;
	}
	alpha[ offsetAlpha ] = beta;
}


// EXPORTS //

export default dlarfgp;
