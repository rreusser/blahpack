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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dznrm2 from '../../../../blas/base/dznrm2/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import dlapy2 from '../../dlapy2/lib/base.js';
import dlapy3 from '../../dlapy3/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

// Module-level scratch arrays to avoid per-call allocation
var scratch = new Float64Array( 4 );
var scratchCA = new Complex128Array( 1 );
var scratchCAv = reinterpret( scratchCA, 0 );


// MAIN //

/**
* Generate a complex elementary reflector H of order N, with BETA real and non-negative.
*
* `H^H*( alpha ) = ( beta )`,   `H^H*H = I`.
* (   x   )   (   0  )
*
* where alpha and beta are scalars, with beta real and non-negative, and x
* is an (N-1)-element complex vector.
*
* H is represented in the form
*
* `H = I - tau*( 1 )*( 1 v^H )`
* ( v )
*
* @private
* @param {NonNegativeInteger} N - order of the reflector
* @param {Complex128Array} alpha - complex scalar, overwritten with beta
* @param {NonNegativeInteger} offsetAlpha - starting index for alpha (in complex elements)
* @param {Complex128Array} x - complex vector, overwritten with v
* @param {integer} strideX - stride for x (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
* @param {Complex128Array} tau - output complex scalar
* @param {NonNegativeInteger} offsetTau - starting index for tau (in complex elements)
*/
function zlarfgp( N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau ) {
	var savealphaR;
	var savealphaI;
	var bignum;
	var smlnum;
	var alphr;
	var alphi;
	var xnorm;
	var beta;
	var tauv;
	var knt;
	var eps;
	var av;
	var xv;
	var oA;
	var oT;
	var ix;
	var sx;
	var j;

	tauv = reinterpret( tau, 0 );
	oT = offsetTau * 2;

	if ( N <= 0 ) {
		tauv[ oT ] = 0.0;
		tauv[ oT + 1 ] = 0.0;
		return;
	}

	av = reinterpret( alpha, 0 );
	oA = offsetAlpha * 2;
	xv = reinterpret( x, 0 );
	sx = strideX * 2;

	eps = dlamch( 'precision' );
	xnorm = dznrm2( N - 1, x, strideX, offsetX );
	alphr = av[ oA ];
	alphi = av[ oA + 1 ];

	if ( xnorm <= eps * cmplx.absAt( av, oA ) ) {
		// Scale of x is small compared to alpha; H is (nearly) the identity
		// Apart from possibly flipping alpha's sign to make beta non-negative.
		if ( alphi === 0.0 ) {
			if ( alphr >= 0.0 ) {
				// H = I
				tauv[ oT ] = 0.0;
				tauv[ oT + 1 ] = 0.0;
			} else {
				// H = -I: tau = 2, x = 0, alpha = -alpha
				tauv[ oT ] = 2.0;
				tauv[ oT + 1 ] = 0.0;
				ix = offsetX * 2;
				for ( j = 0; j < N - 1; j++ ) {
					xv[ ix ] = 0.0;
					xv[ ix + 1 ] = 0.0;
					ix += sx;
				}
				av[ oA ] = -alphr;
				av[ oA + 1 ] = -alphi;
			}
		} else {
			// Complex alpha: tau = 1 - alpha/|alpha|, alpha becomes |alpha|
			xnorm = dlapy2( alphr, alphi );
			tauv[ oT ] = 1.0 - ( alphr / xnorm );
			tauv[ oT + 1 ] = -( alphi / xnorm );
			ix = offsetX * 2;
			for ( j = 0; j < N - 1; j++ ) {
				xv[ ix ] = 0.0;
				xv[ ix + 1 ] = 0.0;
				ix += sx;
			}
			av[ oA ] = xnorm;
			av[ oA + 1 ] = 0.0;
		}
	} else {
		// General case.
		// Fortran SIGN(A,B) returns |A|*sign(B); when B=0, result is +|A|.
		// Math.sign(0) returns 0, so default to 1.0 for alphr=0.
		beta = ( Math.sign( alphr ) || 1.0 ) * dlapy3( alphr, alphi, xnorm );
		smlnum = dlamch( 'safe-minimum' ) / dlamch( 'epsilon' );
		bignum = 1.0 / smlnum;

		knt = 0;
		if ( Math.abs( beta ) < smlnum ) {
			// XNORM, BETA may be inaccurate; scale X and recompute them
			do {
				knt += 1;
				zdscal( N - 1, bignum, x, strideX, offsetX );
				beta *= bignum;
				alphi *= bignum;
				alphr *= bignum;
			} while ( Math.abs( beta ) < smlnum && knt < 20 );

			// New BETA is at most 1, at least SMLNUM
			xnorm = dznrm2( N - 1, x, strideX, offsetX );
			av[ oA ] = alphr;
			av[ oA + 1 ] = alphi;
			beta = ( Math.sign( alphr ) || 1.0 ) * dlapy3( alphr, alphi, xnorm );
		}
		savealphaR = av[ oA ];
		savealphaI = av[ oA + 1 ];

		// alpha = alpha + beta
		av[ oA ] = av[ oA ] + beta;
		if ( beta < 0.0 ) {
			beta = -beta;

			// tau = -alpha / beta
			tauv[ oT ] = -av[ oA ] / beta;
			tauv[ oT + 1 ] = -av[ oA + 1 ] / beta;
		} else {
			// ALPHR = ALPHI * (ALPHI/DBLE(ALPHA))
			// ALPHR = ALPHR + XNORM * (XNORM/DBLE(ALPHA))
			// tau = ( ALPHR/BETA, -ALPHI/BETA )
			// alpha = ( -ALPHR, ALPHI )
			alphr = alphi * ( alphi / av[ oA ] );
			alphr += ( xnorm * ( xnorm / av[ oA ] ) );
			tauv[ oT ] = alphr / beta;
			tauv[ oT + 1 ] = -alphi / beta;
			av[ oA ] = -alphr;
			av[ oA + 1 ] = alphi;
		}
		// alpha = 1.0 / alpha  (ZLADIV)
		scratch[ 0 ] = 1.0;
		scratch[ 1 ] = 0.0;
		scratch[ 2 ] = av[ oA ];
		scratch[ 3 ] = av[ oA + 1 ];
		cmplx.divAt( scratch, 0, scratch, 0, scratch, 2 );
		av[ oA ] = scratch[ 0 ];
		av[ oA + 1 ] = scratch[ 1 ];

		// NOTE: the following denormal-tau flush branch is effectively unreachable in IEEE 754 double precision. Entering the general branch requires `xnorm > EPS*|alpha|`, so `|tau| >= xnorm^2/|alpha|^2 >= EPS^2 ~ 1.2e-32`, which is many orders of magnitude above `smlnum ~ 4.5e-292`. The branch is kept for strict faithfulness to the LAPACK reference. // eslint-disable-line max-len
		if ( cmplx.absAt( tauv, oT ) <= smlnum ) {
			// Denormal-TAU recovery: use the original `SAVEALPHA`, effectively treating this as the x-is-small branch:
			alphr = savealphaR;
			alphi = savealphaI;
			if ( alphi === 0.0 ) {
				if ( alphr >= 0.0 ) {
					tauv[ oT ] = 0.0;
					tauv[ oT + 1 ] = 0.0;
				} else {
					tauv[ oT ] = 2.0;
					tauv[ oT + 1 ] = 0.0;
					ix = offsetX * 2;
					for ( j = 0; j < N - 1; j++ ) {
						xv[ ix ] = 0.0;
						xv[ ix + 1 ] = 0.0;
						ix += sx;
					}
					beta = -savealphaR;
				}
			} else {
				xnorm = dlapy2( alphr, alphi );
				tauv[ oT ] = 1.0 - ( alphr / xnorm );
				tauv[ oT + 1 ] = -( alphi / xnorm );
				ix = offsetX * 2;
				for ( j = 0; j < N - 1; j++ ) {
					xv[ ix ] = 0.0;
					xv[ ix + 1 ] = 0.0;
					ix += sx;
				}
				beta = xnorm;
			}
		} else {
			// x = alpha * x
			scratchCAv[ 0 ] = av[ oA ];
			scratchCAv[ 1 ] = av[ oA + 1 ];
			zscal( N - 1, scratchCA.get( 0 ), x, strideX, offsetX );
		}

		// If the original alpha was scaled, unscale beta.
		for ( j = 0; j < knt; j++ ) {
			beta *= smlnum;
		}
		av[ oA ] = beta;
		av[ oA + 1 ] = 0.0;
	}
}


// EXPORTS //

export default zlarfgp;
