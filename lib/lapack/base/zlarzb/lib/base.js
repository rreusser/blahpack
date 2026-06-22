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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import ztrmm from '../../../../blas/base/ztrmm/lib/base.js';
import zlacgv from '../../zlacgv/lib/base.js';


// VARIABLES //

var ONE = new Complex128( 1.0, 0.0 );
var NEGONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Applies a complex block reflector `H` or its conjugate-transpose `H^H` from an RZ factorization to a complex M-by-N matrix `C`.
*
* Currently, only `direct = 'backward'` and `storev = 'rowwise'` are supported.
*
* @private
* @param {string} side - `'left'` (apply from the left) or `'right'` (apply from the right)
* @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
* @param {string} direct - `'backward'` (only supported value)
* @param {string} storev - `'rowwise'` (only supported value)
* @param {NonNegativeInteger} M - number of rows of `C`
* @param {NonNegativeInteger} N - number of columns of `C`
* @param {NonNegativeInteger} K - order of the triangular factor `T`
* @param {NonNegativeInteger} l - number of columns of `V` containing the meaningful part of the Householder reflectors
* @param {Complex128Array} V - matrix of reflector vectors
* @param {integer} strideV1 - first dim stride of `V` (complex elements)
* @param {integer} strideV2 - second dim stride of `V` (complex elements)
* @param {NonNegativeInteger} offsetV - starting index for `V` (in complex elements)
* @param {Complex128Array} T - triangular block-reflector factor
* @param {integer} strideT1 - first dim stride of `T` (complex elements)
* @param {integer} strideT2 - second dim stride of `T` (complex elements)
* @param {NonNegativeInteger} offsetT - starting index for `T` (in complex elements)
* @param {Complex128Array} C - matrix `C`, overwritten with `H*C`, `H^H*C`, `C*H`, or `C*H^H`
* @param {integer} strideC1 - first dim stride of `C` (complex elements)
* @param {integer} strideC2 - second dim stride of `C` (complex elements)
* @param {NonNegativeInteger} offsetC - starting index for `C` (in complex elements)
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWORK1 - first dim stride of `WORK` (complex elements)
* @param {integer} strideWORK2 - second dim stride of `WORK` (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (in complex elements)
*/
function zlarzb( side, trans, direct, storev, M, N, K, l, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWORK1, strideWORK2, offsetWORK ) {
	var transt;
	var sc1;
	var sc2;
	var sw1;
	var sw2;
	var Cv;
	var Wv;
	var oC;
	var oW;
	var ic;
	var iw;
	var j;
	var i;

	// Quick return if possible
	if ( M <= 0 || N <= 0 ) {
		return;
	}

	// Only 'backward' / 'rowwise' is supported (mirrors Fortran XERBLA)
	if ( direct !== 'backward' || storev !== 'rowwise' ) {
		return;
	}

	// TRANST is the "opposite" trans used for T multiplication
	if ( trans === 'no-transpose' ) {
		transt = 'conjugate-transpose';
	} else {
		transt = 'no-transpose';
	}

	Cv = reinterpret( C, 0 );
	Wv = reinterpret( WORK, 0 );
	sc1 = strideC1 * 2;
	sc2 = strideC2 * 2;
	sw1 = strideWORK1 * 2;
	sw2 = strideWORK2 * 2;
	oC = offsetC * 2;
	oW = offsetWORK * 2;

	if ( side === 'left' ) {
		// Form H*C or H^H*C

		// W(1:N, 1:K) = C(1:K, 1:N)^T  (pure transpose; Fortran zlarzb does NOT conjugate here)
		for ( j = 0; j < K; j += 1 ) {
			zcopy( N, C, strideC2, offsetC + (j * strideC1), WORK, strideWORK1, offsetWORK + (j * strideWORK2) );
		}

		// W := W + C(M-L+1:M, 1:N)^T * V(1:K, 1:L)^H
		if ( l > 0 ) {
			zgemm( 'transpose', 'conjugate-transpose', N, K, l, ONE, C, strideC1, strideC2, offsetC + (( M - l ) * strideC1), V, strideV1, strideV2, offsetV, ONE, WORK, strideWORK1, strideWORK2, offsetWORK );
		}

		// W := W * T^H  (if TRANS='N')  or  W := W * T  (if TRANS='C')
		ztrmm( 'right', 'lower', transt, 'non-unit', N, K, ONE, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );

		// C(1:K, 1:N) := C(1:K, 1:N) - W(1:N, 1:K)^T
		for ( j = 0; j < N; j += 1 ) {
			for ( i = 0; i < K; i += 1 ) {
				ic = oC + (i * sc1) + (j * sc2);
				iw = oW + (j * sw1) + (i * sw2);
				Cv[ ic ] -= Wv[ iw ];
				Cv[ ic + 1 ] -= Wv[ iw + 1 ];
			}
		}

		// C(M-L+1:M, 1:N) := C(M-L+1:M, 1:N) - V(1:K, 1:L)^T * W(1:N, 1:K)^T
		if ( l > 0 ) {
			zgemm( 'transpose', 'transpose', l, N, K, NEGONE, V, strideV1, strideV2, offsetV, WORK, strideWORK1, strideWORK2, offsetWORK, ONE, C, strideC1, strideC2, offsetC + (( M - l ) * strideC1) );
		}
	} else if ( side === 'right' ) {
		// Form C*H or C*H^H

		// W(1:M, 1:K) = C(1:M, 1:K)
		for ( j = 0; j < K; j += 1 ) {
			zcopy( M, C, strideC1, offsetC + (j * strideC2), WORK, strideWORK1, offsetWORK + (j * strideWORK2) );
		}

		// W := W + C(1:M, N-L+1:N) * V(1:K, 1:L)^T
		if ( l > 0 ) {
			zgemm( 'no-transpose', 'transpose', M, K, l, ONE, C, strideC1, strideC2, offsetC + (( N - l ) * strideC2), V, strideV1, strideV2, offsetV, ONE, WORK, strideWORK1, strideWORK2, offsetWORK );
		}

		// W := W * conj(T)  or  W := W * T^H
		// Fortran conjugates T's lower triangle column-by-column using
		// ZLACGV on each diagonal-down subvector of length K-J+1, then
		// Calls ZTRMM with the original TRANS, then unconjugates.
		for ( j = 0; j < K; j += 1 ) {
			zlacgv( K - j, T, strideT1, offsetT + (j * strideT1) + (j * strideT2) );
		}
		ztrmm( 'right', 'lower', trans, 'non-unit', M, K, ONE, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );
		for ( j = 0; j < K; j += 1 ) {
			zlacgv( K - j, T, strideT1, offsetT + (j * strideT1) + (j * strideT2) );
		}

		// C(1:M, 1:K) := C(1:M, 1:K) - W(1:M, 1:K)
		for ( j = 0; j < K; j += 1 ) {
			for ( i = 0; i < M; i += 1 ) {
				ic = oC + (i * sc1) + (j * sc2);
				iw = oW + (i * sw1) + (j * sw2);
				Cv[ ic ] -= Wv[ iw ];
				Cv[ ic + 1 ] -= Wv[ iw + 1 ];
			}
		}

		// C(1:M, N-L+1:N) := C(1:M, N-L+1:N) - W(1:M, 1:K) * conj(V(1:K, 1:L))
		// Conjugate V in place row-by-row, call zgemm, then unconjugate.
		for ( j = 0; j < l; j += 1 ) {
			zlacgv( K, V, strideV1, offsetV + (j * strideV2) );
		}
		if ( l > 0 ) {
			zgemm( 'no-transpose', 'no-transpose', M, l, K, NEGONE, WORK, strideWORK1, strideWORK2, offsetWORK, V, strideV1, strideV2, offsetV, ONE, C, strideC1, strideC2, offsetC + (( N - l ) * strideC2) );
		}
		for ( j = 0; j < l; j += 1 ) {
			zlacgv( K, V, strideV1, offsetV + (j * strideV2) );
		}
	}
}


// EXPORTS //

export default zlarzb;
