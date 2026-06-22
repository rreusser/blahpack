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

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import zlarf from '../../zlarf/lib/base.js';


// MAIN //

/**
* Applies an elementary reflector H to a complex M-by-N matrix C, from either the left or the right.
*
* H is represented in the form:
*
* `H = I - tau * v * v^H`
*
* where tau is a complex scalar and v is a complex vector.
*
* If tau = 0, then H is taken to be the unit matrix.
*
* This version uses inline code if H has order <= 10.
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {Complex128Array} v - the vector v in the reflector
* @param {integer} strideV - stride for v (in complex elements)
* @param {NonNegativeInteger} offsetV - starting index for v (in complex elements)
* @param {Complex128} tau - the complex scalar tau
* @param {Complex128Array} C - the M-by-N matrix
* @param {integer} strideC1 - stride of the first dimension of C (complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (complex elements)
* @param {NonNegativeInteger} offsetC - starting index for C (in complex elements)
* @param {Complex128Array} WORK - workspace (length N if side=`'left'`, length M if side=`'right'`)
* @param {integer} strideWORK - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
* @returns {void}
*/
function zlarfx( side, M, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ) {
	var tauArr;
	var tauR;
	var tauI;
	var sc1;
	var sc2;
	var cv;
	var vv;
	var sv;

	tauR = real( tau );
	tauI = imag( tau );

	// Quick return if tau = 0
	if ( tauR === 0.0 && tauI === 0.0 ) {
		return;
	}

	cv = reinterpret( C, 0 );
	vv = reinterpret( v, 0 );
	sv = strideV * 2;
	sc1 = strideC1 * 2;
	sc2 = strideC2 * 2;

	if ( side === 'left' ) {
		// Form H * C
		if ( M >= 1 && M <= 10 ) {
			applyLeft( M, N, vv, sv, offsetV * 2, tauR, tauI, cv, sc1, sc2, offsetC * 2 );
			return;
		}

		// General case: fall back to zlarf
		tauArr = new Complex128Array( 1 );
		tauArr.set( [ tauR, tauI ], 0 );
		zlarf( 'left', M, N, v, strideV, offsetV, tauArr, 0, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK );
	} else {
		// Form C * H
		if ( N >= 1 && N <= 10 ) {
			applyRight( M, N, vv, sv, offsetV * 2, tauR, tauI, cv, sc1, sc2, offsetC * 2 );
			return;
		}

		// General case: fall back to zlarf
		tauArr = new Complex128Array( 1 );
		tauArr.set( [ tauR, tauI ], 0 );
		zlarf( 'right', M, N, v, strideV, offsetV, tauArr, 0, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK );
	}
}

/**
* Applies H * C with loop-unrolled code for M = 1..10.
*
* @private
* @param {NonNegativeInteger} M - reflector order (1..10)
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} vv - reinterpreted V (Float64 pairs)
* @param {integer} sv - stride for V in Float64 units
* @param {NonNegativeInteger} ov - offset for V in Float64 units
* @param {number} tauR - real part of tau
* @param {number} tauI - imaginary part of tau
* @param {Float64Array} cv - reinterpreted C (Float64 pairs)
* @param {integer} sc1 - stride1 for C in Float64 units
* @param {integer} sc2 - stride2 for C in Float64 units
* @param {NonNegativeInteger} oc - offset for C in Float64 units
* @returns {void}
*/
function applyLeft( M, N, vv, sv, ov, tauR, tauI, cv, sc1, sc2, oc ) {
	var sumR;
	var sumI;
	var viR;
	var viI;
	var tiR;
	var tiI;
	var cR;
	var cI;
	var vr;
	var tr;
	var ic;
	var j;
	var i;

	if ( M === 1 ) {
		// Special case: H = I - tau*v(1)*conj(v(1)) applied to each column
		// T1 = ONE - tau * v(1) * conj(v(1))
		viR = vv[ ov ];
		viI = vv[ ov + 1 ];

		// t1 = 1 - tau * |v(1)|^2, where v(1)*conj(v(1)) = |v(1)|^2 (real)
		vr = (viR * viR) + (viI * viI); // |v(1)|^2
		tr = 1.0 - (tauR * vr);
		tiR = -(tauI * vr);

		// C(1,j) = t1 * C(1,j) for each column
		for ( j = 0; j < N; j += 1 ) {
			ic = oc + (j * sc2);
			cR = cv[ ic ];
			cI = cv[ ic + 1 ];

			// t1 * C(1,j)
			cv[ ic ] = (tr * cR) - (tiR * cI);
			cv[ ic + 1 ] = (tr * cI) + (tiR * cR);
		}
		return;
	}

	// General unrolled case for M = 2..10:
	//   SUM = sum_k conj(V(k)) * C(k,j)
	//   C(k,j) -= SUM * (tau * V(k))
	vr = new Float64Array( M * 2 );
	tr = new Float64Array( M * 2 );

	for ( i = 0; i < M; i += 1 ) {
		viR = vv[ ov + (i * sv) ];
		viI = vv[ ov + (i * sv) + 1 ];

		// conj(V(i)): (viR, -viI)
		vr[ i * 2 ] = viR;
		vr[ (i * 2) + 1 ] = -viI;

		// Tau * V(i): (tauR*viR - tauI*viI, tauR*viI + tauI*viR)
		tr[ i * 2 ] = (tauR * viR) - (tauI * viI);
		tr[ (i * 2) + 1 ] = (tauR * viI) + (tauI * viR);
	}

	for ( j = 0; j < N; j += 1 ) {
		// SUM = sum_k conj(V(k)) * C(k,j)
		sumR = 0.0;
		sumI = 0.0;
		for ( i = 0; i < M; i += 1 ) {
			ic = oc + (i * sc1) + (j * sc2);
			cR = cv[ ic ];
			cI = cv[ ic + 1 ];
			viR = vr[ i * 2 ];
			viI = vr[ (i * 2) + 1 ];

			// conj(V(k)) * C(k,j)
			sumR += (viR * cR) - (viI * cI);
			sumI += (viR * cI) + (viI * cR);
		}

		// C(k,j) -= SUM * (tau * V(k))
		for ( i = 0; i < M; i += 1 ) {
			ic = oc + (i * sc1) + (j * sc2);
			tiR = tr[ i * 2 ];
			tiI = tr[ (i * 2) + 1 ];

			// SUM * T(k)
			cv[ ic ] -= (sumR * tiR) - (sumI * tiI);
			cv[ ic + 1 ] -= (sumR * tiI) + (sumI * tiR);
		}
	}
}

