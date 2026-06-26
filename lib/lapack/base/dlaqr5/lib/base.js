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

/* eslint-disable max-len, max-params, max-statements, max-depth */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dlaqr1 from '../../dlaqr1/lib/base.js';
import dlarfg from '../../dlarfg/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dgemm from '../../../../blas/base/dgemm/lib/base.js';


// VARIABLES //

var SAFMIN = dlamch( 'safe-minimum' );
var ULP = dlamch( 'epsilon' );


// FUNCTIONS //

/**
* Accesses a 2D array element (1-based row i, column j).
*
* @private
* @param {Float64Array} A - array
* @param {integer} sA1 - row stride
* @param {integer} sA2 - column stride
* @param {integer} oA - offset
* @param {integer} i - 1-based row
* @param {integer} j - 1-based column
* @returns {number} element value
*/
function get2d( A, sA1, sA2, oA, i, j ) {
	return A[ oA + ( i - 1 ) * sA1 + ( j - 1 ) * sA2 ];
}

/**
* Sets a 2D array element (1-based row i, column j).
*
* @private
* @param {Float64Array} A - array
* @param {integer} sA1 - row stride
* @param {integer} sA2 - column stride
* @param {integer} oA - offset
* @param {integer} i - 1-based row
* @param {integer} j - 1-based column
* @param {number} val - value to set
*/
function set2d( A, sA1, sA2, oA, i, j, val ) {
	A[ oA + ( i - 1 ) * sA1 + ( j - 1 ) * sA2 ] = val;
}

/**
* Returns the flat index for a 2D array element (1-based row i, column j).
*
* @private
* @param {integer} sA1 - row stride
* @param {integer} sA2 - column stride
* @param {integer} oA - offset
* @param {integer} i - 1-based row
* @param {integer} j - 1-based column
* @returns {integer} flat index
*/
function idx2d( sA1, sA2, oA, i, j ) {
	return oA + ( i - 1 ) * sA1 + ( j - 1 ) * sA2;
}


// MAIN //

