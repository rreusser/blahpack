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
import zdotu from '../../../../blas/base/zdotu/lib/base.js';
import zspmv from '../../../../lapack/base/zspmv/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';


// VARIABLES //

var NCONE = new Complex128( -1.0, 0.0 );
var CZERO = new Complex128( 0.0, 0.0 );


// FUNCTIONS //

/**
* Computes the in-place complex reciprocal at a given index.
*
* Uses Smith's formula for numerical stability.
*
* @private
* @param {Float64Array} arr - interleaved complex data
* @param {NonNegativeInteger} idx - Float64 index of the real part
*/
function invertAt( arr, idx ) {
	var ar;
	var ai;
	var d;
	var r;

	ar = arr[ idx ];
	ai = arr[ idx + 1 ];
	if ( Math.abs( ai ) <= Math.abs( ar ) ) {
		r = ai / ar;
		d = ar + ( ai * r );
		arr[ idx ] = 1.0 / d;
		arr[ idx + 1 ] = -r / d;
	} else {
		r = ar / ai;
		d = ai + ( ar * r );
		arr[ idx ] = r / d;
		arr[ idx + 1 ] = -1.0 / d;
	}
}

/**
* Computes inline complex division of two complex numbers.
*
* Returns result as a two-element array containing the real and imaginary parts.
*
* @private
* @param {number} ar - real part of numerator
* @param {number} ai - imaginary part of numerator
* @param {number} br - real part of denominator
* @param {number} bi - imaginary part of denominator
* @returns {Array} two-element array containing real and imaginary parts
*/
function cdiv( ar, ai, br, bi ) {
	var r;
	var d;

	if ( Math.abs( bi ) <= Math.abs( br ) ) {
		r = bi / br;
		d = br + ( bi * r );
		return [ ( ar + ( ai * r ) ) / d, ( ai - ( ar * r ) ) / d ];
	}
	r = br / bi;
	d = bi + ( br * r );
	return [ ( ( ar * r ) + ai ) / d, ( ( ai * r ) - ar ) / d ];
}


// MAIN //