/**
* Applies C * H with loop-unrolled code for N = 1..10.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - reflector order (1..10)
* @param {Float64Array} vv - reinterpreted V (Float64 pairs)
* @param {integer} sv - stride for V in Float64 units
* @param {NonNegativeInteger} ov - offset for V in Float64 units
* @param {number} tauR - real part of tau
* @param {number} tauI - imaginary part of tau
* @param {Float64Array} cv - reinterpreted C (Float64 pairs)
* @param {integer} sc1 - stride1 for C in Float64 units
* @param {integer} sc2 - stride2 for C in Float64 units
* @param {NonNegativeInteger} oc - offset for C in Float64 units
* @returns {void}
*/
function applyRight( M, N, vv, sv, ov, tauR, tauI, cv, sc1, sc2, oc ) {
	var sumR;
	var sumI;
	var viR;
	var viI;
	var tiR;
	var tiI;
	var cR;
	var cI;
	var vr;
	var tr;
	var ic;
	var j;
	var i;

	if ( N === 1 ) {
		// Special case: T1 = ONE - tau * v(1) * conj(v(1))
		viR = vv[ ov ];
		viI = vv[ ov + 1 ];

		// v(1)*conj(v(1)) = |v(1)|^2 (real)
		vr = (viR * viR) + (viI * viI);
		tr = 1.0 - (tauR * vr);
		tiR = -(tauI * vr);

		// C(j,1) = t1 * C(j,1)
		for ( j = 0; j < M; j += 1 ) {
			ic = oc + (j * sc1);
			cR = cv[ ic ];
			cI = cv[ ic + 1 ];
			cv[ ic ] = (tr * cR) - (tiR * cI);
			cv[ ic + 1 ] = (tr * cI) + (tiR * cR);
		}
		return;
	}

	// General unrolled case for N = 2..10:
	// Vk = V(k), Tk = tau * conj(Vk)
	// SUM = V(1)*C(j,1) + V(2)*C(j,2) + ...
	// C(j,k) -= SUM * Tk
	vr = new Float64Array( N * 2 );
	tr = new Float64Array( N * 2 );

	for ( i = 0; i < N; i += 1 ) {
		viR = vv[ ov + (i * sv) ];
		viI = vv[ ov + (i * sv) + 1 ];

		// V(i): (viR, viI)
		vr[ i * 2 ] = viR;
		vr[ (i * 2) + 1 ] = viI;

		// Tau * conj(V(i)): tau * (viR, -viI) = (tauR*viR + tauI*viI, -tauR*viI + tauI*viR)
		tr[ i * 2 ] = (tauR * viR) + (tauI * viI);
		tr[ (i * 2) + 1 ] = -(tauR * viI) + (tauI * viR);
	}

	for ( j = 0; j < M; j += 1 ) {
		// SUM = sum_k V(k) * C(j,k)
		sumR = 0.0;
		sumI = 0.0;
		for ( i = 0; i < N; i += 1 ) {
			ic = oc + (j * sc1) + (i * sc2);
			cR = cv[ ic ];
			cI = cv[ ic + 1 ];
			viR = vr[ i * 2 ];
			viI = vr[ (i * 2) + 1 ];

			// V(k) * C(j,k)
			sumR += (viR * cR) - (viI * cI);
			sumI += (viR * cI) + (viI * cR);
		}

		// C(j,k) -= SUM * Tk
		for ( i = 0; i < N; i += 1 ) {
			ic = oc + (j * sc1) + (i * sc2);
			tiR = tr[ i * 2 ];
			tiI = tr[ (i * 2) + 1 ];

			// SUM * T(k)
			cv[ ic ] -= (sumR * tiR) - (sumI * tiI);
			cv[ ic + 1 ] -= (sumR * tiI) + (sumI * tiR);
		}
	}
}


// EXPORTS //

export default zlarfx;
