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

import dlamch from '../../dlamch/lib/base.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var TWO = 2.0;
var HALF = 0.5;
var EIGHT = 8.0;

var EPS = dlamch( 'precision' );
var SMLNUM = dlamch( 'safe-minimum' ) / EPS;

// DATA arrays (0-based)
var LOCU12 = [ 2, 3, 0, 1 ];  // Fortran: 3, 4, 1, 2
var LOCL21 = [ 1, 0, 3, 2 ];  // Fortran: 2, 1, 4, 3
var LOCU22 = [ 3, 2, 1, 0 ];  // Fortran: 4, 3, 2, 1
var XSWPIV = [ false, false, true, true ];
var BSWPIV = [ false, true, false, true ];


// MAIN //

/**
* Solves for the N1-by-N2 matrix X in:.
*
*   op(TL)_X + ISGN_X_op(TR) = SCALE_B
*
* where TL is N1-by-N1, TR is N2-by-N2, B is N1-by-N2, and 1 <= N1,N2 <= 2.
*
* @private
* @param {boolean} ltranl - if true, use transpose of TL
* @param {boolean} ltranr - if true, use transpose of TR
* @param {integer} isgn - +1 or -1
* @param {integer} n1 - order of TL (1 or 2)
* @param {integer} n2 - order of TR (1 or 2)
* @param {Float64Array} TL - N1-by-N1 matrix
* @param {integer} strideTL1 - stride of the first dimension of `TL`
* @param {integer} strideTL2 - stride of the second dimension of `TL`
* @param {NonNegativeInteger} offsetTL - starting index for `TL`
* @param {Float64Array} TR - N2-by-N2 matrix
* @param {integer} strideTR1 - stride of the first dimension of `TR`
* @param {integer} strideTR2 - stride of the second dimension of `TR`
* @param {NonNegativeInteger} offsetTR - starting index for `TR`
* @param {Float64Array} B - N1-by-N2 right-hand side
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} scale - output: scale[0] is the scaling factor
* @param {Float64Array} X - output N1-by-N2 solution matrix
* @param {integer} strideX1 - stride of the first dimension of `X`
* @param {integer} strideX2 - stride of the second dimension of `X`
* @param {NonNegativeInteger} offsetX - starting index for `X`
* @param {Float64Array} xnorm - output: xnorm[0] is the infinity-norm of X
* @returns {integer} info (0 = success, 1 = TL and TR have too-close eigenvalues)
*/
function dlasy2( ltranl, ltranr, isgn, n1, n2, TL, strideTL1, strideTL2, offsetTL, TR, strideTR1, strideTR2, offsetTR, B, strideB1, strideB2, offsetB, scale, X, strideX1, strideX2, offsetX, xnorm ) {
	var bswap;
	var xswap;
	var info;
	var smin;
	var temp;
	var ipiv;
	var ipsv;
	var jpsv;
	var xmax;
	var tau1;
	var btmp;
	var jpiv;
	var bet;
	var gam;
	var sgn;
	var u11;
	var u12;
	var u22;
	var l21;
	var tmp;
	var t16;
	var x2;
	var ip;
	var jp;
	var k;
	var i;
	var j;

	info = 0;

	// Quick return
	if ( n1 === 0 || n2 === 0 ) {
		return info;
	}

	sgn = isgn;
	k = n1 + n1 + n2 - 2;

	// ---- Case k=1: N1=1, N2=1 ----
	if ( k === 1 ) {
		tau1 = TL[ offsetTL ] + sgn * TR[ offsetTR ];
		bet = Math.abs( tau1 );
		if ( bet <= SMLNUM ) {
			tau1 = SMLNUM;
			bet = SMLNUM;
			info = 1;
		}
		scale[ 0 ] = ONE;
		gam = Math.abs( B[ offsetB ] );
		if ( SMLNUM * gam > bet ) {
			scale[ 0 ] = ONE / gam;
		}
		X[ offsetX ] = ( B[ offsetB ] * scale[ 0 ] ) / tau1;
		xnorm[ 0 ] = Math.abs( X[ offsetX ] );
		return info;
	}

	// ---- Case k=2: N1=1, N2=2 ----
	if ( k === 2 ) {
		smin = Math.max(EPS * Math.max(Math.abs( TL[ offsetTL ] ), Math.abs( TR[ offsetTR ] ), Math.abs( TR[ offsetTR + strideTR2 ] ), Math.abs( TR[ offsetTR + strideTR1 ] ), Math.abs( TR[ offsetTR + strideTR1 + strideTR2 ] )), SMLNUM);
		tmp = new Float64Array( 4 );
		tmp[ 0 ] = TL[ offsetTL ] + sgn * TR[ offsetTR ];
		tmp[ 3 ] = TL[ offsetTL ] + sgn * TR[ offsetTR + strideTR1 + strideTR2 ];
		if ( ltranr ) {
			tmp[ 1 ] = sgn * TR[ offsetTR + strideTR1 ];
			tmp[ 2 ] = sgn * TR[ offsetTR + strideTR2 ];
		} else {
			tmp[ 1 ] = sgn * TR[ offsetTR + strideTR2 ];
			tmp[ 2 ] = sgn * TR[ offsetTR + strideTR1 ];
		}
		btmp = new Float64Array( 4 );
		btmp[ 0 ] = B[ offsetB ];
		btmp[ 1 ] = B[ offsetB + strideB2 ];

		// Fall through to the 2x2 solve at label 40
		return solve2x2( tmp, btmp, smin, n1, scale, X, strideX1, strideX2, offsetX, xnorm );
	}

	// ---- Case k=3: N1=2, N2=1 ----
	if ( k === 3 ) {
		smin = Math.max(EPS * Math.max(Math.abs( TR[ offsetTR ] ), Math.abs( TL[ offsetTL ] ), Math.abs( TL[ offsetTL + strideTL2 ] ), Math.abs( TL[ offsetTL + strideTL1 ] ), Math.abs( TL[ offsetTL + strideTL1 + strideTL2 ] )), SMLNUM);
		tmp = new Float64Array( 4 );
		tmp[ 0 ] = TL[ offsetTL ] + sgn * TR[ offsetTR ];
		tmp[ 3 ] = TL[ offsetTL + strideTL1 + strideTL2 ] + sgn * TR[ offsetTR ];
		if ( ltranl ) {
			tmp[ 1 ] = TL[ offsetTL + strideTL2 ];
			tmp[ 2 ] = TL[ offsetTL + strideTL1 ];
		} else {
			tmp[ 1 ] = TL[ offsetTL + strideTL1 ];
			tmp[ 2 ] = TL[ offsetTL + strideTL2 ];
		}
		btmp = new Float64Array( 4 );
		btmp[ 0 ] = B[ offsetB ];
		btmp[ 1 ] = B[ offsetB + strideB1 ];
		return solve2x2( tmp, btmp, smin, n1, scale, X, strideX1, strideX2, offsetX, xnorm );
	}

	// ---- Case k=4: N1=2, N2=2 ----
	smin = Math.max(Math.abs( TR[ offsetTR ] ), Math.abs( TR[ offsetTR + strideTR2 ] ), Math.abs( TR[ offsetTR + strideTR1 ] ), Math.abs( TR[ offsetTR + strideTR1 + strideTR2 ] ));
	smin = Math.max(smin, Math.abs( TL[ offsetTL ] ), Math.abs( TL[ offsetTL + strideTL2 ] ), Math.abs( TL[ offsetTL + strideTL1 ] ), Math.abs( TL[ offsetTL + strideTL1 + strideTL2 ] ));
	smin = Math.max( EPS * smin, SMLNUM );

	btmp = new Float64Array( 4 );
	t16 = new Float64Array( 16 ); // 4x4 stored column-major with stride 4

	// Zero out t16 (already zero from allocation)

	t16[ 0 ] = TL[ offsetTL ] + sgn * TR[ offsetTR ]; // T16(1,1)
	t16[ 1 + 4 ] = TL[ offsetTL + strideTL1 + strideTL2 ] + sgn * TR[ offsetTR ]; // T16(2,2)
	t16[ 2 + 2 * 4 ] = TL[ offsetTL ] + sgn * TR[ offsetTR + strideTR1 + strideTR2 ]; // T16(3,3)
	t16[ 3 + 3 * 4 ] = TL[ offsetTL + strideTL1 + strideTL2 ] + sgn * TR[ offsetTR + strideTR1 + strideTR2 ]; // T16(4,4)

	if ( ltranl ) {
		t16[ 0 + 1 * 4 ] = TL[ offsetTL + strideTL1 ]; // T16(1,2) = TL(2,1)
		t16[ 1 + 0 * 4 ] = TL[ offsetTL + strideTL2 ]; // T16(2,1) = TL(1,2)
		t16[ 2 + 3 * 4 ] = TL[ offsetTL + strideTL1 ]; // T16(3,4) = TL(2,1)
		t16[ 3 + 2 * 4 ] = TL[ offsetTL + strideTL2 ]; // T16(4,3) = TL(1,2)
	} else {
		t16[ 0 + 1 * 4 ] = TL[ offsetTL + strideTL2 ]; // T16(1,2) = TL(1,2)
		t16[ 1 + 0 * 4 ] = TL[ offsetTL + strideTL1 ]; // T16(2,1) = TL(2,1)
		t16[ 2 + 3 * 4 ] = TL[ offsetTL + strideTL2 ]; // T16(3,4) = TL(1,2)
		t16[ 3 + 2 * 4 ] = TL[ offsetTL + strideTL1 ]; // T16(4,3) = TL(2,1)
	}
	if ( ltranr ) {
		t16[ 0 + 2 * 4 ] = sgn * TR[ offsetTR + strideTR2 ]; // T16(1,3) = sgn*TR(1,2)
		t16[ 1 + 3 * 4 ] = sgn * TR[ offsetTR + strideTR2 ]; // T16(2,4) = sgn*TR(1,2)
		t16[ 2 + 0 * 4 ] = sgn * TR[ offsetTR + strideTR1 ]; // T16(3,1) = sgn*TR(2,1)
		t16[ 3 + 1 * 4 ] = sgn * TR[ offsetTR + strideTR1 ]; // T16(4,2) = sgn*TR(2,1)
	} else {
		t16[ 0 + 2 * 4 ] = sgn * TR[ offsetTR + strideTR1 ]; // T16(1,3) = sgn*TR(2,1)
		t16[ 1 + 3 * 4 ] = sgn * TR[ offsetTR + strideTR1 ]; // T16(2,4) = sgn*TR(2,1)
		t16[ 2 + 0 * 4 ] = sgn * TR[ offsetTR + strideTR2 ]; // T16(3,1) = sgn*TR(1,2)
		t16[ 3 + 1 * 4 ] = sgn * TR[ offsetTR + strideTR2 ]; // T16(4,2) = sgn*TR(1,2)
	}

	btmp[ 0 ] = B[ offsetB ];
	btmp[ 1 ] = B[ offsetB + strideB1 ];
	btmp[ 2 ] = B[ offsetB + strideB2 ];
	btmp[ 3 ] = B[ offsetB + strideB1 + strideB2 ];

	// Gaussian elimination with complete pivoting
	jpiv = new Int32Array( 4 );

	for ( i = 0; i < 3; i++ ) {
		xmax = ZERO;
		ipsv = i;
		jpsv = i;
		for ( ip = i; ip < 4; ip++ ) {
			for ( jp = i; jp < 4; jp++ ) {
				if ( Math.abs( t16[ ip + jp * 4 ] ) >= xmax ) {
					xmax = Math.abs( t16[ ip + jp * 4 ] );
					ipsv = ip;
					jpsv = jp;
				}
			}
		}
		if ( ipsv !== i ) {
			// Swap rows ipsv and i in t16 (column-major, stride 4)
			dswap( 4, t16, 4, ipsv, t16, 4, i );
			temp = btmp[ i ];
			btmp[ i ] = btmp[ ipsv ];
			btmp[ ipsv ] = temp;
		}
		if ( jpsv !== i ) {
			// Swap columns jpsv and i in t16
			dswap( 4, t16, 1, jpsv * 4, t16, 1, i * 4 );
		}
		jpiv[ i ] = jpsv;
		if ( Math.abs( t16[ i + i * 4 ] ) < smin ) {
			info = 1;
			t16[ i + i * 4 ] = smin;
		}
		for ( j = i + 1; j < 4; j++ ) {
			t16[ j + i * 4 ] = t16[ j + i * 4 ] / t16[ i + i * 4 ];
			btmp[ j ] = btmp[ j ] - t16[ j + i * 4 ] * btmp[ i ];
			for ( k = i + 1; k < 4; k++ ) {
				t16[ j + k * 4 ] = t16[ j + k * 4 ] - t16[ j + i * 4 ] * t16[ i + k * 4 ];
			}
		}
	}
	if ( Math.abs( t16[ 3 + 3 * 4 ] ) < smin ) {
		info = 1;
		t16[ 3 + 3 * 4 ] = smin;
	}

	scale[ 0 ] = ONE;
	if ( ( EIGHT * SMLNUM ) * Math.abs( btmp[ 0 ] ) > Math.abs( t16[ 0 ] ) ||
		( EIGHT * SMLNUM ) * Math.abs( btmp[ 1 ] ) > Math.abs( t16[ 1 + 4 ] ) ||
		( EIGHT * SMLNUM ) * Math.abs( btmp[ 2 ] ) > Math.abs( t16[ 2 + 2 * 4 ] ) ||
		( EIGHT * SMLNUM ) * Math.abs( btmp[ 3 ] ) > Math.abs( t16[ 3 + 3 * 4 ] ) ) {
		scale[ 0 ] = ( ONE / EIGHT ) / Math.max(Math.abs( btmp[ 0 ] ), Math.abs( btmp[ 1 ] ), Math.abs( btmp[ 2 ] ), Math.abs( btmp[ 3 ] ));
		btmp[ 0 ] *= scale[ 0 ];
		btmp[ 1 ] *= scale[ 0 ];
		btmp[ 2 ] *= scale[ 0 ];
		btmp[ 3 ] *= scale[ 0 ];
	}

	// Back substitution
	tmp = new Float64Array( 4 );
	for ( i = 0; i < 4; i++ ) {
		k = 3 - i; // 3, 2, 1, 0 (Fortran: 4, 3, 2, 1)
		temp = ONE / t16[ k + k * 4 ];
		tmp[ k ] = btmp[ k ] * temp;
		for ( j = k + 1; j < 4; j++ ) {
			tmp[ k ] = tmp[ k ] - ( temp * t16[ k + j * 4 ] ) * tmp[ j ];
		}
	}

	// Undo column pivots
	for ( i = 0; i < 3; i++ ) {
		// Fortran: DO 130 I = 1, 3; IF JPIV(4-I).NE.4-I -> swap TMP(4-I) and TMP(JPIV(4-I))
		k = 2 - i; // 2, 1, 0 (Fortran index 4-I maps to 0-based 3-I, but jpiv stored 0-based)
		if ( jpiv[ k ] !== k ) {
			temp = tmp[ k ];
			tmp[ k ] = tmp[ jpiv[ k ] ];
			tmp[ jpiv[ k ] ] = temp;
		}
	}

	X[ offsetX ] = tmp[ 0 ];
	X[ offsetX + strideX1 ] = tmp[ 1 ];
	X[ offsetX + strideX2 ] = tmp[ 2 ];
	X[ offsetX + strideX1 + strideX2 ] = tmp[ 3 ];
	xnorm[ 0 ] = Math.max(Math.abs( tmp[ 0 ] ) + Math.abs( tmp[ 2 ] ), Math.abs( tmp[ 1 ] ) + Math.abs( tmp[ 3 ] ));
	return info;
}