/**
* Performs a single small-bulge multi-shift QR sweep on an upper Hessenberg.
* matrix, chasing a chain of bulges from left to right. Called by dlaqr0.
*
* @private
* @param {boolean} wantt - whether the quasi-triangular Schur factor is being computed
* @param {boolean} wantz - whether the orthogonal Schur factor is being computed
* @param {integer} kacc22 - computation mode (0, 1, or 2) for far-from-diagonal updates
* @param {NonNegativeInteger} N - order of the Hessenberg matrix H
* @param {NonNegativeInteger} ktop - 0-based index of first row/col of active block
* @param {NonNegativeInteger} kbot - 0-based index of last row/col of active block
* @param {NonNegativeInteger} nshfts - number of shifts (must be positive and even)
* @param {Float64Array} SR - real parts of shifts, length nshfts
* @param {integer} strideSR - stride for SR
* @param {NonNegativeInteger} offsetSR - offset for SR
* @param {Float64Array} SI - imaginary parts of shifts, length nshfts
* @param {integer} strideSI - stride for SI
* @param {NonNegativeInteger} offsetSI - offset for SI
* @param {Float64Array} H - Hessenberg matrix (N-by-N), modified in-place
* @param {integer} strideH1 - row stride for H
* @param {integer} strideH2 - column stride for H
* @param {NonNegativeInteger} offsetH - offset for H
* @param {NonNegativeInteger} iloz - 0-based first row of Z to update
* @param {NonNegativeInteger} ihiz - 0-based last row of Z to update
* @param {Float64Array} Z - orthogonal matrix, updated if wantz
* @param {integer} strideZ1 - row stride for Z
* @param {integer} strideZ2 - column stride for Z
* @param {NonNegativeInteger} offsetZ - offset for Z
* @param {Float64Array} V - scratch matrix for reflectors (3-by-nshfts/2)
* @param {integer} strideV1 - row stride for V
* @param {integer} strideV2 - column stride for V
* @param {NonNegativeInteger} offsetV - offset for V
* @param {Float64Array} U - scratch matrix for accumulated reflections
* @param {integer} strideU1 - row stride for U
* @param {integer} strideU2 - column stride for U
* @param {NonNegativeInteger} offsetU - offset for U
* @param {NonNegativeInteger} nv - number of rows available in WV
* @param {Float64Array} WV - workspace matrix
* @param {integer} strideWV1 - row stride for WV
* @param {integer} strideWV2 - column stride for WV
* @param {NonNegativeInteger} offsetWV - offset for WV
* @param {NonNegativeInteger} nh - number of columns available in WH
* @param {Float64Array} WH - workspace matrix
* @param {integer} strideWH1 - row stride for WH
* @param {integer} strideWH2 - column stride for WH
* @param {NonNegativeInteger} offsetWH - offset for WH
*/
function dlaqr5( wantt, wantz, kacc22, N, ktop, kbot, nshfts, SR, strideSR, offsetSR, SI, strideSI, offsetSI, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, V, strideV1, strideV2, offsetV, U, strideU1, strideU2, offsetU, nv, WV, strideWV1, strideWV2, offsetWV, nh, WH, strideWH1, strideWH2, offsetWH ) { // eslint-disable-line max-len
	var alphaArr = new Float64Array( 1 );
	var smlnum;
	var refsum;
	var safmin;
	var tauArr = new Float64Array( 1 );
	var nbmps;
	var ndcol;
	var krcol;
	var accum;
	var bmp22;
	var incol;
	var swap;
	var beta;
	var jtop;
	var jbot;
	var jcol;
	var jlen;
	var jrow;
	var mbot;
	var mtop;
	var tst1;
	var tst2;
	var KTOP = ktop + 1;
	var KBOT = kbot + 1;
	var ILOZ = iloz + 1;
	var IHIZ = ihiz + 1;
	var sWV1 = strideWV1;
	var sWV2 = strideWV2;
	var sWH1 = strideWH1;
	var sWH2 = strideWH2;
	var h11;
	var h12;
	var h21;
	var h22;
	var scl;
	var kdu;
	var kms;
	var m22;
	var sH1 = strideH1;
	var sH2 = strideH2;
	var sZ1 = strideZ1;
	var sZ2 = strideZ2;
	var sV1 = strideV1;
	var sV2 = strideV2;
	var sU1 = strideU1;
	var sU2 = strideU2;
	var oWV = offsetWV;
	var oWH = offsetWH;
	var vt = new Float64Array( 3 );
	var ns;
	var nu;
	var k1;
	var i2;
	var i4;
	var t1;
	var t2;
	var t3;
	var oH = offsetH;
	var oZ = offsetZ;
	var oV = offsetV;
	var oU = offsetU;
	var k;
	var m;
	var j;
	var i;

	// ==== If there are no shifts, then there is nothing to do. ====
	if ( nshfts < 2 ) {
		return;
	}

	// ==== If the active block is empty or 1-by-1, then nothing to do. ====
	if ( KTOP >= KBOT ) {
		return;
	}

	// ==== Shuffle shifts into pairs of real shifts and pairs of complex
	//      Conjugate shifts, assuming complex conjugate shifts are already
	//      Adjacent to one another. ====
	for ( i = 1; i <= nshfts - 2; i += 2 ) {
		if ( SI[ offsetSI + ( i - 1 ) * strideSI ] !== -SI[ offsetSI + i * strideSI ] ) {
			swap = SR[ offsetSR + ( i - 1 ) * strideSR ];
			SR[ offsetSR + ( i - 1 ) * strideSR ] = SR[ offsetSR + i * strideSR ];
			SR[ offsetSR + i * strideSR ] = SR[ offsetSR + ( i + 1 ) * strideSR ];
			SR[ offsetSR + ( i + 1 ) * strideSR ] = swap;

			swap = SI[ offsetSI + ( i - 1 ) * strideSI ];
			SI[ offsetSI + ( i - 1 ) * strideSI ] = SI[ offsetSI + i * strideSI ];
			SI[ offsetSI + i * strideSI ] = SI[ offsetSI + ( i + 1 ) * strideSI ];
			SI[ offsetSI + ( i + 1 ) * strideSI ] = swap;
		}
	}

	// ==== NSHFTS is supposed to be even, but if odd, reduce by one. ====
	ns = nshfts - ( nshfts % 2 );

	// ==== Machine constants for deflation ====
	safmin = SAFMIN;
	smlnum = safmin * ( N / ULP );

	// ==== Use accumulated reflections to update far-from-diagonal entries? ====
	accum = ( kacc22 === 1 ) || ( kacc22 === 2 );

	// ==== Clear trash ====
	if ( KTOP + 2 <= KBOT ) {
		set2d( H, sH1, sH2, oH, KTOP + 2, KTOP, 0.0 );
	}

	// ==== NBMPS = number of 2-shift bulges in the chain ====
	nbmps = ( ns / 2 ) | 0;

	// ==== KDU = width of slab ====
	kdu = 4 * nbmps;

	// Helper: get SR element (1-based index)
	function sr( idx ) {
		return SR[ offsetSR + ( idx - 1 ) * strideSR ];
	}
	function si( idx ) {
		return SI[ offsetSI + ( idx - 1 ) * strideSI ];
	}

	// ==== Create and chase chains of NBMPS bulges ====
	// Fortran: DO 180 INCOL = KTOP - 2*NBMPS + 1, KBOT - 2, 2*NBMPS
	for ( incol = KTOP - 2 * nbmps + 1; incol <= KBOT - 2; incol += 2 * nbmps ) {
		// JTOP = Index from which updates from the right start.
		if ( accum ) {
			jtop = Math.max( KTOP, incol );
		} else if ( wantt ) {
			jtop = 1;
		} else {
			jtop = KTOP;
		}

		ndcol = incol + kdu;
		if ( accum ) {
			dlaset( 'ALL', kdu, kdu, 0.0, 1.0, U, sU1, sU2, oU );
		}

		// ==== Near-the-diagonal bulge chase. ====
		// Fortran: DO 145 KRCOL = INCOL, MIN( INCOL+2*NBMPS-1, KBOT-2 )
		for ( krcol = incol; krcol <= Math.min( incol + 2 * nbmps - 1, KBOT - 2 ); krcol++ ) {
			mtop = Math.max( 1, ( ( KTOP - krcol ) / 2 + 1 ) | 0 );
			mbot = Math.min( nbmps, ( ( KBOT - krcol - 1 ) / 2 ) | 0 );
			m22 = mbot + 1;
			bmp22 = ( mbot < nbmps ) && ( krcol + 2 * ( m22 - 1 ) ) === ( KBOT - 2 );

			// ==== Special case: 2-by-2 reflection at bottom ====
			if ( bmp22 ) {
				k = krcol + 2 * ( m22 - 1 );

				if ( k === KTOP - 1 ) {
					// Generate initial reflector from shifts
					dlaqr1( 2, H, sH1, sH2, idx2d( sH1, sH2, oH, k + 1, k + 1 ), sr( 2 * m22 - 1 ), si( 2 * m22 - 1 ), sr( 2 * m22 ), si( 2 * m22 ), V, sV1, idx2d( sV1, sV2, oV, 1, m22 ) );

					alphaArr[ 0 ] = get2d( V, sV1, sV2, oV, 1, m22 );
					dlarfg( 2, alphaArr, 0, V, sV1, idx2d( sV1, sV2, oV, 2, m22 ), tauArr, 0 );
					set2d( V, sV1, sV2, oV, 1, m22, tauArr[ 0 ] );
				} else {
					alphaArr[ 0 ] = get2d( H, sH1, sH2, oH, k + 1, k );
					set2d( V, sV1, sV2, oV, 2, m22, get2d( H, sH1, sH2, oH, k + 2, k ) );
					dlarfg( 2, alphaArr, 0, V, sV1, idx2d( sV1, sV2, oV, 2, m22 ), tauArr, 0 );
					set2d( V, sV1, sV2, oV, 1, m22, tauArr[ 0 ] );
					set2d( H, sH1, sH2, oH, k + 1, k, alphaArr[ 0 ] );
					set2d( H, sH1, sH2, oH, k + 2, k, 0.0 );
				}

				// ==== Perform update from right within computational window. ====
				t1 = get2d( V, sV1, sV2, oV, 1, m22 );
				t2 = t1 * get2d( V, sV1, sV2, oV, 2, m22 );
				for ( j = jtop; j <= Math.min( KBOT, k + 3 ); j++ ) {
					refsum = get2d( H, sH1, sH2, oH, j, k + 1 ) + get2d( V, sV1, sV2, oV, 2, m22 ) * get2d( H, sH1, sH2, oH, j, k + 2 );
					set2d( H, sH1, sH2, oH, j, k + 1, get2d( H, sH1, sH2, oH, j, k + 1 ) - refsum * t1 );
					set2d( H, sH1, sH2, oH, j, k + 2, get2d( H, sH1, sH2, oH, j, k + 2 ) - refsum * t2 );
				}

				// ==== Perform update from left within computational window. ====
				if ( accum ) {
					jbot = Math.min( ndcol, KBOT );
				} else if ( wantt ) {
					jbot = N;
				} else {
					jbot = KBOT;
				}
				t1 = get2d( V, sV1, sV2, oV, 1, m22 );
				t2 = t1 * get2d( V, sV1, sV2, oV, 2, m22 );
				for ( j = k + 1; j <= jbot; j++ ) {
					refsum = get2d( H, sH1, sH2, oH, k + 1, j ) + get2d( V, sV1, sV2, oV, 2, m22 ) * get2d( H, sH1, sH2, oH, k + 2, j );
					set2d( H, sH1, sH2, oH, k + 1, j, get2d( H, sH1, sH2, oH, k + 1, j ) - refsum * t1 );
					set2d( H, sH1, sH2, oH, k + 2, j, get2d( H, sH1, sH2, oH, k + 2, j ) - refsum * t2 );
				}

				// ==== Convergence test ====
				if ( k >= KTOP ) {
					if ( get2d( H, sH1, sH2, oH, k + 1, k ) !== 0.0 ) {
						tst1 = Math.abs( get2d( H, sH1, sH2, oH, k, k ) ) + Math.abs( get2d( H, sH1, sH2, oH, k + 1, k + 1 ) );
						if ( tst1 === 0.0 ) {
							if ( k >= KTOP + 1 ) {
								tst1 += Math.abs( get2d( H, sH1, sH2, oH, k, k - 1 ) );
							}
							if ( k >= KTOP + 2 ) {
								tst1 += Math.abs( get2d( H, sH1, sH2, oH, k, k - 2 ) );
							}
							if ( k >= KTOP + 3 ) {
								tst1 += Math.abs( get2d( H, sH1, sH2, oH, k, k - 3 ) );
							}
							if ( k <= KBOT - 2 ) {
								tst1 += Math.abs( get2d( H, sH1, sH2, oH, k + 2, k + 1 ) );
							}
							if ( k <= KBOT - 3 ) {
								tst1 += Math.abs( get2d( H, sH1, sH2, oH, k + 3, k + 1 ) );
							}
							if ( k <= KBOT - 4 ) {
								tst1 += Math.abs( get2d( H, sH1, sH2, oH, k + 4, k + 1 ) );
							}
						}
						if ( Math.abs( get2d( H, sH1, sH2, oH, k + 1, k ) ) <= Math.max( smlnum, ULP * tst1 ) ) {
							h12 = Math.max( Math.abs( get2d( H, sH1, sH2, oH, k + 1, k ) ), Math.abs( get2d( H, sH1, sH2, oH, k, k + 1 ) ) );
							h21 = Math.min( Math.abs( get2d( H, sH1, sH2, oH, k + 1, k ) ), Math.abs( get2d( H, sH1, sH2, oH, k, k + 1 ) ) );
							h11 = Math.max( Math.abs( get2d( H, sH1, sH2, oH, k + 1, k + 1 ) ), Math.abs( get2d( H, sH1, sH2, oH, k, k ) - get2d( H, sH1, sH2, oH, k + 1, k + 1 ) ) );
							h22 = Math.min( Math.abs( get2d( H, sH1, sH2, oH, k + 1, k + 1 ) ), Math.abs( get2d( H, sH1, sH2, oH, k, k ) - get2d( H, sH1, sH2, oH, k + 1, k + 1 ) ) );
							scl = h11 + h12;
							tst2 = h22 * ( h11 / scl );

							if ( tst2 === 0.0 || h21 * ( h12 / scl ) <= Math.max( smlnum, ULP * tst2 ) ) {
								set2d( H, sH1, sH2, oH, k + 1, k, 0.0 );
							}
						}
					}
				}

				// ==== Accumulate orthogonal transformations. ====
				if ( accum ) {
					kms = k - incol;
					t1 = get2d( V, sV1, sV2, oV, 1, m22 );
					t2 = t1 * get2d( V, sV1, sV2, oV, 2, m22 );
					for ( j = Math.max( 1, KTOP - incol ); j <= kdu; j++ ) {
						refsum = get2d( U, sU1, sU2, oU, j, kms + 1 ) + get2d( V, sV1, sV2, oV, 2, m22 ) * get2d( U, sU1, sU2, oU, j, kms + 2 );
						set2d( U, sU1, sU2, oU, j, kms + 1, get2d( U, sU1, sU2, oU, j, kms + 1 ) - refsum * t1 );
						set2d( U, sU1, sU2, oU, j, kms + 2, get2d( U, sU1, sU2, oU, j, kms + 2 ) - refsum * t2 );
					}
				} else if ( wantz ) {
					t1 = get2d( V, sV1, sV2, oV, 1, m22 );
					t2 = t1 * get2d( V, sV1, sV2, oV, 2, m22 );
					for ( j = ILOZ; j <= IHIZ; j++ ) {
						refsum = get2d( Z, sZ1, sZ2, oZ, j, k + 1 ) + get2d( V, sV1, sV2, oV, 2, m22 ) * get2d( Z, sZ1, sZ2, oZ, j, k + 2 );
						set2d( Z, sZ1, sZ2, oZ, j, k + 1, get2d( Z, sZ1, sZ2, oZ, j, k + 1 ) - refsum * t1 );
						set2d( Z, sZ1, sZ2, oZ, j, k + 2, get2d( Z, sZ1, sZ2, oZ, j, k + 2 ) - refsum * t2 );
					}
				}
			} // end bmp22

			// ==== Normal case: Chain of 3-by-3 reflections ====
			// Fortran: DO 80 M = MBOT, MTOP, -1
			for ( m = mbot; m >= mtop; m-- ) {
				k = krcol + 2 * ( m - 1 );

				if ( k === KTOP - 1 ) {
					// Generate initial reflector from shifts
					dlaqr1( 3, H, sH1, sH2, idx2d( sH1, sH2, oH, KTOP, KTOP ), sr( 2 * m - 1 ), si( 2 * m - 1 ), sr( 2 * m ), si( 2 * m ), V, sV1, idx2d( sV1, sV2, oV, 1, m ) );

					alphaArr[ 0 ] = get2d( V, sV1, sV2, oV, 1, m );
					dlarfg( 3, alphaArr, 0, V, sV1, idx2d( sV1, sV2, oV, 2, m ), tauArr, 0 );
					set2d( V, sV1, sV2, oV, 1, m, tauArr[ 0 ] );
				} else {
					// ==== Perform delayed transformation of row below Mth bulge.
					//      Exploit fact that first two elements of row are actually zero. ====
					t1 = get2d( V, sV1, sV2, oV, 1, m );
					t2 = t1 * get2d( V, sV1, sV2, oV, 2, m );
					t3 = t1 * get2d( V, sV1, sV2, oV, 3, m );
					refsum = get2d( V, sV1, sV2, oV, 3, m ) * get2d( H, sH1, sH2, oH, k + 3, k + 2 );
					set2d( H, sH1, sH2, oH, k + 3, k, -refsum * t1 );
					set2d( H, sH1, sH2, oH, k + 3, k + 1, -refsum * t2 );
					set2d( H, sH1, sH2, oH, k + 3, k + 2, get2d( H, sH1, sH2, oH, k + 3, k + 2 ) - refsum * t3 );

					// ==== Calculate reflection to move Mth bulge one step. ====
					alphaArr[ 0 ] = get2d( H, sH1, sH2, oH, k + 1, k );
					set2d( V, sV1, sV2, oV, 2, m, get2d( H, sH1, sH2, oH, k + 2, k ) );
					set2d( V, sV1, sV2, oV, 3, m, get2d( H, sH1, sH2, oH, k + 3, k ) );
					dlarfg( 3, alphaArr, 0, V, sV1, idx2d( sV1, sV2, oV, 2, m ), tauArr, 0 );
					beta = alphaArr[ 0 ];
					set2d( V, sV1, sV2, oV, 1, m, tauArr[ 0 ] );

					// ==== A Bulge may collapse because of vigilant deflation

					//      Or destructive underflow. ====
					if ( get2d( H, sH1, sH2, oH, k + 3, k ) !== 0.0 || get2d( H, sH1, sH2, oH, k + 3, k + 1 ) !== 0.0 || get2d( H, sH1, sH2, oH, k + 3, k + 2 ) === 0.0 ) {
						// ==== Typical case: not collapsed (yet). ====
						set2d( H, sH1, sH2, oH, k + 1, k, beta );
						set2d( H, sH1, sH2, oH, k + 2, k, 0.0 );
						set2d( H, sH1, sH2, oH, k + 3, k, 0.0 );
					} else {
						// ==== Atypical case: collapsed. Attempt to reintroduce
						//      Ignoring H(K+1,K) and H(K+2,K). ====
						dlaqr1( 3, H, sH1, sH2, idx2d( sH1, sH2, oH, k + 1, k + 1 ), sr( 2 * m - 1 ), si( 2 * m - 1 ), sr( 2 * m ), si( 2 * m ), vt, 1, 0 );

						alphaArr[ 0 ] = vt[ 0 ];
						dlarfg( 3, alphaArr, 0, vt, 1, 1, tauArr, 0 );
						vt[ 0 ] = tauArr[ 0 ];

						t1 = vt[ 0 ];
						t2 = t1 * vt[ 1 ];
						t3 = t1 * vt[ 2 ];
						refsum = get2d( H, sH1, sH2, oH, k + 1, k ) + vt[ 1 ] * get2d( H, sH1, sH2, oH, k + 2, k );

						if ( Math.abs( get2d( H, sH1, sH2, oH, k + 2, k ) - refsum * t2 ) + Math.abs( refsum * t3 ) > ULP * ( Math.abs( get2d( H, sH1, sH2, oH, k, k ) ) + Math.abs( get2d( H, sH1, sH2, oH, k + 1, k + 1 ) ) + Math.abs( get2d( H, sH1, sH2, oH, k + 2, k + 2 ) ) ) ) {
							// ==== Starting a new bulge here would create non-negligible fill.
							//      Use the old one with trepidation. ====
							set2d( H, sH1, sH2, oH, k + 1, k, beta );
							set2d( H, sH1, sH2, oH, k + 2, k, 0.0 );
							set2d( H, sH1, sH2, oH, k + 3, k, 0.0 );
						} else {
							// ==== Starting a new bulge here would create only negligible fill.
							//      Replace the old reflector with the new one. ====
							set2d( H, sH1, sH2, oH, k + 1, k, get2d( H, sH1, sH2, oH, k + 1, k ) - refsum * t1 );
							set2d( H, sH1, sH2, oH, k + 2, k, 0.0 );
							set2d( H, sH1, sH2, oH, k + 3, k, 0.0 );
							set2d( V, sV1, sV2, oV, 1, m, vt[ 0 ] );
							set2d( V, sV1, sV2, oV, 2, m, vt[ 1 ] );
							set2d( V, sV1, sV2, oV, 3, m, vt[ 2 ] );
						}
					}
				}

				// ==== Apply reflection from the right and the first column of
				//      Update from the left. ====
				t1 = get2d( V, sV1, sV2, oV, 1, m );
				t2 = t1 * get2d( V, sV1, sV2, oV, 2, m );
				t3 = t1 * get2d( V, sV1, sV2, oV, 3, m );
				for ( j = jtop; j <= Math.min( KBOT, k + 3 ); j++ ) {
					refsum = get2d( H, sH1, sH2, oH, j, k + 1 ) + get2d( V, sV1, sV2, oV, 2, m ) * get2d( H, sH1, sH2, oH, j, k + 2 ) + get2d( V, sV1, sV2, oV, 3, m ) * get2d( H, sH1, sH2, oH, j, k + 3 );
					set2d( H, sH1, sH2, oH, j, k + 1, get2d( H, sH1, sH2, oH, j, k + 1 ) - refsum * t1 );
					set2d( H, sH1, sH2, oH, j, k + 2, get2d( H, sH1, sH2, oH, j, k + 2 ) - refsum * t2 );
					set2d( H, sH1, sH2, oH, j, k + 3, get2d( H, sH1, sH2, oH, j, k + 3 ) - refsum * t3 );
				}

				// ==== Perform update from left for subsequent column. ====
				refsum = get2d( H, sH1, sH2, oH, k + 1, k + 1 ) + get2d( V, sV1, sV2, oV, 2, m ) * get2d( H, sH1, sH2, oH, k + 2, k + 1 ) + get2d( V, sV1, sV2, oV, 3, m ) * get2d( H, sH1, sH2, oH, k + 3, k + 1 );
				set2d( H, sH1, sH2, oH, k + 1, k + 1, get2d( H, sH1, sH2, oH, k + 1, k + 1 ) - refsum * t1 );
				set2d( H, sH1, sH2, oH, k + 2, k + 1, get2d( H, sH1, sH2, oH, k + 2, k + 1 ) - refsum * t2 );
				set2d( H, sH1, sH2, oH, k + 3, k + 1, get2d( H, sH1, sH2, oH, k + 3, k + 1 ) - refsum * t3 );

				// ==== Convergence test ====
				if ( k < KTOP ) {
					continue;
				}
				if ( get2d( H, sH1, sH2, oH, k + 1, k ) !== 0.0 ) {
					tst1 = Math.abs( get2d( H, sH1, sH2, oH, k, k ) ) + Math.abs( get2d( H, sH1, sH2, oH, k + 1, k + 1 ) );
					if ( tst1 === 0.0 ) {
						if ( k >= KTOP + 1 ) {
							tst1 += Math.abs( get2d( H, sH1, sH2, oH, k, k - 1 ) );
						}
						if ( k >= KTOP + 2 ) {
							tst1 += Math.abs( get2d( H, sH1, sH2, oH, k, k - 2 ) );
						}
						if ( k >= KTOP + 3 ) {
							tst1 += Math.abs( get2d( H, sH1, sH2, oH, k, k - 3 ) );
						}
						if ( k <= KBOT - 2 ) {
							tst1 += Math.abs( get2d( H, sH1, sH2, oH, k + 2, k + 1 ) );
						}
						if ( k <= KBOT - 3 ) {
							tst1 += Math.abs( get2d( H, sH1, sH2, oH, k + 3, k + 1 ) );
						}
						if ( k <= KBOT - 4 ) {
							tst1 += Math.abs( get2d( H, sH1, sH2, oH, k + 4, k + 1 ) );
						}
					}
					if ( Math.abs( get2d( H, sH1, sH2, oH, k + 1, k ) ) <= Math.max( smlnum, ULP * tst1 ) ) {
						h12 = Math.max( Math.abs( get2d( H, sH1, sH2, oH, k + 1, k ) ), Math.abs( get2d( H, sH1, sH2, oH, k, k + 1 ) ) );
						h21 = Math.min( Math.abs( get2d( H, sH1, sH2, oH, k + 1, k ) ), Math.abs( get2d( H, sH1, sH2, oH, k, k + 1 ) ) );
						h11 = Math.max( Math.abs( get2d( H, sH1, sH2, oH, k + 1, k + 1 ) ), Math.abs( get2d( H, sH1, sH2, oH, k, k ) - get2d( H, sH1, sH2, oH, k + 1, k + 1 ) ) );
						h22 = Math.min( Math.abs( get2d( H, sH1, sH2, oH, k + 1, k + 1 ) ), Math.abs( get2d( H, sH1, sH2, oH, k, k ) - get2d( H, sH1, sH2, oH, k + 1, k + 1 ) ) );
						scl = h11 + h12;
						tst2 = h22 * ( h11 / scl );

						if ( tst2 === 0.0 || h21 * ( h12 / scl ) <= Math.max( smlnum, ULP * tst2 ) ) {
							set2d( H, sH1, sH2, oH, k + 1, k, 0.0 );
						}
					}
				}
			} // end DO 80

			// ==== Multiply H by reflections from the left ====
			if ( accum ) {
				jbot = Math.min( ndcol, KBOT );
			} else if ( wantt ) {
				jbot = N;
			} else {
				jbot = KBOT;
			}

			// Fortran: DO 100 M = MBOT, MTOP, -1
			for ( m = mbot; m >= mtop; m-- ) {
				k = krcol + 2 * ( m - 1 );
				t1 = get2d( V, sV1, sV2, oV, 1, m );
				t2 = t1 * get2d( V, sV1, sV2, oV, 2, m );
				t3 = t1 * get2d( V, sV1, sV2, oV, 3, m );
				for ( j = Math.max( KTOP, krcol + 2 * m ); j <= jbot; j++ ) {
					refsum = get2d( H, sH1, sH2, oH, k + 1, j ) + get2d( V, sV1, sV2, oV, 2, m ) * get2d( H, sH1, sH2, oH, k + 2, j ) + get2d( V, sV1, sV2, oV, 3, m ) * get2d( H, sH1, sH2, oH, k + 3, j );
					set2d( H, sH1, sH2, oH, k + 1, j, get2d( H, sH1, sH2, oH, k + 1, j ) - refsum * t1 );
					set2d( H, sH1, sH2, oH, k + 2, j, get2d( H, sH1, sH2, oH, k + 2, j ) - refsum * t2 );
					set2d( H, sH1, sH2, oH, k + 3, j, get2d( H, sH1, sH2, oH, k + 3, j ) - refsum * t3 );
				}
			}

			// ==== Accumulate orthogonal transformations. ====
			if ( accum ) {
				// ==== Accumulate U. ====
				for ( m = mbot; m >= mtop; m-- ) {
					k = krcol + 2 * ( m - 1 );
					kms = k - incol;
					i2 = Math.max( 1, KTOP - incol );
					i2 = Math.max( i2, kms - ( krcol - incol ) + 1 );
					i4 = Math.min( kdu, krcol + 2 * ( mbot - 1 ) - incol + 5 );
					t1 = get2d( V, sV1, sV2, oV, 1, m );
					t2 = t1 * get2d( V, sV1, sV2, oV, 2, m );
					t3 = t1 * get2d( V, sV1, sV2, oV, 3, m );
					for ( j = i2; j <= i4; j++ ) {
						refsum = get2d( U, sU1, sU2, oU, j, kms + 1 ) + get2d( V, sV1, sV2, oV, 2, m ) * get2d( U, sU1, sU2, oU, j, kms + 2 ) + get2d( V, sV1, sV2, oV, 3, m ) * get2d( U, sU1, sU2, oU, j, kms + 3 );
						set2d( U, sU1, sU2, oU, j, kms + 1, get2d( U, sU1, sU2, oU, j, kms + 1 ) - refsum * t1 );
						set2d( U, sU1, sU2, oU, j, kms + 2, get2d( U, sU1, sU2, oU, j, kms + 2 ) - refsum * t2 );
						set2d( U, sU1, sU2, oU, j, kms + 3, get2d( U, sU1, sU2, oU, j, kms + 3 ) - refsum * t3 );
					}
				}
			} else if ( wantz ) {
				// ==== U is not accumulated, so update Z now. ====
				for ( m = mbot; m >= mtop; m-- ) {
					k = krcol + 2 * ( m - 1 );
					t1 = get2d( V, sV1, sV2, oV, 1, m );
					t2 = t1 * get2d( V, sV1, sV2, oV, 2, m );
					t3 = t1 * get2d( V, sV1, sV2, oV, 3, m );
					for ( j = ILOZ; j <= IHIZ; j++ ) {
						refsum = get2d( Z, sZ1, sZ2, oZ, j, k + 1 ) + get2d( V, sV1, sV2, oV, 2, m ) * get2d( Z, sZ1, sZ2, oZ, j, k + 2 ) + get2d( V, sV1, sV2, oV, 3, m ) * get2d( Z, sZ1, sZ2, oZ, j, k + 3 );
						set2d( Z, sZ1, sZ2, oZ, j, k + 1, get2d( Z, sZ1, sZ2, oZ, j, k + 1 ) - refsum * t1 );
						set2d( Z, sZ1, sZ2, oZ, j, k + 2, get2d( Z, sZ1, sZ2, oZ, j, k + 2 ) - refsum * t2 );
						set2d( Z, sZ1, sZ2, oZ, j, k + 3, get2d( Z, sZ1, sZ2, oZ, j, k + 3 ) - refsum * t3 );
					}
				}
			}
		} // end DO 145 (krcol)

		// ==== Use U (if accumulated) to update far-from-diagonal entries in H.
		//      If required, use U to update Z as well. ====
		if ( accum ) {
			if ( wantt ) {
				jtop = 1;
				jbot = N;
			} else {
				jtop = KTOP;
				jbot = KBOT;
			}
			k1 = Math.max( 1, KTOP - incol );
			nu = ( kdu - Math.max( 0, ndcol - KBOT ) ) - k1 + 1;

			// ==== Horizontal Multiply ====

			// Fortran: DO 150 JCOL = MIN( NDCOL, KBOT ) + 1, JBOT, NH
			for ( jcol = Math.min( ndcol, KBOT ) + 1; jcol <= jbot; jcol += nh ) {
				jlen = Math.min( nh, jbot - jcol + 1 );

				// dgemm( 'C', 'N', nu, jlen, nu, 1.0, U(k1,k1), ..., H(incol+k1,jcol), ..., 0.0, WH, ... )
				dgemm( 'transpose', 'no-transpose', nu, jlen, nu, 1.0, U, sU1, sU2, idx2d( sU1, sU2, oU, k1, k1 ), H, sH1, sH2, idx2d( sH1, sH2, oH, incol + k1, jcol ), 0.0, WH, sWH1, sWH2, oWH );

				// dlacpy( 'ALL', nu, jlen, WH, ..., H(incol+k1, jcol), ... )
				dlacpy( 'ALL', nu, jlen, WH, sWH1, sWH2, oWH, H, sH1, sH2, idx2d( sH1, sH2, oH, incol + k1, jcol ) );
			}

			// ==== Vertical multiply ====
			// Fortran: DO 160 JROW = JTOP, MAX( KTOP, INCOL ) - 1, NV
			for ( jrow = jtop; jrow <= Math.max( KTOP, incol ) - 1; jrow += nv ) {
				jlen = Math.min( nv, Math.max( KTOP, incol ) - jrow );
				dgemm( 'no-transpose', 'no-transpose', jlen, nu, nu, 1.0, H, sH1, sH2, idx2d( sH1, sH2, oH, jrow, incol + k1 ), U, sU1, sU2, idx2d( sU1, sU2, oU, k1, k1 ), 0.0, WV, sWV1, sWV2, oWV );
				dlacpy( 'ALL', jlen, nu, WV, sWV1, sWV2, oWV, H, sH1, sH2, idx2d( sH1, sH2, oH, jrow, incol + k1 ) );
			}

			// ==== Z multiply (also vertical) ====
			if ( wantz ) {
				for ( jrow = ILOZ; jrow <= IHIZ; jrow += nv ) {
					jlen = Math.min( nv, IHIZ - jrow + 1 );
					dgemm( 'no-transpose', 'no-transpose', jlen, nu, nu, 1.0, Z, sZ1, sZ2, idx2d( sZ1, sZ2, oZ, jrow, incol + k1 ), U, sU1, sU2, idx2d( sU1, sU2, oU, k1, k1 ), 0.0, WV, sWV1, sWV2, oWV );
					dlacpy( 'ALL', jlen, nu, WV, sWV1, sWV2, oWV, Z, sZ1, sZ2, idx2d( sZ1, sZ2, oZ, jrow, incol + k1 ) );
				}
			}
		}
	} // end DO 180 (incol)
}


// EXPORTS //

export default dlaqr5;
