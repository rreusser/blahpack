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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import zlaqr1 from '../../zlaqr1/lib/base.js';
import zlarfg from '../../zlarfg/lib/base.js';
import zlaset from '../../zlaset/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';


// VARIABLES //

var CZERO = new Complex128( 0.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );
var SAFMIN = dlamch( 'safe-minimum' );
var ULP = dlamch( 'precision' );


// FUNCTIONS //

/**
* CABS1(z) = |Re(z)| + |Im(z)| at a Float64 index.
*
* @private
*/
function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}

/**
* Get element from 2D complex array (1-based row i, col j).
*
* @private
* @returns {Array} [re, im]
*/
function cget( v, s1, s2, o, i, j ) {
	var idx = o + ( i - 1 ) * s1 + ( j - 1 ) * s2;
	return [ v[ idx ], v[ idx + 1 ] ];
}

/**
* Set element of 2D complex array (1-based row i, col j).
*
* @private
*/
function cset( v, s1, s2, o, i, j, re, im ) {
	var idx = o + ( i - 1 ) * s1 + ( j - 1 ) * s2;
	v[ idx ] = re;
	v[ idx + 1 ] = im;
}


// MAIN //

/**
* Performs a complex multi-shift QR sweep on an upper Hessenberg matrix.
*
* All indices (ktop, kbot, iloz, ihiz) are 1-based (Fortran convention).
*
* @private
*/
function zlaqr5( wantt, wantz, kacc22, N, ktop, kbot, nshfts, s, strideS, offsetS, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, V, strideV1, strideV2, offsetV, U, strideU1, strideU2, offsetU, nv, WV, strideWV1, strideWV2, offsetWV, nh, WH, strideWH1, strideWH2, offsetWH ) {
	var smlnum;
	var accum;
	var bmp22;
	var nbmps;
	var ndcol;
	var krcol;
	var incol;
	var mtop;
	var mbot;
	var jtop;
	var jbot;
	var jlen;
	var jcol;
	var jrow;
	var refR;
	var refI;
	var tst1;
	var tst2;
	var h11;
	var h12;
	var h21;
	var h22;
	var scl;
	var dR;
	var dI;
	var aa;
	var kdu;
	var kms;
	var m22;
	var ns;
	var nu;
	var k1;
	var i2;
	var i4;
	var Hv;
	var Zv;
	var Vv;
	var Uv;
	var VTca;
	var VT;
	var betaCA;
	var betaV;
	var tauCA;
	var tauV;
	var alphaCA;
	var alphaV;
	var t1R;
	var t1I;
	var t2R;
	var t2I;
	var t3R;
	var t3I;
	var sH1;
	var sH2;
	var oH;
	var sZ1;
	var sZ2;
	var oZ;
	var sV1;
	var sV2;
	var oV;
	var sU1;
	var sU2;
	var oU;
	var j;
	var k;
	var m;

	// Quick return
	if ( nshfts < 2 ) {
		return;
	}
	if ( ktop >= kbot ) {
		return;
	}

	// Round down NSHFTS to nearest even
	ns = nshfts - ( nshfts % 2 );

	smlnum = SAFMIN * ( N / ULP );

	accum = ( kacc22 === 1 ) || ( kacc22 === 2 );

	// Reinterpret complex arrays to Float64
	Hv = reinterpret( H, 0 );
	sH1 = strideH1 * 2;
	sH2 = strideH2 * 2;
	oH = offsetH * 2;

	if ( wantz ) {
		Zv = reinterpret( Z, 0 );
		sZ1 = strideZ1 * 2;
		sZ2 = strideZ2 * 2;
		oZ = offsetZ * 2;
	}

	Vv = reinterpret( V, 0 );
	sV1 = strideV1 * 2;
	sV2 = strideV2 * 2;
	oV = offsetV * 2;

	Uv = reinterpret( U, 0 );
	sU1 = strideU1 * 2;
	sU2 = strideU2 * 2;
	oU = offsetU * 2;

	// Scratch for VT(3), beta, tau, alpha
	VTca = new Complex128Array( 3 );
	VT = reinterpret( VTca, 0 );
	betaCA = new Complex128Array( 1 );
	betaV = reinterpret( betaCA, 0 );
	tauCA = new Complex128Array( 1 );
	tauV = reinterpret( tauCA, 0 );
	alphaCA = new Complex128Array( 1 );
	alphaV = reinterpret( alphaCA, 0 );

	// Clear H(KTOP+2, KTOP) if applicable
	if ( ktop + 2 <= kbot ) {
		cset( Hv, sH1, sH2, oH, ktop + 2, ktop, 0.0, 0.0 );
	}

	nbmps = ns / 2;
	kdu = 4 * nbmps;

	// Main sweep loop
	for ( incol = ktop - 2 * nbmps + 1; incol <= kbot - 2; incol += 2 * nbmps ) {
		if ( accum ) {
			jtop = Math.max( ktop, incol );
		} else if ( wantt ) {
			jtop = 1;
		} else {
			jtop = ktop;
		}

		ndcol = incol + kdu;
		if ( accum ) {
			zlaset( 'ALL', kdu, kdu, CZERO, CONE, U, strideU1, strideU2, offsetU );
		}

		// Inner loop over reflector columns
		for ( krcol = incol; krcol <= Math.min( incol + 2 * nbmps - 1, kbot - 2 ); krcol++ ) {
			mtop = Math.max( 1, Math.floor( ( ktop - krcol ) / 2 ) + 1 );
			mbot = Math.min( nbmps, Math.floor( ( kbot - krcol - 1 ) / 2 ) );
			m22 = mbot + 1;
			bmp22 = ( mbot < nbmps ) && ( krcol + 2 * ( m22 - 1 ) === kbot - 2 );

			// Process the 2x2 bump at the bottom if needed
			if ( bmp22 ) {
				k = krcol + 2 * ( m22 - 1 );
				if ( k === ktop - 1 ) {
					zlaqr1( 2, H, strideH1, strideH2, offsetH + k * strideH1 + k * strideH2,
						s.get( ( 2 * m22 - 2 ) + offsetS ), s.get( ( 2 * m22 - 1 ) + offsetS ),
						V, strideV1, offsetV + ( m22 - 1 ) * strideV2 );
					betaV[ 0 ] = Vv[ oV + ( m22 - 1 ) * sV2 ];
					betaV[ 1 ] = Vv[ oV + ( m22 - 1 ) * sV2 + 1 ];
					zlarfg( 2, betaCA, 0, V, strideV1, offsetV + strideV1 + ( m22 - 1 ) * strideV2, tauCA, 0 );

					// V(1, M22) = tau
					Vv[ oV + ( m22 - 1 ) * sV2 ] = tauV[ 0 ];
					Vv[ oV + ( m22 - 1 ) * sV2 + 1 ] = tauV[ 1 ];
				} else {
					betaV[ 0 ] = Hv[ oH + k * sH1 + ( k - 1 ) * sH2 ];
					betaV[ 1 ] = Hv[ oH + k * sH1 + ( k - 1 ) * sH2 + 1 ];
					Vv[ oV + sV1 + ( m22 - 1 ) * sV2 ] = Hv[ oH + ( k + 1 ) * sH1 + ( k - 1 ) * sH2 ];
					Vv[ oV + sV1 + ( m22 - 1 ) * sV2 + 1 ] = Hv[ oH + ( k + 1 ) * sH1 + ( k - 1 ) * sH2 + 1 ];
					zlarfg( 2, betaCA, 0, V, strideV1, offsetV + strideV1 + ( m22 - 1 ) * strideV2, tauCA, 0 );
					Vv[ oV + ( m22 - 1 ) * sV2 ] = tauV[ 0 ];
					Vv[ oV + ( m22 - 1 ) * sV2 + 1 ] = tauV[ 1 ];
					Hv[ oH + k * sH1 + ( k - 1 ) * sH2 ] = betaV[ 0 ];
					Hv[ oH + k * sH1 + ( k - 1 ) * sH2 + 1 ] = betaV[ 1 ];
					cset( Hv, sH1, sH2, oH, k + 2, k, 0.0, 0.0 );
				}

				// Apply 2x2 reflector to columns
				t1R = Vv[ oV + ( m22 - 1 ) * sV2 ];
				t1I = Vv[ oV + ( m22 - 1 ) * sV2 + 1 ];

				// V(2, M22)
				var v2mR = Vv[ oV + sV1 + ( m22 - 1 ) * sV2 ]; // eslint-disable-line no-var
				var v2mI = Vv[ oV + sV1 + ( m22 - 1 ) * sV2 + 1 ]; // eslint-disable-line no-var

				// T2 = T1*CONJ(V(2,M22))
				t2R = t1R * v2mR + t1I * v2mI;
				t2I = t1I * v2mR - t1R * v2mI;

				// Apply from right (column update)
				for ( j = jtop; j <= Math.min( kbot, k + 3 ); j++ ) {
					var hjk1 = cget( Hv, sH1, sH2, oH, j, k + 1 ); // eslint-disable-line no-var
					var hjk2 = cget( Hv, sH1, sH2, oH, j, k + 2 ); // eslint-disable-line no-var

					// REFSUM = H(J,K+1) + V(2,M22)*H(J,K+2)
					refR = hjk1[ 0 ] + ( v2mR * hjk2[ 0 ] - v2mI * hjk2[ 1 ] );
					refI = hjk1[ 1 ] + ( v2mR * hjk2[ 1 ] + v2mI * hjk2[ 0 ] );

					// H(J,K+1) = H(J,K+1) - REFSUM*T1
					cset( Hv, sH1, sH2, oH, j, k + 1, hjk1[ 0 ] - ( refR * t1R - refI * t1I ), hjk1[ 1 ] - ( refR * t1I + refI * t1R ) );

					// H(J,K+2) = H(J,K+2) - REFSUM*T2
					cset( Hv, sH1, sH2, oH, j, k + 2, hjk2[ 0 ] - ( refR * t2R - refI * t2I ), hjk2[ 1 ] - ( refR * t2I + refI * t2R ) );
				}

				// Apply from left (row update)
				if ( accum ) {
					jbot = Math.min( ndcol, kbot );
				} else if ( wantt ) {
					jbot = N;
				} else {
					jbot = kbot;
				}
				// CONJ(V(1,M22))
				t1R = Vv[ oV + ( m22 - 1 ) * sV2 ];
				t1I = -Vv[ oV + ( m22 - 1 ) * sV2 + 1 ];
				t2R = t1R * v2mR - t1I * v2mI;
				t2I = t1R * v2mI + t1I * v2mR;

				for ( j = k + 1; j <= jbot; j++ ) {
					var hk1j = cget( Hv, sH1, sH2, oH, k + 1, j ); // eslint-disable-line no-var
					var hk2j = cget( Hv, sH1, sH2, oH, k + 2, j ); // eslint-disable-line no-var

					// REFSUM = H(K+1,J) + CONJ(V(2,M22))*H(K+2,J)
					refR = hk1j[ 0 ] + ( v2mR * hk2j[ 0 ] + v2mI * hk2j[ 1 ] );
					refI = hk1j[ 1 ] + ( v2mR * hk2j[ 1 ] - v2mI * hk2j[ 0 ] );
					cset( Hv, sH1, sH2, oH, k + 1, j, hk1j[ 0 ] - ( refR * t1R - refI * t1I ), hk1j[ 1 ] - ( refR * t1I + refI * t1R ) );
					cset( Hv, sH1, sH2, oH, k + 2, j, hk2j[ 0 ] - ( refR * t2R - refI * t2I ), hk2j[ 1 ] - ( refR * t2I + refI * t2R ) );
				}

				// Deflation check
				if ( k >= ktop ) {
					var hk1k = cget( Hv, sH1, sH2, oH, k + 1, k ); // eslint-disable-line no-var
					if ( hk1k[ 0 ] !== 0.0 || hk1k[ 1 ] !== 0.0 ) {
						tst1 = cabs1( Hv, oH + ( k - 1 ) * sH1 + ( k - 1 ) * sH2 ) + cabs1( Hv, oH + k * sH1 + k * sH2 );
						if ( tst1 === 0.0 ) {
							if ( k >= ktop + 1 ) { tst1 += cabs1( Hv, oH + ( k - 1 ) * sH1 + ( k - 2 ) * sH2 ); }
							if ( k >= ktop + 2 ) { tst1 += cabs1( Hv, oH + ( k - 1 ) * sH1 + ( k - 3 ) * sH2 ); }
							if ( k >= ktop + 3 ) { tst1 += cabs1( Hv, oH + ( k - 1 ) * sH1 + ( k - 4 ) * sH2 ); }
							if ( k <= kbot - 2 ) { tst1 += cabs1( Hv, oH + ( k + 1 ) * sH1 + k * sH2 ); }
							if ( k <= kbot - 3 ) { tst1 += cabs1( Hv, oH + ( k + 2 ) * sH1 + k * sH2 ); }
							if ( k <= kbot - 4 ) { tst1 += cabs1( Hv, oH + ( k + 3 ) * sH1 + k * sH2 ); }
						}
						if ( cabs1( Hv, oH + k * sH1 + ( k - 1 ) * sH2 ) <= Math.max( smlnum, ULP * tst1 ) ) {
							h12 = Math.max( cabs1( Hv, oH + k * sH1 + ( k - 1 ) * sH2 ), cabs1( Hv, oH + ( k - 1 ) * sH1 + k * sH2 ) );
							h21 = Math.min( cabs1( Hv, oH + k * sH1 + ( k - 1 ) * sH2 ), cabs1( Hv, oH + ( k - 1 ) * sH1 + k * sH2 ) );

							// CABS1 of complex difference H(K-1,K-1) - H(K,K):
							dR = Hv[ oH + ( k - 1 ) * sH1 + ( k - 1 ) * sH2 ] - Hv[ oH + k * sH1 + k * sH2 ];
							dI = Hv[ oH + ( k - 1 ) * sH1 + ( k - 1 ) * sH2 + 1 ] - Hv[ oH + k * sH1 + k * sH2 + 1 ];
							aa = Math.abs( dR ) + Math.abs( dI );
							h11 = Math.max( cabs1( Hv, oH + k * sH1 + k * sH2 ), aa );
							h22 = Math.min( cabs1( Hv, oH + k * sH1 + k * sH2 ), aa );
							scl = h11 + h12;
							tst2 = h22 * ( h11 / scl );
							if ( tst2 === 0.0 || h21 * ( h12 / scl ) <= Math.max( smlnum, ULP * tst2 ) ) {
								cset( Hv, sH1, sH2, oH, k + 1, k, 0.0, 0.0 );
							}
						}
					}
				}

				// Accumulate transformation in U or Z
				if ( accum ) {
					kms = k - incol;
					t1R = Vv[ oV + ( m22 - 1 ) * sV2 ];
					t1I = Vv[ oV + ( m22 - 1 ) * sV2 + 1 ];
					for ( j = Math.max( 1, ktop - incol ); j <= kdu; j++ ) {
						var ujk1 = cget( Uv, sU1, sU2, oU, j, kms + 1 ); // eslint-disable-line no-var
						var ujk2 = cget( Uv, sU1, sU2, oU, j, kms + 2 ); // eslint-disable-line no-var
						refR = t1R * ( ujk1[ 0 ] + ( v2mR * ujk2[ 0 ] - v2mI * ujk2[ 1 ] ) ) - t1I * ( ujk1[ 1 ] + ( v2mR * ujk2[ 1 ] + v2mI * ujk2[ 0 ] ) );
						refI = t1R * ( ujk1[ 1 ] + ( v2mR * ujk2[ 1 ] + v2mI * ujk2[ 0 ] ) ) + t1I * ( ujk1[ 0 ] + ( v2mR * ujk2[ 0 ] - v2mI * ujk2[ 1 ] ) );
						cset( Uv, sU1, sU2, oU, j, kms + 1, ujk1[ 0 ] - refR, ujk1[ 1 ] - refI );

						// CONJ(V(2,M22))
						cset( Uv, sU1, sU2, oU, j, kms + 2, ujk2[ 0 ] - ( refR * v2mR + refI * v2mI ), ujk2[ 1 ] - ( -refR * v2mI + refI * v2mR ) );
					}
				} else if ( wantz ) {
					t1R = Vv[ oV + ( m22 - 1 ) * sV2 ];
					t1I = Vv[ oV + ( m22 - 1 ) * sV2 + 1 ];
					for ( j = iloz; j <= ihiz; j++ ) {
						var zjk1 = cget( Zv, sZ1, sZ2, oZ, j, k + 1 ); // eslint-disable-line no-var
						var zjk2 = cget( Zv, sZ1, sZ2, oZ, j, k + 2 ); // eslint-disable-line no-var
						refR = t1R * ( zjk1[ 0 ] + ( v2mR * zjk2[ 0 ] - v2mI * zjk2[ 1 ] ) ) - t1I * ( zjk1[ 1 ] + ( v2mR * zjk2[ 1 ] + v2mI * zjk2[ 0 ] ) );
						refI = t1R * ( zjk1[ 1 ] + ( v2mR * zjk2[ 1 ] + v2mI * zjk2[ 0 ] ) ) + t1I * ( zjk1[ 0 ] + ( v2mR * zjk2[ 0 ] - v2mI * zjk2[ 1 ] ) );
						cset( Zv, sZ1, sZ2, oZ, j, k + 1, zjk1[ 0 ] - refR, zjk1[ 1 ] - refI );
						cset( Zv, sZ1, sZ2, oZ, j, k + 2, zjk2[ 0 ] - ( refR * v2mR + refI * v2mI ), zjk2[ 1 ] - ( -refR * v2mI + refI * v2mR ) );
					}
				}
			}

			// Process the 3x3 bumps
			for ( m = mbot; m >= mtop; m-- ) {
				k = krcol + 2 * ( m - 1 );
				if ( k === ktop - 1 ) {
					zlaqr1( 3, H, strideH1, strideH2, offsetH + ( ktop - 1 ) * strideH1 + ( ktop - 1 ) * strideH2,
						s.get( ( 2 * m - 2 ) + offsetS ), s.get( ( 2 * m - 1 ) + offsetS ),
						V, strideV1, offsetV + ( m - 1 ) * strideV2 );
					alphaV[ 0 ] = Vv[ oV + ( m - 1 ) * sV2 ];
					alphaV[ 1 ] = Vv[ oV + ( m - 1 ) * sV2 + 1 ];
					zlarfg( 3, alphaCA, 0, V, strideV1, offsetV + strideV1 + ( m - 1 ) * strideV2, tauCA, 0 );
					Vv[ oV + ( m - 1 ) * sV2 ] = tauV[ 0 ];
					Vv[ oV + ( m - 1 ) * sV2 + 1 ] = tauV[ 1 ];
				} else {
					// Delayed reflector application from previous pass
					t1R = Vv[ oV + ( m - 1 ) * sV2 ];
					t1I = Vv[ oV + ( m - 1 ) * sV2 + 1 ];
					var v2R = Vv[ oV + sV1 + ( m - 1 ) * sV2 ]; // eslint-disable-line no-var
					var v2I = Vv[ oV + sV1 + ( m - 1 ) * sV2 + 1 ]; // eslint-disable-line no-var
					var v3R = Vv[ oV + 2 * sV1 + ( m - 1 ) * sV2 ]; // eslint-disable-line no-var
					var v3I = Vv[ oV + 2 * sV1 + ( m - 1 ) * sV2 + 1 ]; // eslint-disable-line no-var

					// T2 = T1*CONJ(V(2,M)), T3 = T1*CONJ(V(3,M))
					t2R = t1R * v2R + t1I * v2I;
					t2I = t1I * v2R - t1R * v2I;
					t3R = t1R * v3R + t1I * v3I;
					t3I = t1I * v3R - t1R * v3I;

					// Preliminary sweep of row K+3
					var hk3k2 = cget( Hv, sH1, sH2, oH, k + 3, k + 2 ); // eslint-disable-line no-var
					refR = v3R * hk3k2[ 0 ] - v3I * hk3k2[ 1 ];
					refI = v3R * hk3k2[ 1 ] + v3I * hk3k2[ 0 ];

					// H(K+3, K) = -REFSUM*T1
					cset( Hv, sH1, sH2, oH, k + 3, k, -( refR * t1R - refI * t1I ), -( refR * t1I + refI * t1R ) );

					// H(K+3, K+1) = -REFSUM*T2
					cset( Hv, sH1, sH2, oH, k + 3, k + 1, -( refR * t2R - refI * t2I ), -( refR * t2I + refI * t2R ) );

					// H(K+3, K+2) = H(K+3, K+2) - REFSUM*T3
					cset( Hv, sH1, sH2, oH, k + 3, k + 2, hk3k2[ 0 ] - ( refR * t3R - refI * t3I ), hk3k2[ 1 ] - ( refR * t3I + refI * t3R ) );

					// Generate new reflector
					betaV[ 0 ] = Hv[ oH + k * sH1 + ( k - 1 ) * sH2 ];
					betaV[ 1 ] = Hv[ oH + k * sH1 + ( k - 1 ) * sH2 + 1 ];
					Vv[ oV + sV1 + ( m - 1 ) * sV2 ] = Hv[ oH + ( k + 1 ) * sH1 + ( k - 1 ) * sH2 ];
					Vv[ oV + sV1 + ( m - 1 ) * sV2 + 1 ] = Hv[ oH + ( k + 1 ) * sH1 + ( k - 1 ) * sH2 + 1 ];
					Vv[ oV + 2 * sV1 + ( m - 1 ) * sV2 ] = Hv[ oH + ( k + 2 ) * sH1 + ( k - 1 ) * sH2 ];
					Vv[ oV + 2 * sV1 + ( m - 1 ) * sV2 + 1 ] = Hv[ oH + ( k + 2 ) * sH1 + ( k - 1 ) * sH2 + 1 ];
					zlarfg( 3, betaCA, 0, V, strideV1, offsetV + strideV1 + ( m - 1 ) * strideV2, tauCA, 0 );
					Vv[ oV + ( m - 1 ) * sV2 ] = tauV[ 0 ];
					Vv[ oV + ( m - 1 ) * sV2 + 1 ] = tauV[ 1 ];

					// Check whether to accept or recompute
					var hk3k0 = cget( Hv, sH1, sH2, oH, k + 3, k ); // eslint-disable-line no-var
					var hk3k1 = cget( Hv, sH1, sH2, oH, k + 3, k + 1 ); // eslint-disable-line no-var
					var hk3k2b = cget( Hv, sH1, sH2, oH, k + 3, k + 2 ); // eslint-disable-line no-var
					if ( ( hk3k0[ 0 ] !== 0.0 || hk3k0[ 1 ] !== 0.0 ) || ( hk3k1[ 0 ] !== 0.0 || hk3k1[ 1 ] !== 0.0 ) || ( hk3k2b[ 0 ] === 0.0 && hk3k2b[ 1 ] === 0.0 ) ) {
						// Accept
						Hv[ oH + k * sH1 + ( k - 1 ) * sH2 ] = betaV[ 0 ];
						Hv[ oH + k * sH1 + ( k - 1 ) * sH2 + 1 ] = betaV[ 1 ];
						cset( Hv, sH1, sH2, oH, k + 2, k, 0.0, 0.0 );
						cset( Hv, sH1, sH2, oH, k + 3, k, 0.0, 0.0 );
					} else {
						// Recompute
						zlaqr1( 3, H, strideH1, strideH2, offsetH + k * strideH1 + k * strideH2,
							s.get( ( 2 * m - 2 ) + offsetS ), s.get( ( 2 * m - 1 ) + offsetS ),
							VTca, 1, 0 );
						alphaV[ 0 ] = VT[ 0 ];
						alphaV[ 1 ] = VT[ 1 ];
						zlarfg( 3, alphaCA, 0, VTca, 1, 1, tauCA, 0 );

						// Check if the recomputed version is better
						var vt2cR = VT[ 2 ]; // eslint-disable-line no-var -- CONJ(VT(2))
						var vt2cI = -VT[ 3 ]; // eslint-disable-line no-var

						// REFSUM = H(K+1,K) + CONJ(VT(2))*H(K+2,K)
						var hk1k = cget( Hv, sH1, sH2, oH, k + 1, k ); // eslint-disable-line no-var
						var hk2k = cget( Hv, sH1, sH2, oH, k + 2, k ); // eslint-disable-line no-var
						refR = hk1k[ 0 ] + ( vt2cR * hk2k[ 0 ] + vt2cI * hk2k[ 1 ] );  // Note: CONJ(VT(2)) already

						// Actually the Fortran has: REFSUM = H(K+1,K) + DCONJG(VT(2))*H(K+2,K)

						// And VT(2) values come from VT, not conj. Let me use VT directly:
						refR = hk1k[ 0 ] + ( VT[ 2 ] * hk2k[ 0 ] + VT[ 3 ] * hk2k[ 1 ] );
						refI = hk1k[ 1 ] + ( VT[ 2 ] * hk2k[ 1 ] - VT[ 3 ] * hk2k[ 0 ] );

						// T1c = CONJ(VT(1))
						var cT1R = tauV[ 0 ]; // eslint-disable-line no-var
						var cT1I = -tauV[ 1 ]; // eslint-disable-line no-var

						// T2c = T1c*VT(2)
						var cT2R = cT1R * VT[ 2 ] - cT1I * VT[ 3 ]; // eslint-disable-line no-var
						var cT2I = cT1R * VT[ 3 ] + cT1I * VT[ 2 ]; // eslint-disable-line no-var

						// T3c = T1c*VT(3)
						var cT3R = cT1R * VT[ 4 ] - cT1I * VT[ 5 ]; // eslint-disable-line no-var
						var cT3I = cT1R * VT[ 5 ] + cT1I * VT[ 4 ]; // eslint-disable-line no-var

						// Check: CABS1(H(K+2,K)-REFSUM*T2) + CABS1(REFSUM*T3) > ULP*(CABS1(H(K,K))+...)
						var rt2R = refR * cT2R - refI * cT2I; // eslint-disable-line no-var
						var rt2I = refR * cT2I + refI * cT2R; // eslint-disable-line no-var
						var rt3R = refR * cT3R - refI * cT3I; // eslint-disable-line no-var
						var rt3I = refR * cT3I + refI * cT3R; // eslint-disable-line no-var
						var chk2 = hk2k[ 0 ] - rt2R; // eslint-disable-line no-var
						var chk2i = hk2k[ 1 ] - rt2I; // eslint-disable-line no-var

						if ( ( Math.abs( chk2 ) + Math.abs( chk2i ) + Math.abs( rt3R ) + Math.abs( rt3I ) ) >
							ULP * ( cabs1( Hv, oH + ( k - 1 ) * sH1 + ( k - 1 ) * sH2 ) + cabs1( Hv, oH + k * sH1 + k * sH2 ) + cabs1( Hv, oH + ( k + 1 ) * sH1 + ( k + 1 ) * sH2 ) ) ) {
							// Accept original
							Hv[ oH + k * sH1 + ( k - 1 ) * sH2 ] = betaV[ 0 ];
							Hv[ oH + k * sH1 + ( k - 1 ) * sH2 + 1 ] = betaV[ 1 ];
							cset( Hv, sH1, sH2, oH, k + 2, k, 0.0, 0.0 );
							cset( Hv, sH1, sH2, oH, k + 3, k, 0.0, 0.0 );
						} else {
							// Use recomputed
							Hv[ oH + k * sH1 + ( k - 1 ) * sH2 ] = hk1k[ 0 ] - ( refR * cT1R - refI * cT1I );
							Hv[ oH + k * sH1 + ( k - 1 ) * sH2 + 1 ] = hk1k[ 1 ] - ( refR * cT1I + refI * cT1R );
							cset( Hv, sH1, sH2, oH, k + 2, k, 0.0, 0.0 );
							cset( Hv, sH1, sH2, oH, k + 3, k, 0.0, 0.0 );
							Vv[ oV + ( m - 1 ) * sV2 ] = tauV[ 0 ];
							Vv[ oV + ( m - 1 ) * sV2 + 1 ] = tauV[ 1 ];
							Vv[ oV + sV1 + ( m - 1 ) * sV2 ] = VT[ 2 ];
							Vv[ oV + sV1 + ( m - 1 ) * sV2 + 1 ] = VT[ 3 ];
							Vv[ oV + 2 * sV1 + ( m - 1 ) * sV2 ] = VT[ 4 ];
							Vv[ oV + 2 * sV1 + ( m - 1 ) * sV2 + 1 ] = VT[ 5 ];
						}
					}
				}

				// Apply 3x3 reflector from right (column update for rows JTOP..min(KBOT,K+3))
				t1R = Vv[ oV + ( m - 1 ) * sV2 ];
				t1I = Vv[ oV + ( m - 1 ) * sV2 + 1 ];
				v2R = Vv[ oV + sV1 + ( m - 1 ) * sV2 ];
				v2I = Vv[ oV + sV1 + ( m - 1 ) * sV2 + 1 ];
				v3R = Vv[ oV + 2 * sV1 + ( m - 1 ) * sV2 ];
				v3I = Vv[ oV + 2 * sV1 + ( m - 1 ) * sV2 + 1 ];

				t2R = t1R * v2R + t1I * v2I; // T1*CONJ(V2)
				t2I = t1I * v2R - t1R * v2I;
				t3R = t1R * v3R + t1I * v3I; // T1*CONJ(V3)
				t3I = t1I * v3R - t1R * v3I;

				for ( j = jtop; j <= Math.min( kbot, k + 3 ); j++ ) {
					var hjk1c = cget( Hv, sH1, sH2, oH, j, k + 1 ); // eslint-disable-line no-var
					var hjk2c = cget( Hv, sH1, sH2, oH, j, k + 2 ); // eslint-disable-line no-var
					var hjk3c = cget( Hv, sH1, sH2, oH, j, k + 3 ); // eslint-disable-line no-var

					// REFSUM = H(J,K+1) + V(2,M)*H(J,K+2) + V(3,M)*H(J,K+3)
					refR = hjk1c[ 0 ] + ( v2R * hjk2c[ 0 ] - v2I * hjk2c[ 1 ] ) + ( v3R * hjk3c[ 0 ] - v3I * hjk3c[ 1 ] );
					refI = hjk1c[ 1 ] + ( v2R * hjk2c[ 1 ] + v2I * hjk2c[ 0 ] ) + ( v3R * hjk3c[ 1 ] + v3I * hjk3c[ 0 ] );
					cset( Hv, sH1, sH2, oH, j, k + 1, hjk1c[ 0 ] - ( refR * t1R - refI * t1I ), hjk1c[ 1 ] - ( refR * t1I + refI * t1R ) );
					cset( Hv, sH1, sH2, oH, j, k + 2, hjk2c[ 0 ] - ( refR * t2R - refI * t2I ), hjk2c[ 1 ] - ( refR * t2I + refI * t2R ) );
					cset( Hv, sH1, sH2, oH, j, k + 3, hjk3c[ 0 ] - ( refR * t3R - refI * t3I ), hjk3c[ 1 ] - ( refR * t3I + refI * t3R ) );
				}

				// Apply 3x3 reflector from left (row update for H(K+1, K+1))
				// CONJ(V(1,M))
				var ct1R = Vv[ oV + ( m - 1 ) * sV2 ]; // eslint-disable-line no-var
				var ct1I = -Vv[ oV + ( m - 1 ) * sV2 + 1 ]; // eslint-disable-line no-var
				var ct2R = ct1R * v2R - ct1I * v2I; // eslint-disable-line no-var
				var ct2I = ct1R * v2I + ct1I * v2R; // eslint-disable-line no-var
				var ct3R = ct1R * v3R - ct1I * v3I; // eslint-disable-line no-var
				var ct3I = ct1R * v3I + ct1I * v3R; // eslint-disable-line no-var

				// Row update for column K+1 only (the special column)
				var hk1k1c = cget( Hv, sH1, sH2, oH, k + 1, k + 1 ); // eslint-disable-line no-var
				var hk2k1c = cget( Hv, sH1, sH2, oH, k + 2, k + 1 ); // eslint-disable-line no-var
				var hk3k1c = cget( Hv, sH1, sH2, oH, k + 3, k + 1 ); // eslint-disable-line no-var

				// REFSUM = H(K+1,K+1) + CONJ(V(2,M))*H(K+2,K+1) + CONJ(V(3,M))*H(K+3,K+1)
				refR = hk1k1c[ 0 ] + ( v2R * hk2k1c[ 0 ] + v2I * hk2k1c[ 1 ] ) + ( v3R * hk3k1c[ 0 ] + v3I * hk3k1c[ 1 ] );
				refI = hk1k1c[ 1 ] + ( v2R * hk2k1c[ 1 ] - v2I * hk2k1c[ 0 ] ) + ( v3R * hk3k1c[ 1 ] - v3I * hk3k1c[ 0 ] );
				cset( Hv, sH1, sH2, oH, k + 1, k + 1, hk1k1c[ 0 ] - ( refR * ct1R - refI * ct1I ), hk1k1c[ 1 ] - ( refR * ct1I + refI * ct1R ) );
				cset( Hv, sH1, sH2, oH, k + 2, k + 1, hk2k1c[ 0 ] - ( refR * ct2R - refI * ct2I ), hk2k1c[ 1 ] - ( refR * ct2I + refI * ct2R ) );
				cset( Hv, sH1, sH2, oH, k + 3, k + 1, hk3k1c[ 0 ] - ( refR * ct3R - refI * ct3I ), hk3k1c[ 1 ] - ( refR * ct3I + refI * ct3R ) );

				// Deflation check
				if ( k >= ktop ) {
					if ( Hv[ oH + k * sH1 + ( k - 1 ) * sH2 ] !== 0.0 || Hv[ oH + k * sH1 + ( k - 1 ) * sH2 + 1 ] !== 0.0 ) {
						tst1 = cabs1( Hv, oH + ( k - 1 ) * sH1 + ( k - 1 ) * sH2 ) + cabs1( Hv, oH + k * sH1 + k * sH2 );
						if ( tst1 === 0.0 ) {
							if ( k >= ktop + 1 ) { tst1 += cabs1( Hv, oH + ( k - 1 ) * sH1 + ( k - 2 ) * sH2 ); }
							if ( k >= ktop + 2 ) { tst1 += cabs1( Hv, oH + ( k - 1 ) * sH1 + ( k - 3 ) * sH2 ); }
							if ( k >= ktop + 3 ) { tst1 += cabs1( Hv, oH + ( k - 1 ) * sH1 + ( k - 4 ) * sH2 ); }
							if ( k <= kbot - 2 ) { tst1 += cabs1( Hv, oH + ( k + 1 ) * sH1 + k * sH2 ); }
							if ( k <= kbot - 3 ) { tst1 += cabs1( Hv, oH + ( k + 2 ) * sH1 + k * sH2 ); }
							if ( k <= kbot - 4 ) { tst1 += cabs1( Hv, oH + ( k + 3 ) * sH1 + k * sH2 ); }
						}
						if ( cabs1( Hv, oH + k * sH1 + ( k - 1 ) * sH2 ) <= Math.max( smlnum, ULP * tst1 ) ) {
							h12 = Math.max( cabs1( Hv, oH + k * sH1 + ( k - 1 ) * sH2 ), cabs1( Hv, oH + ( k - 1 ) * sH1 + k * sH2 ) );
							h21 = Math.min( cabs1( Hv, oH + k * sH1 + ( k - 1 ) * sH2 ), cabs1( Hv, oH + ( k - 1 ) * sH1 + k * sH2 ) );
							dR = Hv[ oH + ( k - 1 ) * sH1 + ( k - 1 ) * sH2 ] - Hv[ oH + k * sH1 + k * sH2 ];
							dI = Hv[ oH + ( k - 1 ) * sH1 + ( k - 1 ) * sH2 + 1 ] - Hv[ oH + k * sH1 + k * sH2 + 1 ];
							h11 = Math.max( cabs1( Hv, oH + k * sH1 + k * sH2 ), Math.abs( dR ) + Math.abs( dI ) );
							h22 = Math.min( cabs1( Hv, oH + k * sH1 + k * sH2 ), Math.abs( dR ) + Math.abs( dI ) );
							scl = h11 + h12;
							tst2 = h22 * ( h11 / scl );
							if ( tst2 === 0.0 || h21 * ( h12 / scl ) <= Math.max( smlnum, ULP * tst2 ) ) {
								cset( Hv, sH1, sH2, oH, k + 1, k, 0.0, 0.0 );
							}
						}
					}
				}
			}

			// Row update: apply CONJ(V) reflectors from left
			if ( accum ) {
				jbot = Math.min( ndcol, kbot );
			} else if ( wantt ) {
				jbot = N;
			} else {
				jbot = kbot;
			}

			for ( m = mbot; m >= mtop; m-- ) {
				k = krcol + 2 * ( m - 1 );
				ct1R = Vv[ oV + ( m - 1 ) * sV2 ];
				ct1I = -Vv[ oV + ( m - 1 ) * sV2 + 1 ]; // CONJ(V(1,M))
				v2R = Vv[ oV + sV1 + ( m - 1 ) * sV2 ];
				v2I = Vv[ oV + sV1 + ( m - 1 ) * sV2 + 1 ];
				v3R = Vv[ oV + 2 * sV1 + ( m - 1 ) * sV2 ];
				v3I = Vv[ oV + 2 * sV1 + ( m - 1 ) * sV2 + 1 ];
				ct2R = ct1R * v2R - ct1I * v2I;
				ct2I = ct1R * v2I + ct1I * v2R;
				ct3R = ct1R * v3R - ct1I * v3I;
				ct3I = ct1R * v3I + ct1I * v3R;

				for ( j = Math.max( ktop, krcol + 2 * m ); j <= jbot; j++ ) {
					var hk1jd = cget( Hv, sH1, sH2, oH, k + 1, j ); // eslint-disable-line no-var
					var hk2jd = cget( Hv, sH1, sH2, oH, k + 2, j ); // eslint-disable-line no-var
					var hk3jd = cget( Hv, sH1, sH2, oH, k + 3, j ); // eslint-disable-line no-var

					// REFSUM = H(K+1,J) + CONJ(V(2,M))*H(K+2,J) + CONJ(V(3,M))*H(K+3,J)
					refR = hk1jd[ 0 ] + ( v2R * hk2jd[ 0 ] + v2I * hk2jd[ 1 ] ) + ( v3R * hk3jd[ 0 ] + v3I * hk3jd[ 1 ] );
					refI = hk1jd[ 1 ] + ( v2R * hk2jd[ 1 ] - v2I * hk2jd[ 0 ] ) + ( v3R * hk3jd[ 1 ] - v3I * hk3jd[ 0 ] );
					cset( Hv, sH1, sH2, oH, k + 1, j, hk1jd[ 0 ] - ( refR * ct1R - refI * ct1I ), hk1jd[ 1 ] - ( refR * ct1I + refI * ct1R ) );
					cset( Hv, sH1, sH2, oH, k + 2, j, hk2jd[ 0 ] - ( refR * ct2R - refI * ct2I ), hk2jd[ 1 ] - ( refR * ct2I + refI * ct2R ) );
					cset( Hv, sH1, sH2, oH, k + 3, j, hk3jd[ 0 ] - ( refR * ct3R - refI * ct3I ), hk3jd[ 1 ] - ( refR * ct3I + refI * ct3R ) );
				}
			}

			// Update U or Z
			if ( accum ) {
				for ( m = mbot; m >= mtop; m-- ) {
					k = krcol + 2 * ( m - 1 );
					kms = k - incol;
					i2 = Math.max( 1, ktop - incol );
					i2 = Math.max( i2, kms - ( krcol - incol ) + 1 );
					i4 = Math.min( kdu, krcol + 2 * ( mbot - 1 ) - incol + 5 );
					t1R = Vv[ oV + ( m - 1 ) * sV2 ];
					t1I = Vv[ oV + ( m - 1 ) * sV2 + 1 ];
					v2R = Vv[ oV + sV1 + ( m - 1 ) * sV2 ];
					v2I = Vv[ oV + sV1 + ( m - 1 ) * sV2 + 1 ];
					v3R = Vv[ oV + 2 * sV1 + ( m - 1 ) * sV2 ];
					v3I = Vv[ oV + 2 * sV1 + ( m - 1 ) * sV2 + 1 ];
					t2R = t1R * v2R + t1I * v2I; // T1*CONJ(V2)
					t2I = t1I * v2R - t1R * v2I;
					t3R = t1R * v3R + t1I * v3I; // T1*CONJ(V3)
					t3I = t1I * v3R - t1R * v3I;
					for ( j = i2; j <= i4; j++ ) {
						var ujk1d = cget( Uv, sU1, sU2, oU, j, kms + 1 ); // eslint-disable-line no-var
						var ujk2d = cget( Uv, sU1, sU2, oU, j, kms + 2 ); // eslint-disable-line no-var
						var ujk3d = cget( Uv, sU1, sU2, oU, j, kms + 3 ); // eslint-disable-line no-var
						refR = ujk1d[ 0 ] + ( v2R * ujk2d[ 0 ] - v2I * ujk2d[ 1 ] ) + ( v3R * ujk3d[ 0 ] - v3I * ujk3d[ 1 ] );
						refI = ujk1d[ 1 ] + ( v2R * ujk2d[ 1 ] + v2I * ujk2d[ 0 ] ) + ( v3R * ujk3d[ 1 ] + v3I * ujk3d[ 0 ] );
						cset( Uv, sU1, sU2, oU, j, kms + 1, ujk1d[ 0 ] - ( refR * t1R - refI * t1I ), ujk1d[ 1 ] - ( refR * t1I + refI * t1R ) );
						cset( Uv, sU1, sU2, oU, j, kms + 2, ujk2d[ 0 ] - ( refR * t2R - refI * t2I ), ujk2d[ 1 ] - ( refR * t2I + refI * t2R ) );
						cset( Uv, sU1, sU2, oU, j, kms + 3, ujk3d[ 0 ] - ( refR * t3R - refI * t3I ), ujk3d[ 1 ] - ( refR * t3I + refI * t3R ) );
					}
				}
			} else if ( wantz ) {
				for ( m = mbot; m >= mtop; m-- ) {
					k = krcol + 2 * ( m - 1 );
					t1R = Vv[ oV + ( m - 1 ) * sV2 ];
					t1I = Vv[ oV + ( m - 1 ) * sV2 + 1 ];
					v2R = Vv[ oV + sV1 + ( m - 1 ) * sV2 ];
					v2I = Vv[ oV + sV1 + ( m - 1 ) * sV2 + 1 ];
					v3R = Vv[ oV + 2 * sV1 + ( m - 1 ) * sV2 ];
					v3I = Vv[ oV + 2 * sV1 + ( m - 1 ) * sV2 + 1 ];
					t2R = t1R * v2R + t1I * v2I;
					t2I = t1I * v2R - t1R * v2I;
					t3R = t1R * v3R + t1I * v3I;
					t3I = t1I * v3R - t1R * v3I;
					for ( j = iloz; j <= ihiz; j++ ) {
						var zjk1d = cget( Zv, sZ1, sZ2, oZ, j, k + 1 ); // eslint-disable-line no-var
						var zjk2d = cget( Zv, sZ1, sZ2, oZ, j, k + 2 ); // eslint-disable-line no-var
						var zjk3d = cget( Zv, sZ1, sZ2, oZ, j, k + 3 ); // eslint-disable-line no-var
						refR = zjk1d[ 0 ] + ( v2R * zjk2d[ 0 ] - v2I * zjk2d[ 1 ] ) + ( v3R * zjk3d[ 0 ] - v3I * zjk3d[ 1 ] );
						refI = zjk1d[ 1 ] + ( v2R * zjk2d[ 1 ] + v2I * zjk2d[ 0 ] ) + ( v3R * zjk3d[ 1 ] + v3I * zjk3d[ 0 ] );
						cset( Zv, sZ1, sZ2, oZ, j, k + 1, zjk1d[ 0 ] - ( refR * t1R - refI * t1I ), zjk1d[ 1 ] - ( refR * t1I + refI * t1R ) );
						cset( Zv, sZ1, sZ2, oZ, j, k + 2, zjk2d[ 0 ] - ( refR * t2R - refI * t2I ), zjk2d[ 1 ] - ( refR * t2I + refI * t2R ) );
						cset( Zv, sZ1, sZ2, oZ, j, k + 3, zjk3d[ 0 ] - ( refR * t3R - refI * t3I ), zjk3d[ 1 ] - ( refR * t3I + refI * t3R ) );
					}
				}
			}
		} // end krcol loop

		// Horizontal/vertical multiply with accumulated U if needed
		if ( accum ) {
			var jtopAcc; // eslint-disable-line no-var
			var jbotAcc; // eslint-disable-line no-var
			if ( wantt ) {
				jtopAcc = 1;
				jbotAcc = N;
			} else {
				jtopAcc = ktop;
				jbotAcc = kbot;
			}
			k1 = Math.max( 1, ktop - incol );
			nu = ( kdu - Math.max( 0, ndcol - kbot ) ) - k1 + 1;

			// Horizontal multiply
			for ( jcol = Math.min( ndcol, kbot ) + 1; jcol <= jbotAcc; jcol += nh ) {
				jlen = Math.min( nh, jbotAcc - jcol + 1 );
				zgemm( 'conjugate-transpose', 'no-transpose', nu, jlen, nu, CONE, U, strideU1, strideU2, offsetU + ( k1 - 1 ) * strideU1 + ( k1 - 1 ) * strideU2, H, strideH1, strideH2, offsetH + ( incol + k1 - 1 ) * strideH1 + ( jcol - 1 ) * strideH2, CZERO, WH, strideWH1, strideWH2, offsetWH );
				zlacpy( 'ALL', nu, jlen, WH, strideWH1, strideWH2, offsetWH, H, strideH1, strideH2, offsetH + ( incol + k1 - 1 ) * strideH1 + ( jcol - 1 ) * strideH2 );
			}

			// Vertical multiply
			for ( jrow = jtopAcc; jrow <= Math.max( ktop, incol ) - 1; jrow += nv ) {
				jlen = Math.min( nv, Math.max( ktop, incol ) - jrow );
				zgemm( 'no-transpose', 'no-transpose', jlen, nu, nu, CONE, H, strideH1, strideH2, offsetH + ( jrow - 1 ) * strideH1 + ( incol + k1 - 1 ) * strideH2, U, strideU1, strideU2, offsetU + ( k1 - 1 ) * strideU1 + ( k1 - 1 ) * strideU2, CZERO, WV, strideWV1, strideWV2, offsetWV );
				zlacpy( 'ALL', jlen, nu, WV, strideWV1, strideWV2, offsetWV, H, strideH1, strideH2, offsetH + ( jrow - 1 ) * strideH1 + ( incol + k1 - 1 ) * strideH2 );
			}

			// Z multiply
			if ( wantz ) {
				for ( jrow = iloz; jrow <= ihiz; jrow += nv ) {
					jlen = Math.min( nv, ihiz - jrow + 1 );
					zgemm( 'no-transpose', 'no-transpose', jlen, nu, nu, CONE, Z, strideZ1, strideZ2, offsetZ + ( jrow - 1 ) * strideZ1 + ( incol + k1 - 1 ) * strideZ2, U, strideU1, strideU2, offsetU + ( k1 - 1 ) * strideU1 + ( k1 - 1 ) * strideU2, CZERO, WV, strideWV1, strideWV2, offsetWV );
					zlacpy( 'ALL', jlen, nu, WV, strideWV1, strideWV2, offsetWV, Z, strideZ1, strideZ2, offsetZ + ( jrow - 1 ) * strideZ1 + ( incol + k1 - 1 ) * strideZ2 );
				}
			}
		}
	} // end incol loop
}


// EXPORTS //

export default zlaqr5;
