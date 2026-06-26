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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, no-var */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import zlarfg from '../../zlarfg/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zladiv from '../../zladiv/lib/base.js';


// VARIABLES //

var RZERO = 0.0;
var RONE = 1.0;
var HALF = 0.5;
var DAT1 = 3.0 / 4.0;
var KEXSH = 10;

var SAFMIN = dlamch( 'safe-minimum' );
var ULP = dlamch( 'precision' );

// Scratch Complex128Array buffers for zladiv calls:
var ZLADIV_X = new Complex128Array( 1 );
var ZLADIV_Y = new Complex128Array( 1 );
var ZLADIV_OUT = new Complex128Array( 1 );
var ZLADIV_Xv = reinterpret( ZLADIV_X, 0 );
var ZLADIV_Yv = reinterpret( ZLADIV_Y, 0 );
var ZLADIV_OUTv = reinterpret( ZLADIV_OUT, 0 );


// FUNCTIONS //

/**
* CABS1(z) = |Re(z)| + |Im(z)|.
*
* @private
* @param {Float64Array} v - interleaved Float64 view
* @param {integer} idx - Float64 index
* @returns {number} result
*/
function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}

/**
* CABS1 of a-b (difference of two complex numbers).
*
* @private
* @param {Float64Array} v - view
* @param {integer} idxA - index of first complex number
* @param {integer} idxB - index of second complex number
* @returns {number} |Re(a-b)| + |Im(a-b)|
*/
function cabs1diff( v, idxA, idxB ) {
	return Math.abs( v[ idxA ] - v[ idxB ] ) + Math.abs( v[ idxA + 1 ] - v[ idxB + 1 ] );
}

/**
* CABS1 of a complex number given as two doubles.
*
* @private
* @param {number} re - real part
* @param {number} im - imaginary part
* @returns {number} |re| + |im|
*/
function cabs1a( re, im ) {
	return Math.abs( re ) + Math.abs( im );
}

/**
* Complex multiply: (ar+ai_i)_(br+bi*i).
*
* @private
* @param {number} ar - real part of a
* @param {number} ai - imag part of a
* @param {number} br - real part of b
* @param {number} bi - imag part of b
* @param {Float64Array} out - [re, im]
*/
function cmul( ar, ai, br, bi, out ) {
	out[ 0 ] = ar * br - ai * bi;
	out[ 1 ] = ar * bi + ai * br;
}

/**
* Complex sqrt.
*
* @private
* @param {number} ar - real part
* @param {number} ai - imag part
* @param {Float64Array} out - [re, im]
*/
function csqrt( ar, ai, out ) {
	var r;
	var t;
	if ( ai === 0.0 ) {
		if ( ar >= 0.0 ) {
			out[ 0 ] = Math.sqrt( ar );
			out[ 1 ] = 0.0;
		} else {
			out[ 0 ] = 0.0;
			out[ 1 ] = Math.sqrt( -ar );
		}
		return;
	}
	r = Math.sqrt( ar * ar + ai * ai );
	t = Math.sqrt( ( Math.abs( ar ) + r ) / 2.0 );
	if ( ar >= 0.0 ) {
		out[ 0 ] = t;
		out[ 1 ] = ai / ( 2.0 * t );
	} else {
		out[ 0 ] = Math.abs( ai ) / ( 2.0 * t );
		out[ 1 ] = ( ai >= 0.0 ) ? t : -t;
	}
}


// MAIN //