/**
* Solves the 2x2 linear system using partial pivoting (shared by k=2 and k=3 cases).
*
* @private
*/
function solve2x2( tmp, btmp, smin, n1, scale, X, strideX1, strideX2, offsetX, xnorm ) {
	var bswap;
	var xswap;
	var ipiv;
	var info;
	var temp;
	var u11;
	var u12;
	var u22;
	var l21;
	var x2;

	info = 0;

	// Partial pivoting
	ipiv = idamax( 4, tmp, 1, 0 );
	u11 = tmp[ ipiv ];
	if ( Math.abs( u11 ) <= smin ) {
		info = 1;
		u11 = smin;
	}
	u12 = tmp[ LOCU12[ ipiv ] ];
	l21 = tmp[ LOCL21[ ipiv ] ] / u11;
	u22 = tmp[ LOCU22[ ipiv ] ] - u12 * l21;
	xswap = XSWPIV[ ipiv ];
	bswap = BSWPIV[ ipiv ];
	if ( Math.abs( u22 ) <= smin ) {
		info = 1;
		u22 = smin;
	}
	if ( bswap ) {
		temp = btmp[ 1 ];
		btmp[ 1 ] = btmp[ 0 ] - l21 * temp;
		btmp[ 0 ] = temp;
	} else {
		btmp[ 1 ] -= l21 * btmp[ 0 ];
	}
	scale[ 0 ] = ONE;
	if ( ( TWO * SMLNUM ) * Math.abs( btmp[ 1 ] ) > Math.abs( u22 ) ||
		( TWO * SMLNUM ) * Math.abs( btmp[ 0 ] ) > Math.abs( u11 ) ) {
		scale[ 0 ] = HALF / Math.max( Math.abs( btmp[ 0 ] ), Math.abs( btmp[ 1 ] ) );
		btmp[ 0 ] *= scale[ 0 ];
		btmp[ 1 ] *= scale[ 0 ];
	}
	x2 = new Float64Array( 2 );
	x2[ 1 ] = btmp[ 1 ] / u22;
	x2[ 0 ] = btmp[ 0 ] / u11 - ( u12 / u11 ) * x2[ 1 ];
	if ( xswap ) {
		temp = x2[ 1 ];
		x2[ 1 ] = x2[ 0 ];
		x2[ 0 ] = temp;
	}
	X[ offsetX ] = x2[ 0 ];
	if ( n1 === 1 ) {
		X[ offsetX + strideX2 ] = x2[ 1 ];
		xnorm[ 0 ] = Math.abs( X[ offsetX ] ) + Math.abs( X[ offsetX + strideX2 ] );
	} else {
		X[ offsetX + strideX1 ] = x2[ 1 ];
		xnorm[ 0 ] = Math.max( Math.abs( X[ offsetX ] ), Math.abs( X[ offsetX + strideX1 ] ) );
	}
	return info;
}


// EXPORTS //

export default dlasy2;