/**
* Computes the inverse of a complex symmetric matrix in packed storage using the factorization `A = U * D * U^T` or `A = L * D * L^T` computed by `zsptrf`.
*
* ## Notes
*
* -   IPIV is 0-based. Negative values encode 2x2 pivot blocks via bitwise NOT (`~p`).
* -   AP is a Complex128Array of length `N*(N+1)/2` in packed format.
* -   WORK is a Complex128Array of length `N`.
* -   Returns INFO: 0 = success, k > 0 = `D(k,k)` is zero (1-based).
* -   Symmetric (NOT Hermitian): uses zdotu (no conjugation), zspmv, and no conjugation in swaps.
*
* @private
* @param {string} uplo - specifies whether upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} AP - packed symmetric matrix (overwritten with inverse)
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @param {Int32Array} IPIV - pivot indices from zsptrf
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
* var AP = new Complex128Array( [ 4.0, 2.0 ] );
* var IPIV = new Int32Array( [ 0 ] );
* var WORK = new Complex128Array( 1 );
*
* var info = zsptri( 'upper', 1, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
* // returns 0
*/
function zsptri( uplo, N, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	var akkp1R;
	var akkp1I;
	var kcnext;
	var kstep;
	var tempR;
	var tempI;
	var akp1R;
	var akp1I;
	var mulR;
	var mulI;
	var dotu;
	var info;
	var APv;
	var sap;
	var oAP;
	var npp;
	var kpc;
	var akR;
	var akI;
	var tR;
	var tI;
	var dR;
	var dI;
	var kp;
	var kx;
	var kc;
	var ip;
	var rv;
	var j;
	var k;
	var p;
	var q;

	// All internal indices (k, kc, kcnext, kpc, kx, kp) use 1-based Fortran convention.

	// APv is the Float64 reinterpretation; positions are 0-based Float64 indices.

	// Computed as: oAP + (pos - 1) * sap, where pos is 1-based complex position.

	APv = reinterpret( AP, 0 );
	sap = strideAP * 2;
	oAP = offsetAP * 2;
	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	// Check that the diagonal of D is non-zero (singularity check)
	if ( uplo === 'upper' ) {
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

	if ( uplo === 'upper' ) {
		// Compute inv(A) from the factorization A = U*D*U^T
		k = 1;
		kc = 1;

		while ( k <= N ) {
			kcnext = kc + k;

			ip = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
			if ( ip >= 0 ) {
				// 1x1 pivot block: invert the diagonal (complex reciprocal)
				p = oAP + ( ( kc + k - 2 ) * sap );
				invertAt( APv, p );

				if ( k > 1 ) {
					zcopy( k - 1, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ), WORK, strideWORK, offsetWORK );
					zspmv( uplo, k - 1, NCONE, AP, strideAP, offsetAP, WORK, strideWORK, offsetWORK, CZERO, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ) );
					dotu = zdotu( k - 1, WORK, strideWORK, offsetWORK, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ) );
					APv[ p ] -= real( dotu );
					APv[ p + 1 ] -= imag( dotu );
				}
				kstep = 1;
			} else {
				// 2x2 pivot block: invert the 2x2 diagonal block
				// T = AP(kcnext+k-1) (complex value, NOT abs)
				p = oAP + ( ( kcnext + k - 2 ) * sap );
				tR = APv[ p ];
				tI = APv[ p + 1 ];

				// AK = AP(kc+k-1) / T
				rv = cdiv( APv[ oAP + ( ( kc + k - 2 ) * sap ) ], APv[ oAP + ( ( kc + k - 2 ) * sap ) + 1 ], tR, tI );
				akR = rv[ 0 ];
				akI = rv[ 1 ];

				// AKP1 = AP(kcnext+k) / T
				rv = cdiv( APv[ oAP + ( ( kcnext + k - 1 ) * sap ) ], APv[ oAP + ( ( kcnext + k - 1 ) * sap ) + 1 ], tR, tI );
				akp1R = rv[ 0 ];
				akp1I = rv[ 1 ];

				// AKKP1 = AP(kcnext+k-1) / T = 1+0i
				akkp1R = 1.0;
				akkp1I = 0.0;

				// D = T * (AK*AKP1 - 1)
				mulR = ( ( akR * akp1R ) - ( akI * akp1I ) ) - 1.0;
				mulI = ( akR * akp1I ) + ( akI * akp1R );
				dR = ( tR * mulR ) - ( tI * mulI );
				dI = ( tR * mulI ) + ( tI * mulR );

				// AP(kc+k-1) = AKP1 / D
				rv = cdiv( akp1R, akp1I, dR, dI );
				APv[ oAP + ( ( kc + k - 2 ) * sap ) ] = rv[ 0 ];
				APv[ oAP + ( ( kc + k - 2 ) * sap ) + 1 ] = rv[ 1 ];

				// AP(kcnext+k) = AK / D
				rv = cdiv( akR, akI, dR, dI );
				APv[ oAP + ( ( kcnext + k - 1 ) * sap ) ] = rv[ 0 ];
				APv[ oAP + ( ( kcnext + k - 1 ) * sap ) + 1 ] = rv[ 1 ];

				// AP(kcnext+k-1) = -AKKP1 / D
				rv = cdiv( -akkp1R, -akkp1I, dR, dI );
				APv[ oAP + ( ( kcnext + k - 2 ) * sap ) ] = rv[ 0 ];
				APv[ oAP + ( ( kcnext + k - 2 ) * sap ) + 1 ] = rv[ 1 ];

				if ( k > 1 ) {
					// Process column k
					zcopy( k - 1, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ), WORK, strideWORK, offsetWORK );
					zspmv( uplo, k - 1, NCONE, AP, strideAP, offsetAP, WORK, strideWORK, offsetWORK, CZERO, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ) );

					p = oAP + ( ( kc + k - 2 ) * sap );
					dotu = zdotu( k - 1, WORK, strideWORK, offsetWORK, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ) );
					APv[ p ] -= real( dotu );
					APv[ p + 1 ] -= imag( dotu );

					// AP(kcnext+k-1) -= ZDOTU(AP col k, AP col k+1)
					dotu = zdotu( k - 1, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ), AP, strideAP, offsetAP + ( ( kcnext - 1 ) * strideAP ) );
					p = oAP + ( ( kcnext + k - 2 ) * sap );
					APv[ p ] -= real( dotu );
					APv[ p + 1 ] -= imag( dotu );

					// Process column k+1
					zcopy( k - 1, AP, strideAP, offsetAP + ( ( kcnext - 1 ) * strideAP ), WORK, strideWORK, offsetWORK );
					zspmv( uplo, k - 1, NCONE, AP, strideAP, offsetAP, WORK, strideWORK, offsetWORK, CZERO, AP, strideAP, offsetAP + ( ( kcnext - 1 ) * strideAP ) );

					dotu = zdotu( k - 1, WORK, strideWORK, offsetWORK, AP, strideAP, offsetAP + ( ( kcnext - 1 ) * strideAP ) );
					p = oAP + ( ( kcnext + k - 1 ) * sap );
					APv[ p ] -= real( dotu );
					APv[ p + 1 ] -= imag( dotu );
				}
				kstep = 2;
				kcnext += k + 1;
			}

			// Interchange rows and columns kp and k (NO conjugation for symmetric)
			kp = ( ip >= 0 ) ? ip + 1 : ( ~ip ) + 1; // 0-based IPIV -> 1-based kp
			if ( kp !== k ) {
				kpc = ( ( ( kp - 1 ) * kp / 2 )|0 ) + 1;

				// Swap elements 1..kp-1 of columns k and kp
				zswap( kp - 1, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ), AP, strideAP, offsetAP + ( ( kpc - 1 ) * strideAP ) );

				// Swap elements between rows kp+1..k-1 (NO conjugation)
				kx = kpc + kp - 1;
				for ( j = kp + 1; j <= k - 1; j += 1 ) {
					kx += j - 1;
					p = oAP + ( ( kc + j - 2 ) * sap );
					q = oAP + ( ( kx - 1 ) * sap );
					tempR = APv[ p ];
					tempI = APv[ p + 1 ];
					APv[ p ] = APv[ q ];
					APv[ p + 1 ] = APv[ q + 1 ];
					APv[ q ] = tempR;
					APv[ q + 1 ] = tempI;
				}

				// Swap diagonal elements
				p = oAP + ( ( kc + k - 2 ) * sap );
				q = oAP + ( ( kpc + kp - 2 ) * sap );
				tempR = APv[ p ];
				tempI = APv[ p + 1 ];
				APv[ p ] = APv[ q ];
				APv[ p + 1 ] = APv[ q + 1 ];
				APv[ q ] = tempR;
				APv[ q + 1 ] = tempI;

				if ( kstep === 2 ) {
					p = oAP + ( ( kc + k + k - 2 ) * sap );
					q = oAP + ( ( kc + k + kp - 2 ) * sap );
					tempR = APv[ p ];
					tempI = APv[ p + 1 ];
					APv[ p ] = APv[ q ];
					APv[ p + 1 ] = APv[ q + 1 ];
					APv[ q ] = tempR;
					APv[ q + 1 ] = tempI;
				}
			}

			k += kstep;
			kc = kcnext;
		}
	} else {
		// Lower triangle: compute inv(A) from A = L*D*L^T
		npp = ( ( N * ( N + 1 ) / 2 )|0 );
		k = N;
		kc = npp;

		while ( k >= 1 ) {
			kcnext = kc - ( N - k + 2 );

			ip = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
			if ( ip >= 0 ) {
				// 1x1 pivot block: invert the diagonal (complex reciprocal)
				p = oAP + ( ( kc - 1 ) * sap );
				invertAt( APv, p );

				if ( k < N ) {
					zcopy( N - k, AP, strideAP, offsetAP + ( kc * strideAP ), WORK, strideWORK, offsetWORK );
					zspmv( uplo, N - k, NCONE, AP, strideAP, offsetAP + ( ( kc + N - k ) * strideAP ), WORK, strideWORK, offsetWORK, CZERO, AP, strideAP, offsetAP + ( kc * strideAP ) );
					dotu = zdotu( N - k, WORK, strideWORK, offsetWORK, AP, strideAP, offsetAP + ( kc * strideAP ) );
					APv[ p ] -= real( dotu );
					APv[ p + 1 ] -= imag( dotu );
				}
				kstep = 1;
			} else {
				// 2x2 pivot block: invert the 2x2 diagonal block
				// T = AP(kcnext+1) (complex value)
				p = oAP + ( kcnext * sap );
				tR = APv[ p ];
				tI = APv[ p + 1 ];

				// AK = AP(kcnext) / T
				rv = cdiv( APv[ oAP + ( ( kcnext - 1 ) * sap ) ], APv[ oAP + ( ( kcnext - 1 ) * sap ) + 1 ], tR, tI );
				akR = rv[ 0 ];
				akI = rv[ 1 ];

				// AKP1 = AP(kc) / T
				rv = cdiv( APv[ oAP + ( ( kc - 1 ) * sap ) ], APv[ oAP + ( ( kc - 1 ) * sap ) + 1 ], tR, tI );
				akp1R = rv[ 0 ];
				akp1I = rv[ 1 ];

				// AKKP1 = AP(kcnext+1) / T = 1+0i
				akkp1R = 1.0;
				akkp1I = 0.0;

				// D = T * (AK*AKP1 - 1)
				mulR = ( ( akR * akp1R ) - ( akI * akp1I ) ) - 1.0;
				mulI = ( akR * akp1I ) + ( akI * akp1R );
				dR = ( tR * mulR ) - ( tI * mulI );
				dI = ( tR * mulI ) + ( tI * mulR );

				// AP(kcnext) = AKP1 / D
				rv = cdiv( akp1R, akp1I, dR, dI );
				APv[ oAP + ( ( kcnext - 1 ) * sap ) ] = rv[ 0 ];
				APv[ oAP + ( ( kcnext - 1 ) * sap ) + 1 ] = rv[ 1 ];

				// AP(kc) = AK / D
				rv = cdiv( akR, akI, dR, dI );
				APv[ oAP + ( ( kc - 1 ) * sap ) ] = rv[ 0 ];
				APv[ oAP + ( ( kc - 1 ) * sap ) + 1 ] = rv[ 1 ];

				// AP(kcnext+1) = -AKKP1 / D
				rv = cdiv( -akkp1R, -akkp1I, dR, dI );
				APv[ oAP + ( kcnext * sap ) ] = rv[ 0 ];
				APv[ oAP + ( kcnext * sap ) + 1 ] = rv[ 1 ];

				if ( k < N ) {
					// Process column k
					zcopy( N - k, AP, strideAP, offsetAP + ( kc * strideAP ), WORK, strideWORK, offsetWORK );
					zspmv( uplo, N - k, NCONE, AP, strideAP, offsetAP + ( ( kc + N - k ) * strideAP ), WORK, strideWORK, offsetWORK, CZERO, AP, strideAP, offsetAP + ( kc * strideAP ) );

					dotu = zdotu( N - k, WORK, strideWORK, offsetWORK, AP, strideAP, offsetAP + ( kc * strideAP ) );
					p = oAP + ( ( kc - 1 ) * sap );
					APv[ p ] -= real( dotu );
					APv[ p + 1 ] -= imag( dotu );

					// AP(kcnext+1) -= ZDOTU(AP col k, AP col k-1)
					dotu = zdotu( N - k, AP, strideAP, offsetAP + ( kc * strideAP ), AP, strideAP, offsetAP + ( ( kcnext + 1 ) * strideAP ) );
					p = oAP + ( kcnext * sap );
					APv[ p ] -= real( dotu );
					APv[ p + 1 ] -= imag( dotu );

					// Process column k-1
					zcopy( N - k, AP, strideAP, offsetAP + ( ( kcnext + 1 ) * strideAP ), WORK, strideWORK, offsetWORK );
					zspmv( uplo, N - k, NCONE, AP, strideAP, offsetAP + ( ( kc + N - k ) * strideAP ), WORK, strideWORK, offsetWORK, CZERO, AP, strideAP, offsetAP + ( ( kcnext + 1 ) * strideAP ) );

					dotu = zdotu( N - k, WORK, strideWORK, offsetWORK, AP, strideAP, offsetAP + ( ( kcnext + 1 ) * strideAP ) );
					p = oAP + ( ( kcnext - 1 ) * sap );
					APv[ p ] -= real( dotu );
					APv[ p + 1 ] -= imag( dotu );
				}
				kstep = 2;
				kcnext -= ( N - k + 3 );
			}

			// Interchange rows and columns kp and k (NO conjugation for symmetric)
			kp = ( ip >= 0 ) ? ip + 1 : ( ~ip ) + 1; // 0-based IPIV -> 1-based kp
			if ( kp !== k ) {
				kpc = npp - ( ( ( N - kp + 1 ) * ( N - kp + 2 ) / 2 )|0 ) + 1;

				if ( kp < N ) {
					zswap( N - kp, AP, strideAP, offsetAP + ( ( kc + kp - k ) * strideAP ), AP, strideAP, offsetAP + ( kpc * strideAP ) );
				}

				// Swap elements between rows k+1..kp-1 (NO conjugation)
				kx = kc + kp - k;
				for ( j = k + 1; j <= kp - 1; j += 1 ) {
					kx += N - j + 1;
					p = oAP + ( ( kc + j - k - 1 ) * sap );
					q = oAP + ( ( kx - 1 ) * sap );
					tempR = APv[ p ];
					tempI = APv[ p + 1 ];
					APv[ p ] = APv[ q ];
					APv[ p + 1 ] = APv[ q + 1 ];
					APv[ q ] = tempR;
					APv[ q + 1 ] = tempI;
				}

				// Swap diagonal elements
				p = oAP + ( ( kc - 1 ) * sap );
				q = oAP + ( ( kpc - 1 ) * sap );
				tempR = APv[ p ];
				tempI = APv[ p + 1 ];
				APv[ p ] = APv[ q ];
				APv[ p + 1 ] = APv[ q + 1 ];
				APv[ q ] = tempR;
				APv[ q + 1 ] = tempI;

				if ( kstep === 2 ) {
					p = oAP + ( ( kc - N + k - 2 ) * sap );
					q = oAP + ( ( kc - N + kp - 2 ) * sap );
					tempR = APv[ p ];
					tempI = APv[ p + 1 ];
					APv[ p ] = APv[ q ];
					APv[ p + 1 ] = APv[ q + 1 ];
					APv[ q ] = tempR;
					APv[ q + 1 ] = tempI;
				}
			}

			k -= kstep;
			kc = kcnext;
		}
	}

	return info;
}


// EXPORTS //

export default zsptri;