/**
* Computes the eigenvalues and optionally the Schur factorization of an upper.
* Hessenberg matrix using the single-shift QR algorithm for complex matrices.
*
* All indices (ilo, ihi, iloz, ihiz) are 1-based (Fortran convention).
*
* @private
* @param {boolean} wantt - if true, compute full Schur form T
* @param {boolean} wantz - if true, compute Schur vectors Z
* @param {NonNegativeInteger} N - order of the matrix H
* @param {integer} ilo - first row/col of the active block (1-based)
* @param {integer} ihi - last row/col of the active block (1-based)
* @param {Complex128Array} H - upper Hessenberg matrix, modified in place
* @param {integer} strideH1 - stride of first dimension of H (complex elements)
* @param {integer} strideH2 - stride of second dimension of H (complex elements)
* @param {NonNegativeInteger} offsetH - starting index for H (complex elements)
* @param {Complex128Array} W - output eigenvalues
* @param {integer} strideW - stride for W (complex elements)
* @param {NonNegativeInteger} offsetW - starting index for W (complex elements)
* @param {integer} iloz - first row of Z to update (1-based)
* @param {integer} ihiz - last row of Z to update (1-based)
* @param {Complex128Array} Z - Schur vectors, modified if wantz is true
* @param {integer} strideZ1 - stride of first dimension of Z (complex elements)
* @param {integer} strideZ2 - stride of second dimension of Z (complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for Z (complex elements)
* @returns {integer} info - 0 on success, >0 if failed to converge
*/
function zlahqr( wantt, wantz, N, ilo, ihi, H, strideH1, strideH2, offsetH, W, strideW, offsetW, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ ) {
	var smlnum;
	var itmax;
	var kdefl;
	var rtemp;
	var info;
	var Hv;
	var Wv;
	var Zv;
	var sh1;
	var sh2;
	var sz1;
	var sz2;
	var sw;
	var oH;
	var oW;
	var oZ;
	var tst;
	var aa;
	var ab;
	var ba;
	var bb;
	var h10;
	var h21;
	var nh;
	var nz;
	var jlo;
	var jhi;
	var t1r;
	var t1i;
	var v2r;
	var v2i;
	var t2r;
	var t2i;
	var sumr;
	var sumi;
	var scr;
	var sci;
	var tempr;
	var tempi;
	var absc;
	var tr;
	var ti;
	var ur;
	var ui;
	var xr;
	var xi;
	var yr;
	var yi;
	var sx;
	var s;
	var temp;
	var VV;
	var vv;
	var tauBuf;
	var tauV;
	var scratch;
	var converged;
	var its;
	var h11sr;
	var h11si;
	var hkjr;
	var hkji;
	var hk1jr;
	var hk1ji;
	var i;
	var i1;
	var i2;
	var j;
	var k;
	var l;
	var m;

	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	Hv = reinterpret( H, 0 );
	Wv = reinterpret( W, 0 );
	sh1 = strideH1 * 2;
	sh2 = strideH2 * 2;
	oH = offsetH * 2;
	sw = strideW * 2;
	oW = offsetW * 2;

	if ( wantz ) {
		Zv = reinterpret( Z, 0 );
		sz1 = strideZ1 * 2;
		sz2 = strideZ2 * 2;
		oZ = offsetZ * 2;
	}

	if ( ilo === ihi ) {
		Wv[ oW + ( ilo - 1 ) * sw ] = Hv[ oH + ( ilo - 1 ) * sh1 + ( ilo - 1 ) * sh2 ];
		Wv[ oW + ( ilo - 1 ) * sw + 1 ] = Hv[ oH + ( ilo - 1 ) * sh1 + ( ilo - 1 ) * sh2 + 1 ];
		return 0;
	}

	// Clear sub-sub-diagonal
	for ( j = ilo; j <= ihi - 3; j++ ) {
		Hv[ oH + ( j + 1 ) * sh1 + ( j - 1 ) * sh2 ] = 0.0;
		Hv[ oH + ( j + 1 ) * sh1 + ( j - 1 ) * sh2 + 1 ] = 0.0;
		Hv[ oH + ( j + 2 ) * sh1 + ( j - 1 ) * sh2 ] = 0.0;
		Hv[ oH + ( j + 2 ) * sh1 + ( j - 1 ) * sh2 + 1 ] = 0.0;
	}
	if ( ilo <= ihi - 2 ) {
		Hv[ oH + ( ihi - 1 ) * sh1 + ( ihi - 3 ) * sh2 ] = 0.0;
		Hv[ oH + ( ihi - 1 ) * sh1 + ( ihi - 3 ) * sh2 + 1 ] = 0.0;
	}

	if ( wantt ) {
		jlo = 1;
		jhi = N;
	} else {
		jlo = ilo;
		jhi = ihi;
	}

	// Ensure subdiagonal elements are real
	for ( i = ilo + 1; i <= ihi; i++ ) {
		if ( Hv[ oH + ( i - 1 ) * sh1 + ( i - 2 ) * sh2 + 1 ] !== RZERO ) {
			temp = cabs1( Hv, oH + ( i - 1 ) * sh1 + ( i - 2 ) * sh2 );
			scr = Hv[ oH + ( i - 1 ) * sh1 + ( i - 2 ) * sh2 ] / temp;
			sci = -Hv[ oH + ( i - 1 ) * sh1 + ( i - 2 ) * sh2 + 1 ] / temp;
			absc = Math.sqrt( scr * scr + sci * sci );
			scr /= absc;
			sci /= absc;

			// Fortran: H( I, I-1 ) = ABS( H( I, I-1 ) ) — modulus, not CABS1
			Hv[ oH + ( i - 1 ) * sh1 + ( i - 2 ) * sh2 ] = Math.sqrt( Hv[ oH + ( i - 1 ) * sh1 + ( i - 2 ) * sh2 ] * Hv[ oH + ( i - 1 ) * sh1 + ( i - 2 ) * sh2 ] + Hv[ oH + ( i - 1 ) * sh1 + ( i - 2 ) * sh2 + 1 ] * Hv[ oH + ( i - 1 ) * sh1 + ( i - 2 ) * sh2 + 1 ] );
			Hv[ oH + ( i - 1 ) * sh1 + ( i - 2 ) * sh2 + 1 ] = 0.0;
			zscal( jhi - i + 1, new Complex128( scr, sci ), H, strideH2, offsetH + ( i - 1 ) * strideH1 + ( i - 1 ) * strideH2 );
			zscal( Math.min( jhi, i + 1 ) - jlo + 1, new Complex128( scr, -sci ), H, strideH1, offsetH + ( jlo - 1 ) * strideH1 + ( i - 1 ) * strideH2 );
			if ( wantz ) {
				zscal( ihiz - iloz + 1, new Complex128( scr, -sci ), Z, strideZ1, offsetZ + ( iloz - 1 ) * strideZ1 + ( i - 1 ) * strideZ2 );
			}
		}
	}

	nh = ihi - ilo + 1;
	nz = ihiz - iloz + 1;
	smlnum = SAFMIN * ( nh / ULP );

	if ( wantt ) {
		i1 = 1;
		i2 = N;
	}

	itmax = 30 * Math.max( 10, nh );
	kdefl = 0;

	VV = new Complex128Array( 2 );
	vv = reinterpret( VV, 0 );
	tauBuf = new Complex128Array( 1 );
	tauV = reinterpret( tauBuf, 0 );
	scratch = new Float64Array( 2 );

	i = ihi;

	while ( i >= ilo ) { // eslint-disable-line no-unmodified-loop-condition
		l = ilo;
		converged = false;

		for ( its = 0; its <= itmax; its++ ) {
			// Look for single small subdiagonal element
			for ( k = i; k >= l + 1; k-- ) {
				if ( cabs1( Hv, oH + ( k - 1 ) * sh1 + ( k - 2 ) * sh2 ) <= smlnum ) {
					break;
				}
				tst = cabs1( Hv, oH + ( k - 2 ) * sh1 + ( k - 2 ) * sh2 ) + cabs1( Hv, oH + ( k - 1 ) * sh1 + ( k - 1 ) * sh2 );
				if ( tst === RZERO ) {
					if ( k - 2 >= ilo ) {
						tst += Math.abs( Hv[ oH + ( k - 2 ) * sh1 + ( k - 3 ) * sh2 ] );
					}
					if ( k + 1 <= ihi ) {
						tst += Math.abs( Hv[ oH + k * sh1 + ( k - 1 ) * sh2 ] );
					}
				}
				if ( Math.abs( Hv[ oH + ( k - 1 ) * sh1 + ( k - 2 ) * sh2 ] ) <= ULP * tst ) {
					ab = Math.max( cabs1( Hv, oH + ( k - 1 ) * sh1 + ( k - 2 ) * sh2 ), cabs1( Hv, oH + ( k - 2 ) * sh1 + ( k - 1 ) * sh2 ) );
					ba = Math.min( cabs1( Hv, oH + ( k - 1 ) * sh1 + ( k - 2 ) * sh2 ), cabs1( Hv, oH + ( k - 2 ) * sh1 + ( k - 1 ) * sh2 ) );
					aa = Math.max( cabs1( Hv, oH + ( k - 1 ) * sh1 + ( k - 1 ) * sh2 ), cabs1diff( Hv, oH + ( k - 2 ) * sh1 + ( k - 2 ) * sh2, oH + ( k - 1 ) * sh1 + ( k - 1 ) * sh2 ) );
					bb = Math.min( cabs1( Hv, oH + ( k - 1 ) * sh1 + ( k - 1 ) * sh2 ), cabs1diff( Hv, oH + ( k - 2 ) * sh1 + ( k - 2 ) * sh2, oH + ( k - 1 ) * sh1 + ( k - 1 ) * sh2 ) );
					s = aa + ab;
					if ( ba * ( ab / s ) <= Math.max( smlnum, ULP * ( bb * ( aa / s ) ) ) ) {
						break;
					}
				}
			}
			l = k;

			if ( l > ilo ) {
				Hv[ oH + ( l - 1 ) * sh1 + ( l - 2 ) * sh2 ] = 0.0;
				Hv[ oH + ( l - 1 ) * sh1 + ( l - 2 ) * sh2 + 1 ] = 0.0;
			}

			if ( l >= i ) {
				converged = true;
				break;
			}

			kdefl += 1;

			if ( !wantt ) {
				i1 = l;
				i2 = i;
			}

			// Determine shift
			if ( ( kdefl % ( 2 * KEXSH ) ) === 0 ) {
				s = DAT1 * Math.abs( Hv[ oH + ( i - 1 ) * sh1 + ( i - 2 ) * sh2 ] );
				tr = s + Hv[ oH + ( i - 1 ) * sh1 + ( i - 1 ) * sh2 ];
				ti = Hv[ oH + ( i - 1 ) * sh1 + ( i - 1 ) * sh2 + 1 ];
			} else if ( ( kdefl % KEXSH ) === 0 ) {
				s = DAT1 * Math.abs( Hv[ oH + l * sh1 + ( l - 1 ) * sh2 ] );
				tr = s + Hv[ oH + ( l - 1 ) * sh1 + ( l - 1 ) * sh2 ];
				ti = Hv[ oH + ( l - 1 ) * sh1 + ( l - 1 ) * sh2 + 1 ];
			} else {
				// Wilkinson shift
				tr = Hv[ oH + ( i - 1 ) * sh1 + ( i - 1 ) * sh2 ];
				ti = Hv[ oH + ( i - 1 ) * sh1 + ( i - 1 ) * sh2 + 1 ];
				csqrt( Hv[ oH + ( i - 2 ) * sh1 + ( i - 1 ) * sh2 ], Hv[ oH + ( i - 2 ) * sh1 + ( i - 1 ) * sh2 + 1 ], scratch );
				ur = scratch[ 0 ];
				ui = scratch[ 1 ];
				csqrt( Hv[ oH + ( i - 1 ) * sh1 + ( i - 2 ) * sh2 ], 0.0, scratch );
				xr = scratch[ 0 ];
				xi = scratch[ 1 ];
				cmul( ur, ui, xr, xi, scratch );
				ur = scratch[ 0 ];
				ui = scratch[ 1 ];

				s = Math.abs( ur ) + Math.abs( ui );
				if ( s !== RZERO ) {
					xr = HALF * ( Hv[ oH + ( i - 2 ) * sh1 + ( i - 2 ) * sh2 ] - tr );
					xi = HALF * ( Hv[ oH + ( i - 2 ) * sh1 + ( i - 2 ) * sh2 + 1 ] - ti );
					sx = Math.abs( xr ) + Math.abs( xi );
					s = Math.max( s, sx );
					cmul( xr / s, xi / s, xr / s, xi / s, scratch );
					yr = scratch[ 0 ];
					yi = scratch[ 1 ];
					cmul( ur / s, ui / s, ur / s, ui / s, scratch );
					yr += scratch[ 0 ];
					yi += scratch[ 1 ];
					csqrt( yr, yi, scratch );
					yr = s * scratch[ 0 ];
					yi = s * scratch[ 1 ];

					if ( sx > RZERO ) {
						// Fortran: DBLE(X/SX)*DBLE(Y) + DIMAG(X/SX)*DIMAG(Y)
						// This is Re(conj(X/SX)*Y), i.e. a dot product, not Re(X/SX * Y)
						if ( ( xr / sx ) * yr + ( xi / sx ) * yi < RZERO ) {
							yr = -yr;
							yi = -yi;
						}
					}
					ZLADIV_Xv[ 0 ] = ur;
					ZLADIV_Xv[ 1 ] = ui;
					ZLADIV_Yv[ 0 ] = xr + yr;
					ZLADIV_Yv[ 1 ] = xi + yi;
					zladiv( ZLADIV_X, 0, ZLADIV_Y, 0, ZLADIV_OUT, 0 );
					cmul( ur, ui, ZLADIV_OUTv[ 0 ], ZLADIV_OUTv[ 1 ], scratch );
					tr -= scratch[ 0 ];
					ti -= scratch[ 1 ];
				}
			}

			// Look for two consecutive small subdiagonal elements
			for ( m = i - 1; m >= l + 1; m-- ) {
				h11sr = Hv[ oH + ( m - 1 ) * sh1 + ( m - 1 ) * sh2 ] - tr;
				h11si = Hv[ oH + ( m - 1 ) * sh1 + ( m - 1 ) * sh2 + 1 ] - ti;
				h21 = Hv[ oH + m * sh1 + ( m - 1 ) * sh2 ];
				s = cabs1a( h11sr, h11si ) + Math.abs( h21 );
				h11sr /= s;
				h11si /= s;
				h21 /= s;
				vv[ 0 ] = h11sr;
				vv[ 1 ] = h11si;
				vv[ 2 ] = h21;
				vv[ 3 ] = 0.0;
				h10 = Hv[ oH + ( m - 1 ) * sh1 + ( m - 2 ) * sh2 ];
				if ( Math.abs( h10 ) * Math.abs( h21 ) <= ULP * ( cabs1a( h11sr, h11si ) * ( cabs1( Hv, oH + ( m - 1 ) * sh1 + ( m - 1 ) * sh2 ) + cabs1( Hv, oH + m * sh1 + m * sh2 ) ) ) ) {
					break;
				}
			}
			if ( m === l ) {
				h11sr = Hv[ oH + ( l - 1 ) * sh1 + ( l - 1 ) * sh2 ] - tr;
				h11si = Hv[ oH + ( l - 1 ) * sh1 + ( l - 1 ) * sh2 + 1 ] - ti;
				h21 = Hv[ oH + l * sh1 + ( l - 1 ) * sh2 ];
				s = cabs1a( h11sr, h11si ) + Math.abs( h21 );
				h11sr /= s;
				h11si /= s;
				h21 /= s;
				vv[ 0 ] = h11sr;
				vv[ 1 ] = h11si;
				vv[ 2 ] = h21;
				vv[ 3 ] = 0.0;
			}

			// Single-shift QR step
			for ( k = m; k <= i - 1; k++ ) {
				if ( k > m ) {
					zcopy( 2, H, strideH1, offsetH + ( k - 1 ) * strideH1 + ( k - 2 ) * strideH2, VV, 1, 0 );
				}
				zlarfg( 2, VV, 0, VV, 1, 1, tauBuf, 0 );
				if ( k > m ) {
					Hv[ oH + ( k - 1 ) * sh1 + ( k - 2 ) * sh2 ] = vv[ 0 ];
					Hv[ oH + ( k - 1 ) * sh1 + ( k - 2 ) * sh2 + 1 ] = vv[ 1 ];
					Hv[ oH + k * sh1 + ( k - 2 ) * sh2 ] = 0.0;
					Hv[ oH + k * sh1 + ( k - 2 ) * sh2 + 1 ] = 0.0;
				}
				v2r = vv[ 2 ];
				v2i = vv[ 3 ];
				t1r = tauV[ 0 ];
				t1i = tauV[ 1 ];

				// T2 = DBLE( T1*V2 ) — T2 is real (the real part of T1*V2)
				t2r = t1r * v2r - t1i * v2i;
				t2i = 0.0;

				// Apply reflector from the left
				for ( j = k; j <= i2; j++ ) {
					hkjr = Hv[ oH + ( k - 1 ) * sh1 + ( j - 1 ) * sh2 ];
					hkji = Hv[ oH + ( k - 1 ) * sh1 + ( j - 1 ) * sh2 + 1 ];
					hk1jr = Hv[ oH + k * sh1 + ( j - 1 ) * sh2 ];
					hk1ji = Hv[ oH + k * sh1 + ( j - 1 ) * sh2 + 1 ];

					// SUM = conjg(T1)*H(K,J) + T2*H(K+1,J)
					sumr = ( t1r * hkjr + t1i * hkji ) + ( t2r * hk1jr - t2i * hk1ji );
					sumi = ( t1r * hkji - t1i * hkjr ) + ( t2r * hk1ji + t2i * hk1jr );
					Hv[ oH + ( k - 1 ) * sh1 + ( j - 1 ) * sh2 ] = hkjr - sumr;
					Hv[ oH + ( k - 1 ) * sh1 + ( j - 1 ) * sh2 + 1 ] = hkji - sumi;

					// H(K+1,J) -= SUM*V2
					Hv[ oH + k * sh1 + ( j - 1 ) * sh2 ] = hk1jr - ( sumr * v2r - sumi * v2i );
					Hv[ oH + k * sh1 + ( j - 1 ) * sh2 + 1 ] = hk1ji - ( sumr * v2i + sumi * v2r );
				}

				// Apply reflector from the right
				for ( j = i1; j <= Math.min( k + 2, i ); j++ ) {
					hkjr = Hv[ oH + ( j - 1 ) * sh1 + ( k - 1 ) * sh2 ];
					hkji = Hv[ oH + ( j - 1 ) * sh1 + ( k - 1 ) * sh2 + 1 ];
					hk1jr = Hv[ oH + ( j - 1 ) * sh1 + k * sh2 ];
					hk1ji = Hv[ oH + ( j - 1 ) * sh1 + k * sh2 + 1 ];

					// SUM = T1*H(J,K) + T2*H(J,K+1)
					sumr = ( t1r * hkjr - t1i * hkji ) + ( t2r * hk1jr - t2i * hk1ji );
					sumi = ( t1r * hkji + t1i * hkjr ) + ( t2r * hk1ji + t2i * hk1jr );
					Hv[ oH + ( j - 1 ) * sh1 + ( k - 1 ) * sh2 ] = hkjr - sumr;
					Hv[ oH + ( j - 1 ) * sh1 + ( k - 1 ) * sh2 + 1 ] = hkji - sumi;

					// H(J,K+1) -= SUM*conjg(V2)
					Hv[ oH + ( j - 1 ) * sh1 + k * sh2 ] = hk1jr - ( sumr * v2r + sumi * v2i );
					Hv[ oH + ( j - 1 ) * sh1 + k * sh2 + 1 ] = hk1ji - ( sumi * v2r - sumr * v2i );
				}

				if ( wantz ) {
					for ( j = iloz; j <= ihiz; j++ ) {
						hkjr = Zv[ oZ + ( j - 1 ) * sz1 + ( k - 1 ) * sz2 ];
						hkji = Zv[ oZ + ( j - 1 ) * sz1 + ( k - 1 ) * sz2 + 1 ];
						hk1jr = Zv[ oZ + ( j - 1 ) * sz1 + k * sz2 ];
						hk1ji = Zv[ oZ + ( j - 1 ) * sz1 + k * sz2 + 1 ];
						sumr = ( t1r * hkjr - t1i * hkji ) + ( t2r * hk1jr - t2i * hk1ji );
						sumi = ( t1r * hkji + t1i * hkjr ) + ( t2r * hk1ji + t2i * hk1jr );
						Zv[ oZ + ( j - 1 ) * sz1 + ( k - 1 ) * sz2 ] = hkjr - sumr;
						Zv[ oZ + ( j - 1 ) * sz1 + ( k - 1 ) * sz2 + 1 ] = hkji - sumi;
						Zv[ oZ + ( j - 1 ) * sz1 + k * sz2 ] = hk1jr - ( sumr * v2r + sumi * v2i );
						Zv[ oZ + ( j - 1 ) * sz1 + k * sz2 + 1 ] = hk1ji - ( sumi * v2r - sumr * v2i );
					}
				}

				if ( k === m && m > l ) {
					tempr = RONE - t1r;
					tempi = -t1i;
					absc = Math.sqrt( tempr * tempr + tempi * tempi );
					tempr /= absc;
					tempi /= absc;
					cmul( Hv[ oH + m * sh1 + ( m - 1 ) * sh2 ], Hv[ oH + m * sh1 + ( m - 1 ) * sh2 + 1 ], tempr, -tempi, scratch );
					Hv[ oH + m * sh1 + ( m - 1 ) * sh2 ] = scratch[ 0 ];
					Hv[ oH + m * sh1 + ( m - 1 ) * sh2 + 1 ] = scratch[ 1 ];
					if ( m + 2 <= i ) {
						cmul( Hv[ oH + ( m + 1 ) * sh1 + m * sh2 ], Hv[ oH + ( m + 1 ) * sh1 + m * sh2 + 1 ], tempr, tempi, scratch );
						Hv[ oH + ( m + 1 ) * sh1 + m * sh2 ] = scratch[ 0 ];
						Hv[ oH + ( m + 1 ) * sh1 + m * sh2 + 1 ] = scratch[ 1 ];
					}
					for ( j = m; j <= i; j++ ) {
						if ( j !== m + 1 ) {
							if ( i2 > j ) {
								zscal( i2 - j, new Complex128( tempr, tempi ), H, strideH2, offsetH + ( j - 1 ) * strideH1 + j * strideH2 );
							}
							zscal( j - i1, new Complex128( tempr, -tempi ), H, strideH1, offsetH + ( i1 - 1 ) * strideH1 + ( j - 1 ) * strideH2 );
							if ( wantz ) {
								zscal( nz, new Complex128( tempr, -tempi ), Z, strideZ1, offsetZ + ( iloz - 1 ) * strideZ1 + ( j - 1 ) * strideZ2 );
							}
						}
					}
				}
			}

			// Ensure H(I,I-1) is real
			tempr = Hv[ oH + ( i - 1 ) * sh1 + ( i - 2 ) * sh2 ];
			tempi = Hv[ oH + ( i - 1 ) * sh1 + ( i - 2 ) * sh2 + 1 ];
			if ( tempi !== RZERO ) {
				rtemp = Math.sqrt( tempr * tempr + tempi * tempi );
				Hv[ oH + ( i - 1 ) * sh1 + ( i - 2 ) * sh2 ] = rtemp;
				Hv[ oH + ( i - 1 ) * sh1 + ( i - 2 ) * sh2 + 1 ] = 0.0;
				tempr /= rtemp;
				tempi /= rtemp;
				if ( i2 > i ) {
					zscal( i2 - i, new Complex128( tempr, -tempi ), H, strideH2, offsetH + ( i - 1 ) * strideH1 + i * strideH2 );
				}
				zscal( i - i1, new Complex128( tempr, tempi ), H, strideH1, offsetH + ( i1 - 1 ) * strideH1 + ( i - 1 ) * strideH2 );
				if ( wantz ) {
					zscal( nz, new Complex128( tempr, tempi ), Z, strideZ1, offsetZ + ( iloz - 1 ) * strideZ1 + ( i - 1 ) * strideZ2 );
				}
			}
		}

		if ( !converged ) {
			info = i;
			return info;
		}

		// Eigenvalue found
		Wv[ oW + ( i - 1 ) * sw ] = Hv[ oH + ( i - 1 ) * sh1 + ( i - 1 ) * sh2 ];
		Wv[ oW + ( i - 1 ) * sw + 1 ] = Hv[ oH + ( i - 1 ) * sh1 + ( i - 1 ) * sh2 + 1 ];
		kdefl = 0;
		i = l - 1;
	}

	return 0;
}


// EXPORTS //

export default zlahqr;
