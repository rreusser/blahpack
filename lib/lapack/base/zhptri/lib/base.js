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

/* eslint-disable max-depth, max-statements, max-lines-per-function, max-len, max-lines */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zdotc from '../../../../blas/base/zdotc/lib/base.js';
import zhpmv from '../../../../blas/base/zhpmv/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

var NCONE = new Complex128( -1.0, 0.0 );
var CZERO = new Complex128( 0.0, 0.0 );


// MAIN //

/**
* Computes the inverse of a complex Hermitian matrix in packed storage using the factorization `A = U * D * U**H` or `A = L * D * L**H` computed by zhptrf.
*
* ## Notes
*
* -   IPIV is 0-based. Negative values encode 2x2 pivot blocks via bitwise NOT (`~p`).
* -   AP is a Complex128Array of length `N*(N+1)/2` in packed format.
* -   WORK is a Complex128Array of length `N`.
* -   Returns INFO: 0 = success, k > 0 = `D(k,k)` is zero (1-based).
*
* @private
* @param {string} uplo - specifies whether upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} AP - packed Hermitian matrix (overwritten with inverse)
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @param {Int32Array} IPIV - pivot indices from zhptrf
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} WORK - workspace array of length `N`
* @param {integer} strideWORK - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (in complex elements)
* @returns {integer} status code (0 = success)
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Int32Array = require( '@stdlib/array/int32' );
*
* var AP = new Complex128Array( [ 4.0, 0.0 ] );
* var IPIV = new Int32Array( [ 0 ] );
* var WORK = new Complex128Array( 1 );
*
* var info = zhptri( 'upper', 1, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
* // returns 0
*/
function zhptri( uplo, N, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	var kcnext;
	var akkp1R;
	var akkp1I;
	var kstep;
	var upper;
	var tempR;
	var tempI;
	var dotc;
	var info;
	var akp1;
	var APv;
	var sap;
	var oAP;
	var npp;
	var kpc;
	var ak;
	var kp;
	var kx;
	var kc;
	var ip;
	var d;
	var j;
	var k;
	var t;
	var p;

	// All internal indices (k, kc, kcnext, kpc, kx, kp) use 1-based Fortran convention.

	// APv is the Float64 reinterpretation; positions are 0-based Float64 indices

	// Computed as: oAP + (pos - 1) * sap, where pos is 1-based complex position.

	APv = reinterpret( AP, 0 );
	sap = strideAP * 2;
	oAP = offsetAP * 2;
	info = 0;
	upper = ( uplo === 'upper' );

	if ( N === 0 ) {
		return 0;
	}

	// Check that the diagonal of D is non-zero (singularity check)
	if ( upper ) {
		kp = ( ( N * ( N + 1 ) / 2 )|0 );
		for ( info = N; info >= 1; info -= 1 ) {
			ip = IPIV[ offsetIPIV + ( ( info - 1 ) * strideIPIV ) ];
			if ( ip >= 0 && APv[ oAP + ( ( kp - 1 ) * sap ) ] === 0.0 && APv[ oAP + ( ( kp - 1 ) * sap ) + 1 ] === 0.0 ) {
				return info;
			}
			kp -= info;
		}
	} else {
		kp = 1;
		for ( info = 1; info <= N; info += 1 ) {
			ip = IPIV[ offsetIPIV + ( ( info - 1 ) * strideIPIV ) ];
			if ( ip >= 0 && APv[ oAP + ( ( kp - 1 ) * sap ) ] === 0.0 && APv[ oAP + ( ( kp - 1 ) * sap ) + 1 ] === 0.0 ) {
				return info;
			}
			kp += N - info + 1;
		}
	}
	info = 0;

	if ( upper ) {
		// Compute inv(A) from the factorization A = U*D*U**H
		k = 1;
		kc = 1;

		while ( k <= N ) {
			kcnext = kc + k;

			ip = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
			if ( ip >= 0 ) {
				// 1x1 pivot block: invert diagonal
				p = oAP + ( ( kc + k - 2 ) * sap );
				APv[ p ] = 1.0 / APv[ p ];
				APv[ p + 1 ] = 0.0;

				if ( k > 1 ) {
					// Copy column k (rows 1..k-1) to WORK
					zcopy( k - 1, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ), WORK, strideWORK, offsetWORK );

					// AP(1..k-1, k) = -A * WORK (Hermitian packed matvec)
					zhpmv( uplo, k - 1, NCONE, AP, strideAP, offsetAP, WORK, strideWORK, offsetWORK, CZERO, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ) );

					// AP(k,k) -= real( conj(WORK) . AP(1..k-1, k) )
					dotc = zdotc( k - 1, WORK, strideWORK, offsetWORK, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ) );
					APv[ p ] -= real( dotc );
				}
				kstep = 1;
			} else {
				// 2x2 pivot block
				// t = |AP(kcnext+k-1)| (complex modulus of off-diagonal)
				t = cmplx.absAt( APv, oAP + ( ( kcnext + k - 2 ) * sap ) );

				// ak = real(AP(kc+k-1)) / t
				ak = APv[ oAP + ( ( kc + k - 2 ) * sap ) ] / t;

				// akp1 = real(AP(kcnext+k)) / t
				akp1 = APv[ oAP + ( ( kcnext + k - 1 ) * sap ) ] / t;

				// akkp1 = AP(kcnext+k-1) / t (complex)
				akkp1R = APv[ oAP + ( ( kcnext + k - 2 ) * sap ) ] / t;
				akkp1I = APv[ oAP + ( ( kcnext + k - 2 ) * sap ) + 1 ] / t;

				// d = t * (ak * akp1 - 1)
				d = t * ( ( ak * akp1 ) - 1.0 );

				// Invert the 2x2 block
				p = oAP + ( ( kc + k - 2 ) * sap );
				APv[ p ] = akp1 / d;
				APv[ p + 1 ] = 0.0;

				p = oAP + ( ( kcnext + k - 1 ) * sap );
				APv[ p ] = ak / d;
				APv[ p + 1 ] = 0.0;

				p = oAP + ( ( kcnext + k - 2 ) * sap );
				APv[ p ] = -akkp1R / d;
				APv[ p + 1 ] = -akkp1I / d;

				if ( k > 1 ) {
					// Process column k
					zcopy( k - 1, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ), WORK, strideWORK, offsetWORK );
					zhpmv( uplo, k - 1, NCONE, AP, strideAP, offsetAP, WORK, strideWORK, offsetWORK, CZERO, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ) );

					dotc = zdotc( k - 1, WORK, strideWORK, offsetWORK, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ) );
					p = oAP + ( ( kc + k - 2 ) * sap );
					APv[ p ] -= real( dotc );

					// AP(kcnext+k-1) -= dotc(AP col k, AP col k+1)
					dotc = zdotc( k - 1, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ), AP, strideAP, offsetAP + ( ( kcnext - 1 ) * strideAP ) );
					p = oAP + ( ( kcnext + k - 2 ) * sap );
					APv[ p ] -= real( dotc );
					APv[ p + 1 ] -= imag( dotc );

					// Process column k+1
					zcopy( k - 1, AP, strideAP, offsetAP + ( ( kcnext - 1 ) * strideAP ), WORK, strideWORK, offsetWORK );
					zhpmv( uplo, k - 1, NCONE, AP, strideAP, offsetAP, WORK, strideWORK, offsetWORK, CZERO, AP, strideAP, offsetAP + ( ( kcnext - 1 ) * strideAP ) );

					dotc = zdotc( k - 1, WORK, strideWORK, offsetWORK, AP, strideAP, offsetAP + ( ( kcnext - 1 ) * strideAP ) );
					p = oAP + ( ( kcnext + k - 1 ) * sap );
					APv[ p ] -= real( dotc );
				}
				kstep = 2;
				kcnext += k + 1;
			}

			// Interchange rows and columns kp and k
			kp = ( ip >= 0 ) ? ip + 1 : ( ~ip ) + 1; // 0-based IPIV → 1-based kp
			if ( kp !== k ) {
				// kpc = start of column kp in upper packed (1-based)
				kpc = ( ( ( kp - 1 ) * kp / 2 )|0 ) + 1;

				// Swap elements 1..kp-1 of columns k and kp
				zswap( kp - 1, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ), AP, strideAP, offsetAP + ( ( kpc - 1 ) * strideAP ) );

				// Swap and conjugate elements between rows kp+1..k-1
				kx = kpc + kp - 1;
				for ( j = kp + 1; j <= k - 1; j += 1 ) {
					kx += j - 1;

					// Temp = conj(AP(kc+j-1))
					tempR = APv[ oAP + ( ( kc + j - 2 ) * sap ) ];
					tempI = -APv[ oAP + ( ( kc + j - 2 ) * sap ) + 1 ];

					// AP(kc+j-1) = conj(AP(kx))
					APv[ oAP + ( ( kc + j - 2 ) * sap ) ] = APv[ oAP + ( ( kx - 1 ) * sap ) ];
					APv[ oAP + ( ( kc + j - 2 ) * sap ) + 1 ] = -APv[ oAP + ( ( kx - 1 ) * sap ) + 1 ];

					// AP(kx) = temp
					APv[ oAP + ( ( kx - 1 ) * sap ) ] = tempR;
					APv[ oAP + ( ( kx - 1 ) * sap ) + 1 ] = tempI;
				}
				// Conjugate AP(kc+kp-1)
				APv[ oAP + ( ( kc + kp - 2 ) * sap ) + 1 ] = -APv[ oAP + ( ( kc + kp - 2 ) * sap ) + 1 ];

				// Swap diagonal elements
				tempR = APv[ oAP + ( ( kc + k - 2 ) * sap ) ];
				tempI = APv[ oAP + ( ( kc + k - 2 ) * sap ) + 1 ];
				APv[ oAP + ( ( kc + k - 2 ) * sap ) ] = APv[ oAP + ( ( kpc + kp - 2 ) * sap ) ];
				APv[ oAP + ( ( kc + k - 2 ) * sap ) + 1 ] = APv[ oAP + ( ( kpc + kp - 2 ) * sap ) + 1 ];
				APv[ oAP + ( ( kpc + kp - 2 ) * sap ) ] = tempR;
				APv[ oAP + ( ( kpc + kp - 2 ) * sap ) + 1 ] = tempI;

				if ( kstep === 2 ) {
					// Swap off-diagonal in 2x2 block
					tempR = APv[ oAP + ( ( kc + k + k - 2 ) * sap ) ];
					tempI = APv[ oAP + ( ( kc + k + k - 2 ) * sap ) + 1 ];
					APv[ oAP + ( ( kc + k + k - 2 ) * sap ) ] = APv[ oAP + ( ( kc + k + kp - 2 ) * sap ) ];
					APv[ oAP + ( ( kc + k + k - 2 ) * sap ) + 1 ] = APv[ oAP + ( ( kc + k + kp - 2 ) * sap ) + 1 ];
					APv[ oAP + ( ( kc + k + kp - 2 ) * sap ) ] = tempR;
					APv[ oAP + ( ( kc + k + kp - 2 ) * sap ) + 1 ] = tempI;
				}
			}

			k += kstep;
			kc = kcnext;
		}
	} else {
		// Lower triangle: compute inv(A) from A = L*D*L**H
		npp = ( ( N * ( N + 1 ) / 2 )|0 );
		k = N;
		kc = npp;

		while ( k >= 1 ) {
			kcnext = kc - ( N - k + 2 );

			ip = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
			if ( ip >= 0 ) {
				// 1x1 pivot block: invert diagonal
				p = oAP + ( ( kc - 1 ) * sap );
				APv[ p ] = 1.0 / APv[ p ];
				APv[ p + 1 ] = 0.0;

				if ( k < N ) {
					// Copy column k (rows k+1..N) to WORK
					zcopy( N - k, AP, strideAP, offsetAP + ( kc * strideAP ), WORK, strideWORK, offsetWORK );

					// AP(k+1..N, k) = -A_trailing * WORK
					zhpmv( uplo, N - k, NCONE, AP, strideAP, offsetAP + ( ( kc + N - k ) * strideAP ), WORK, strideWORK, offsetWORK, CZERO, AP, strideAP, offsetAP + ( kc * strideAP ) );

					// AP(k,k) -= real( conj(WORK) . AP(k+1..N, k) )
					dotc = zdotc( N - k, WORK, strideWORK, offsetWORK, AP, strideAP, offsetAP + ( kc * strideAP ) );
					APv[ p ] -= real( dotc );
				}
				kstep = 1;
			} else {
				// 2x2 pivot block
				// t = |AP(kcnext+1)| (complex modulus of off-diagonal)
				t = cmplx.absAt( APv, oAP + ( kcnext * sap ) );

				// ak = real(AP(kcnext)) / t
				ak = APv[ oAP + ( ( kcnext - 1 ) * sap ) ] / t;

				// akp1 = real(AP(kc)) / t
				akp1 = APv[ oAP + ( ( kc - 1 ) * sap ) ] / t;

				// akkp1 = AP(kcnext+1) / t (complex)
				akkp1R = APv[ oAP + ( kcnext * sap ) ] / t;
				akkp1I = APv[ oAP + ( kcnext * sap ) + 1 ] / t;

				// d = t * (ak * akp1 - 1)
				d = t * ( ( ak * akp1 ) - 1.0 );

				// Invert the 2x2 block
				p = oAP + ( ( kcnext - 1 ) * sap );
				APv[ p ] = akp1 / d;
				APv[ p + 1 ] = 0.0;

				p = oAP + ( ( kc - 1 ) * sap );
				APv[ p ] = ak / d;
				APv[ p + 1 ] = 0.0;

				p = oAP + ( kcnext * sap );
				APv[ p ] = -akkp1R / d;
				APv[ p + 1 ] = -akkp1I / d;

				if ( k < N ) {
					// Process column k
					zcopy( N - k, AP, strideAP, offsetAP + ( kc * strideAP ), WORK, strideWORK, offsetWORK );
					zhpmv( uplo, N - k, NCONE, AP, strideAP, offsetAP + ( ( kc + N - k ) * strideAP ), WORK, strideWORK, offsetWORK, CZERO, AP, strideAP, offsetAP + ( kc * strideAP ) );

					dotc = zdotc( N - k, WORK, strideWORK, offsetWORK, AP, strideAP, offsetAP + ( kc * strideAP ) );
					p = oAP + ( ( kc - 1 ) * sap );
					APv[ p ] -= real( dotc );

					// AP(kcnext+1) -= dotc(AP col k, AP col k-1)
					dotc = zdotc( N - k, AP, strideAP, offsetAP + ( kc * strideAP ), AP, strideAP, offsetAP + ( ( kcnext + 1 ) * strideAP ) );
					p = oAP + ( kcnext * sap );
					APv[ p ] -= real( dotc );
					APv[ p + 1 ] -= imag( dotc );

					// Process column k-1
					zcopy( N - k, AP, strideAP, offsetAP + ( ( kcnext + 1 ) * strideAP ), WORK, strideWORK, offsetWORK );
					zhpmv( uplo, N - k, NCONE, AP, strideAP, offsetAP + ( ( kc + N - k ) * strideAP ), WORK, strideWORK, offsetWORK, CZERO, AP, strideAP, offsetAP + ( ( kcnext + 1 ) * strideAP ) );

					dotc = zdotc( N - k, WORK, strideWORK, offsetWORK, AP, strideAP, offsetAP + ( ( kcnext + 1 ) * strideAP ) );
					p = oAP + ( ( kcnext - 1 ) * sap );
					APv[ p ] -= real( dotc );
				}
				kstep = 2;
				kcnext -= ( N - k + 3 );
			}

			// Interchange rows and columns kp and k
			kp = ( ip >= 0 ) ? ip + 1 : ( ~ip ) + 1; // 0-based IPIV → 1-based kp
			if ( kp !== k ) {
				// kpc = start of column kp in lower packed (1-based)
				kpc = npp - ( ( ( N - kp + 1 ) * ( N - kp + 2 ) / 2 )|0 ) + 1;

				// Swap elements after row kp
				if ( kp < N ) {
					zswap( N - kp, AP, strideAP, offsetAP + ( ( kc + kp - k ) * strideAP ), AP, strideAP, offsetAP + ( kpc * strideAP ) );
				}

				// Swap and conjugate elements between rows k+1..kp-1
				kx = kc + kp - k;
				for ( j = k + 1; j <= kp - 1; j += 1 ) {
					kx += N - j + 1;

					// Temp = conj(AP(kc+j-k))
					tempR = APv[ oAP + ( ( kc + j - k - 1 ) * sap ) ];
					tempI = -APv[ oAP + ( ( kc + j - k - 1 ) * sap ) + 1 ];

					// AP(kc+j-k) = conj(AP(kx))
					APv[ oAP + ( ( kc + j - k - 1 ) * sap ) ] = APv[ oAP + ( ( kx - 1 ) * sap ) ];
					APv[ oAP + ( ( kc + j - k - 1 ) * sap ) + 1 ] = -APv[ oAP + ( ( kx - 1 ) * sap ) + 1 ];

					// AP(kx) = temp
					APv[ oAP + ( ( kx - 1 ) * sap ) ] = tempR;
					APv[ oAP + ( ( kx - 1 ) * sap ) + 1 ] = tempI;
				}
				// Conjugate AP(kc+kp-k)
				APv[ oAP + ( ( kc + kp - k - 1 ) * sap ) + 1 ] = -APv[ oAP + ( ( kc + kp - k - 1 ) * sap ) + 1 ];

				// Swap diagonal elements
				tempR = APv[ oAP + ( ( kc - 1 ) * sap ) ];
				tempI = APv[ oAP + ( ( kc - 1 ) * sap ) + 1 ];
				APv[ oAP + ( ( kc - 1 ) * sap ) ] = APv[ oAP + ( ( kpc - 1 ) * sap ) ];
				APv[ oAP + ( ( kc - 1 ) * sap ) + 1 ] = APv[ oAP + ( ( kpc - 1 ) * sap ) + 1 ];
				APv[ oAP + ( ( kpc - 1 ) * sap ) ] = tempR;
				APv[ oAP + ( ( kpc - 1 ) * sap ) + 1 ] = tempI;

				if ( kstep === 2 ) {
					// Swap AP(kc-N+k-1) <-> AP(kc-N+kp-1)
					tempR = APv[ oAP + ( ( kc - N + k - 2 ) * sap ) ];
					tempI = APv[ oAP + ( ( kc - N + k - 2 ) * sap ) + 1 ];
					APv[ oAP + ( ( kc - N + k - 2 ) * sap ) ] = APv[ oAP + ( ( kc - N + kp - 2 ) * sap ) ];
					APv[ oAP + ( ( kc - N + k - 2 ) * sap ) + 1 ] = APv[ oAP + ( ( kc - N + kp - 2 ) * sap ) + 1 ];
					APv[ oAP + ( ( kc - N + kp - 2 ) * sap ) ] = tempR;
					APv[ oAP + ( ( kc - N + kp - 2 ) * sap ) + 1 ] = tempI;
				}
			}

			k -= kstep;
			kc = kcnext;
		}
	}

	return info;
}


// EXPORTS //

export default zhptri;
