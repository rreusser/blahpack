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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dznrm2 from '../../../../blas/base/dznrm2/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import dlapy3 from '../../dlapy3/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

// Module-level scratch arrays to avoid per-call allocation
var SCRATCH = new Float64Array( 4 );
var SCRATCH_CA = new Complex128Array( 1 );
var SCRATCH_CAv = reinterpret( SCRATCH_CA, 0 );


// MAIN //

/**
* Generate a complex elementary reflector H of order N, such that.
*
* `H^H*( alpha ) = ( beta )`,   `H^H*H = I`.
* (   x   )   (   0  )
*
* where alpha and beta are scalars, with beta real, and x is an
* (N-1)-element complex vector.
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
function zlarfg( N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau ) {
	var rsafmn;
	var safmin;
	var alphr;
	var alphi;
	var xnorm;
	var beta;
	var tauv;
	var knt;
	var av;
	var oA;
	var oT;
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

	xnorm = dznrm2( N - 1, x, strideX, offsetX );
	alphr = av[ oA ];
	alphi = av[ oA + 1 ];

	if ( xnorm === 0.0 && alphi === 0.0 ) {
		// H = I
		tauv[ oT ] = 0.0;
		tauv[ oT + 1 ] = 0.0;
	} else {
		// General case
		// Fortran SIGN(A,B) returns |A|*sign(B); when B=0, result is +|A|.
		// Math.sign(0) returns 0, so default to 1.0 for alphr=0.
		beta = -( Math.sign( alphr ) || 1.0 ) * dlapy3( alphr, alphi, xnorm );
		safmin = dlamch( 'safe-minimum' ) / dlamch( 'epsilon' );
		rsafmn = 1.0 / safmin;

		knt = 0;
		if ( Math.abs( beta ) < safmin ) {
			// XNORM, BETA may be inaccurate; scale X and recompute them
			do {
				knt += 1;
				zdscal( N - 1, rsafmn, x, strideX, offsetX );
				beta *= rsafmn;
				alphi *= rsafmn;
				alphr *= rsafmn;
			} while ( Math.abs( beta ) < safmin && knt < 20 );

			// New BETA is at most 1, at least SAFMIN
			xnorm = dznrm2( N - 1, x, strideX, offsetX );
			av[ oA ] = alphr;
			av[ oA + 1 ] = alphi;
			// Fortran SIGN(A,B) returns |A|*sign(B); when B=0, result is +|A|.
			// Math.sign(0) returns 0, so default to 1.0 for alphr=0.
			beta = -( Math.sign( alphr ) || 1.0 ) * dlapy3( alphr, alphi, xnorm );
		}
		tauv[ oT ] = ( beta - alphr ) / beta;
		tauv[ oT + 1 ] = -(alphi / beta);

		// alpha = 1.0 / (alpha - beta)

		// Use cmplx.divAt for ZLADIV( DCMPLX(ONE), ALPHA - BETA )
		SCRATCH[ 0 ] = 1.0;
		SCRATCH[ 1 ] = 0.0;
		SCRATCH[ 2 ] = alphr - beta;
		SCRATCH[ 3 ] = alphi;
		cmplx.divAt( SCRATCH, 0, SCRATCH, 0, SCRATCH, 2 );

		SCRATCH_CAv[ 0 ] = SCRATCH[ 0 ];
		SCRATCH_CAv[ 1 ] = SCRATCH[ 1 ];
		zscal( N - 1, SCRATCH_CA.get( 0 ), x, strideX, offsetX );

		// If ALPHA is subnormal, it may lose relative accuracy
		for ( j = 0; j < knt; j++ ) {
			beta *= safmin;
		}
		av[ oA ] = beta;
		av[ oA + 1 ] = 0.0;
	}
}


// EXPORTS //

export default zlarfg;
