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

/* eslint-disable max-len, max-params */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import zhemv from './../../../../blas/base/zhemv/lib/base.js';
import zdotc from './../../../../blas/base/zdotc/lib/base.js';
import zaxpy from './../../../../blas/base/zaxpy/lib/base.js';
import zher2 from './../../../../blas/base/zher2/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );
var CZERO = new Complex128( 0.0, 0.0 );


// MAIN //

/**
* Applies an elementary reflector, or Householder matrix, H, to an N-by-N Hermitian matrix C, from both the left and the right.
*
* `H = I - tau * v * v**H`
*
* If tau is zero, then H is taken to be the unit matrix.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangular part of C is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix C
* @param {Complex128Array} v - reflector vector
* @param {integer} strideV - stride for `v` (in complex elements)
* @param {NonNegativeInteger} offsetV - starting index for `v` (in complex elements)
* @param {Complex128} tau - complex scalar factor
* @param {Complex128Array} C - Hermitian matrix, modified in-place
* @param {integer} strideC1 - stride of the first dimension of `C` (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of `C` (in complex elements)
* @param {NonNegativeInteger} offsetC - starting index for `C` (in complex elements)
* @param {Complex128Array} WORK - workspace array of length `N`
* @param {integer} strideWork - stride for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @returns {Complex128Array} `C`
*/
function zlarfy( uplo, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	var alphaR;
	var alphaI;
	var negTau;
	var alpha;
	var tauR;
	var tauI;
	var dotR;
	var dotI;
	var dot;

	tauR = real( tau );
	tauI = imag( tau );

	// Quick return if tau is zero (H is the identity):
	if ( tauR === 0.0 && tauI === 0.0 ) {
		return C;
	}

	// Form w := C * v
	zhemv( uplo, N, CONE, C, strideC1, strideC2, offsetC, v, strideV, offsetV, CZERO, WORK, strideWork, offsetWork );

	// alpha := -1/2 * tau * (w^H * v)  where w^H * v = zdotc( w, v )
	dot = zdotc( N, WORK, strideWork, offsetWork, v, strideV, offsetV );
	dotR = real( dot );
	dotI = imag( dot );

	// alpha = -0.5 * tau * dot

	// Compute tau * dot first:

	// (tauR + i*tauI) * (dotR + i*dotI) = (tauR*dotR - tauI*dotI) + i*(tauR*dotI + tauI*dotR)
	alphaR = -0.5 * ( ( tauR * dotR ) - ( tauI * dotI ) );
	alphaI = -0.5 * ( ( tauR * dotI ) + ( tauI * dotR ) );
	alpha = new Complex128( alphaR, alphaI );

	// WORK := alpha * v + WORK
	zaxpy( N, alpha, v, strideV, offsetV, WORK, strideWork, offsetWork );

	// C := C - v * w^H - w * v^H  (rank-2 Hermitian update with scalar -tau)
	negTau = new Complex128( -tauR, -tauI );
	zher2( uplo, N, negTau, v, strideV, offsetV, WORK, strideWork, offsetWork, C, strideC1, strideC2, offsetC );

	return C;
}


// EXPORTS //

export default zlarfy;
