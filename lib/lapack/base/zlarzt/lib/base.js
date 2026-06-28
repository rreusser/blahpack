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

/* eslint-disable max-len, max-params, max-statements, max-depth */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlacgv from '../../zlacgv/lib/base.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import ztrmv from '../../../../blas/base/ztrmv/lib/base.js';


// VARIABLES //

var CZERO = new Complex128( 0.0, 0.0 );


// MAIN //

/**
* Forms the triangular factor T of a complex block reflector H = I - V_T_V^H.
*
* Currently only `direct = 'backward'` and `storev = 'rowwise'` are supported.
*
* @private
* @param {string} direct - `'backward'` (direction of reflector application)
* @param {string} storev - `'rowwise'` (storage of reflector vectors)
* @param {NonNegativeInteger} N - order of the block reflector
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Complex128Array} V - matrix of reflector vectors
* @param {integer} strideV1 - stride of first dim of V (complex elements)
* @param {integer} strideV2 - stride of second dim of V (complex elements)
* @param {NonNegativeInteger} offsetV - starting index for V (in complex elements)
* @param {Complex128Array} TAU - array of scalar factors
* @param {integer} strideTAU - stride for TAU (in complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (in complex elements)
* @param {Complex128Array} T - output triangular matrix
* @param {integer} strideT1 - stride of first dim of T (complex elements)
* @param {integer} strideT2 - stride of second dim of T (complex elements)
* @param {NonNegativeInteger} offsetT - starting index for T (in complex elements)
*/
function zlarzt( direct, storev, N, K, V, strideV1, strideV2, offsetV, TAU, strideTAU, offsetTAU, T, strideT1, strideT2, offsetT ) {
	var negTau;
	var tauR;
	var tauI;
	var TAUv;
	var stau;
	var oTAU;
	var st1;
	var st2;
	var Tv;
	var oT;
	var it;
	var j;
	var i;

	if ( N === 0 ) {
		return;
	}

	// Get Float64 views for element access
	TAUv = reinterpret( TAU, 0 );
	Tv = reinterpret( T, 0 );

	// Convert strides and offsets to Float64 units
	st1 = strideT1 * 2;
	st2 = strideT2 * 2;
	stau = strideTAU * 2;
	oTAU = offsetTAU * 2;
	oT = offsetT * 2;

	// Iterate from K down to 1 (backward direction)
	for ( i = K - 1; i >= 0; i -= 1 ) {
		tauR = TAUv[ oTAU + (i * stau) ];
		tauI = TAUv[ oTAU + (i * stau) + 1 ];

		if ( tauR === 0.0 && tauI === 0.0 ) {
			// H(i) = I: set T(i:K-1, i) column to zero
			for ( j = i; j < K; j += 1 ) {
				it = oT + (j * st1) + (i * st2);
				Tv[ it ] = 0.0;
				Tv[ it + 1 ] = 0.0;
			}
		} else {
			// General case
			if ( i < K - 1 ) {
				// T(i+1:K-1, i) = -tau(i) * V(i+1:K-1, 1:N) * V(i, 1:N)^H
				// Conjugate V(i, :) in-place
				zlacgv( N, V, strideV2, offsetV + (i * strideV1) );

				// zgemv: T(i+1:K-1, i) = -tau(i) * V(i+1:K-1, 1:N) * V(i, 1:N)
				negTau = new Complex128( -tauR, -tauI );
				zgemv('no-transpose', K - i - 1, N, negTau, V, strideV1, strideV2, offsetV + (( i + 1 ) * strideV1), V, strideV2, offsetV + (i * strideV1), CZERO, T, strideT1, offsetT + (( i + 1 ) * strideT1) + (i * strideT2));

				// Unconjugate V(i, :)
				zlacgv( N, V, strideV2, offsetV + (i * strideV1) );

				// T(i+1:K-1, i) = T(i+1:K-1, i+1:K-1) * T(i+1:K-1, i)
				ztrmv('lower', 'no-transpose', 'non-unit', K - i - 1, T, strideT1, strideT2, offsetT + (( i + 1 ) * strideT1) + (( i + 1 ) * strideT2), T, strideT1, offsetT + (( i + 1 ) * strideT1) + (i * strideT2));
			}

			// T(i, i) = tau(i)
			it = oT + (i * st1) + (i * st2);
			Tv[ it ] = tauR;
			Tv[ it + 1 ] = tauI;
		}
	}
}


// EXPORTS //

export default zlarzt;
