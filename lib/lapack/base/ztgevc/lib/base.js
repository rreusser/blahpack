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

/* eslint-disable max-len, max-params, no-shadow */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import zladiv from '../../zladiv/lib/base.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var CZERO = new Complex128( 0.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );

// Scratch Complex128Array buffers for zladiv calls:
var ZLADIV_X = new Complex128Array( 1 );
var ZLADIV_Y = new Complex128Array( 1 );
var ZLADIV_OUT = new Complex128Array( 1 );
var ZLADIV_Xv = reinterpret( ZLADIV_X, 0 );
var ZLADIV_Yv = reinterpret( ZLADIV_Y, 0 );
var ZLADIV_OUTv = reinterpret( ZLADIV_OUT, 0 );


// FUNCTIONS //

/**
* ABS1: |re| + |im| (cheap complex absolute value).
*
* @private
* @param {Float64Array} arr - interleaved complex array
* @param {integer} idx - index of real part
* @returns {number} |re| + |im|
*/
function abs1( arr, idx ) {
	return Math.abs( arr[ idx ] ) + Math.abs( arr[ idx + 1 ] );
}


// MAIN //

/**
* Compute some or all of the right and/or left eigenvectors of a pair of.
* complex upper triangular matrices (S, P).
*
* Matrix pair (S, P) must be in generalized Schur form (both upper triangular).
* P must have real non-negative diagonal entries.
*
* SIDE = 'R': right eigenvectors only
* SIDE = 'L': left eigenvectors only
* SIDE = 'B': right and left eigenvectors
*
* HOWMNY = 'A': compute all eigenvectors
* HOWMNY = 'B': compute all eigenvectors and backtransform using VL/VR
* HOWMNY = 'S': compute selected eigenvectors (specified by SELECT)
*
* @private
* @param {string} side - `'right'`, `'left'`, or `'both'`
* @param {string} howmny - `'all'`, `'backtransform'`, or `'selected'`
* @param {BooleanArray} SELECT - logical array of length N (used when howmny=`'selected'`)
* @param {integer} strideSELECT - stride for SELECT
* @param {NonNegativeInteger} offsetSELECT - offset for SELECT
* @param {NonNegativeInteger} N - order of matrices
* @param {Complex128Array} S - upper triangular matrix
* @param {integer} strideS1 - first dim stride of S (complex elements)
* @param {integer} strideS2 - second dim stride of S (complex elements)
* @param {NonNegativeInteger} offsetS - starting index for S (complex elements)
* @param {Complex128Array} P - upper triangular matrix with real diagonal
* @param {integer} strideP1 - first dim stride of P (complex elements)
* @param {integer} strideP2 - second dim stride of P (complex elements)
* @param {NonNegativeInteger} offsetP - starting index for P (complex elements)
* @param {Complex128Array} VL - left eigenvectors (modified in-place)
* @param {integer} strideVL1 - first dim stride of VL (complex elements)
* @param {integer} strideVL2 - second dim stride of VL (complex elements)
* @param {NonNegativeInteger} offsetVL - starting index for VL (complex elements)
* @param {Complex128Array} VR - right eigenvectors (modified in-place)
* @param {integer} strideVR1 - first dim stride of VR (complex elements)
* @param {integer} strideVR2 - second dim stride of VR (complex elements)
* @param {NonNegativeInteger} offsetVR - starting index for VR (complex elements)
* @param {NonNegativeInteger} mm - number of columns in VL/VR
* @param {Array<integer>} M - output: number of eigenvectors computed (M[0])
* @param {Complex128Array} WORK - workspace (length >= 2*N)
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace (length >= 2*N)
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - offset for RWORK
* @returns {integer} 0 on success
*/
function ztgevc( side, howmny, SELECT, strideSELECT, offsetSELECT, N, S, strideS1, strideS2, offsetS, P, strideP1, strideP2, offsetP, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) {
	var bignum;
	var safmin;
	var acoefa;
	var acoeff;
	var ascale;
	var bcoefa;
	var bscale;
	var ilback;
	var salpha;
	var bcoeff;
	var sumaRe;
	var sumaIm;
	var sumbRe;
	var sumbIm;
	var ilcomp;
	var anorm;
	var bnorm;
	var compl;
	var compr;
	var small;
	var scale;
	var ilall;
	var sbeta;
	var WORKv;
	var dmin;
	var temp;
	var xmax;
	var sVL1;
	var sVL2;
	var sVR1;
	var sVR2;
	var ieig;
	var isrc;
	var ibeg;
	var iend;
	var idx2;
	var sjjr;
	var sjji;
	var pjjr;
	var pjji;
	var big;
	var ulp;
	var lsa;
	var lsb;
	var sS1;
	var sS2;
	var sP1;
	var sP2;
	var oVL;
	var oVR;
	var sum;
	var idx;
	var VLv;
	var VRv;
	var srr;
	var sri;
	var prr;
	var pri;
	var oS;
	var oP;
	var je;
	var jr;
	var ca;
	var cb;
	var im;
	var Sv;
	var Pv;
	var sr;
	var si;
	var pr;
	var pi;
	var dr;
	var di;
	var d;
	var j;
	var i;

	compl = ( side === 'left' || side === 'both' );
	compr = ( side === 'right' || side === 'both' );
	ilback = ( howmny === 'backtransform' );
	ilall = ( howmny === 'all' || howmny === 'backtransform' );

	if ( N === 0 ) {
		M[ 0 ] = 0;
		return 0;
	}

	// Count the number of eigenvectors to compute
	if ( ilall ) {
		im = N;
	} else {
		im = 0;
		for ( j = 0; j < N; j++ ) {
			if ( SELECT[ offsetSELECT + (j * strideSELECT) ] ) {
				im += 1;
			}
		}
	}

	M[ 0 ] = im;

	// Get Float64Array views for direct element access
	Sv = reinterpret( S, 0 );
	Pv = reinterpret( P, 0 );
	VLv = reinterpret( VL, 0 );
	VRv = reinterpret( VR, 0 );
	WORKv = reinterpret( WORK, 0 );

	// Convert complex-element strides/offsets to Float64 units
	sS1 = strideS1 * 2;
	sS2 = strideS2 * 2;
	oS = offsetS * 2;
	sP1 = strideP1 * 2;
	sP2 = strideP2 * 2;
	oP = offsetP * 2;
	sVL1 = strideVL1 * 2;
	sVL2 = strideVL2 * 2;
	oVL = offsetVL * 2;
	sVR1 = strideVR1 * 2;
	sVR2 = strideVR2 * 2;
	oVR = offsetVR * 2;

	// Machine constants
	safmin = dlamch( 'Safe minimum' );
	big = ONE / safmin;
	ulp = dlamch( 'Epsilon' ) * dlamch( 'Base' );
	small = safmin * N / ulp;
	big = ONE / small;
	bignum = ONE / ( safmin * N );

	// Compute norms of S and P
	anorm = abs1( Sv, oS );
	bnorm = abs1( Pv, oP );
	RWORK[ offsetRWORK ] = ZERO;
	RWORK[ offsetRWORK + (N * strideRWORK) ] = ZERO;
	for ( j = 1; j < N; j++ ) {
		RWORK[ offsetRWORK + (j * strideRWORK) ] = ZERO;
		RWORK[ offsetRWORK + (( N + j ) * strideRWORK) ] = ZERO;
		for ( i = 0; i < j; i++ ) {
			RWORK[ offsetRWORK + (j * strideRWORK) ] += abs1( Sv, oS + (i * sS1) + (j * sS2) );
			RWORK[ offsetRWORK + (( N + j ) * strideRWORK) ] += abs1( Pv, oP + (i * sP1) + (j * sP2) );
		}
		anorm = Math.max( anorm, RWORK[ offsetRWORK + (j * strideRWORK) ] + abs1( Sv, oS + (j * sS1) + (j * sS2) ) );
		bnorm = Math.max( bnorm, RWORK[ offsetRWORK + (( N + j ) * strideRWORK) ] + abs1( Pv, oP + (j * sP1) + (j * sP2) ) );
	}

	ascale = ONE / Math.max( anorm, safmin );
	bscale = ONE / Math.max( bnorm, safmin );

	// Temporary complex scalars
	salpha = new Float64Array( 2 );
	bcoeff = new Float64Array( 2 );
	sum = new Float64Array( 2 );
	d = new Float64Array( 2 );
	ca = new Float64Array( 2 );
	cb = new Float64Array( 2 );

	// ========================

	// LEFT EIGENVECTORS

	// ========================
	if ( compl ) {
		ieig = 0;

		for ( je = 0; je < N; je++ ) {
			if ( ilall ) {
				ilcomp = true;
			} else {
				ilcomp = SELECT[ offsetSELECT + (je * strideSELECT) ];
			}
			if ( !ilcomp ) {
				continue;
			}
			ieig += 1;

			idx = oS + (je * sS1) + (je * sS2);
			idx2 = oP + (je * sP1) + (je * sP2);

			if ( abs1( Sv, idx ) <= safmin && Math.abs( Pv[ idx2 ] ) <= safmin ) {
				// Zero eigenvalue - set eigenvector to unit vector
				for ( jr = 0; jr < N; jr++ ) {
					VLv[ oVL + (jr * sVL1) + (( ieig - 1 ) * sVL2) ] = 0.0;
					VLv[ oVL + (jr * sVL1) + (( ieig - 1 ) * sVL2) + 1 ] = 0.0;
				}
				VLv[ oVL + (( ieig - 1 ) * sVL1) + (( ieig - 1 ) * sVL2) ] = 1.0;
				VLv[ oVL + (( ieig - 1 ) * sVL1) + (( ieig - 1 ) * sVL2) + 1 ] = 0.0;
				continue;
			}

			// Compute scaling
			temp = ONE / Math.max(
				abs1( Sv, idx ) * ascale,
				Math.abs( Pv[ idx2 ] ) * bscale,
				safmin
			);
			salpha[ 0 ] = ( temp * Sv[ idx ] ) * ascale;
			salpha[ 1 ] = ( temp * Sv[ idx + 1 ] ) * ascale;
			sbeta = ( temp * Pv[ idx2 ] ) * bscale;
			acoeff = sbeta * ascale;
			bcoeff[ 0 ] = salpha[ 0 ] * bscale;
			bcoeff[ 1 ] = salpha[ 1 ] * bscale;

			// Scale to avoid overflow
			lsa = Math.abs( sbeta ) >= safmin && Math.abs( acoeff ) < small;
			lsb = abs1( salpha, 0 ) >= safmin && abs1( bcoeff, 0 ) < small;

			scale = ONE;
			if ( lsa ) {
				scale = ( small / Math.abs( sbeta ) ) * Math.min( anorm, big );
			}
			if ( lsb ) {
				scale = Math.max( scale, ( small / abs1( salpha, 0 ) ) * Math.min( bnorm, big ) );
			}
			if ( lsa || lsb ) {
				scale = Math.min( scale, ONE / ( safmin * Math.max( ONE, Math.abs( acoeff ), abs1( bcoeff, 0 ) ) ) );
				if ( lsa ) {
					acoeff = ascale * ( scale * sbeta );
				} else {
					acoeff *= scale;
				}
				if ( lsb ) {
					bcoeff[ 0 ] = bscale * ( scale * salpha[ 0 ] );
					bcoeff[ 1 ] = bscale * ( scale * salpha[ 1 ] );
				} else {
					bcoeff[ 0 ] *= scale;
					bcoeff[ 1 ] *= scale;
				}
			}

			acoefa = Math.abs( acoeff );
			bcoefa = abs1( bcoeff, 0 );
			xmax = ONE;

			// Initialize WORK
			for ( jr = 0; jr < N; jr++ ) {
				WORKv[ jr * 2 ] = 0.0;
				WORKv[ (jr * 2) + 1 ] = 0.0;
			}
			WORKv[ je * 2 ] = 1.0;
			WORKv[ (je * 2) + 1 ] = 0.0;

			dmin = Math.max( ulp * acoefa * anorm, ulp * bcoefa * bnorm, safmin );

			// Triangular solve: forward substitution for left eigenvectors
			for ( j = je + 1; j < N; j++ ) {
				// Scale to avoid overflow
				temp = ONE / xmax;
				if ( (acoefa * RWORK[ offsetRWORK + (j * strideRWORK) ]) + (bcoefa * RWORK[ offsetRWORK + (( N + j ) * strideRWORK) ]) > (bignum * temp) ) {
					for ( jr = je; jr < j; jr++ ) {
						WORKv[ jr * 2 ] *= temp;
						WORKv[ (jr * 2) + 1 ] *= temp;
					}
					xmax = ONE;
				}

				// Compute sum
				sumaRe = 0.0;
				sumaIm = 0.0;
				sumbRe = 0.0;
				sumbIm = 0.0;

				for ( jr = je; jr < j; jr++ ) {
					// SUMA += CONJG(S(JR,J)) * WORK(JR)
					sr = Sv[ oS + (jr * sS1) + (j * sS2) ];
					si = -Sv[ oS + (jr * sS1) + (j * sS2) + 1 ]; // conjugate
					sumaRe += (sr * WORKv[ jr * 2 ]) - (si * WORKv[ (jr * 2) + 1 ]);
					sumaIm += (sr * WORKv[ (jr * 2) + 1 ]) + (si * WORKv[ jr * 2 ]);

					// SUMB += CONJG(P(JR,J)) * WORK(JR)
					pr = Pv[ oP + (jr * sP1) + (j * sP2) ];
					pi = -Pv[ oP + (jr * sP1) + (j * sP2) + 1 ]; // conjugate
					sumbRe += (pr * WORKv[ jr * 2 ]) - (pi * WORKv[ (jr * 2) + 1 ]);
					sumbIm += (pr * WORKv[ (jr * 2) + 1 ]) + (pi * WORKv[ jr * 2 ]);
				}

				// SUM = ACOEFF * SUMA - CONJG(BCOEFF) * SUMB
				sum[ 0 ] = (acoeff * sumaRe) - ( (bcoeff[ 0 ] * sumbRe) + (bcoeff[ 1 ] * sumbIm) );
				sum[ 1 ] = (acoeff * sumaIm) - ( (bcoeff[ 0 ] * sumbIm) - (bcoeff[ 1 ] * sumbRe) );

				// D = CONJG(ACOEFF * S(J,J) - BCOEFF * P(J,J))
				sjjr = Sv[ oS + (j * sS1) + (j * sS2) ];
				sjji = Sv[ oS + (j * sS1) + (j * sS2) + 1 ];
				pjjr = Pv[ oP + (j * sP1) + (j * sP2) ];
				pjji = Pv[ oP + (j * sP1) + (j * sP2) + 1 ];

				dr = (acoeff * sjjr) - ( (bcoeff[ 0 ] * pjjr) - (bcoeff[ 1 ] * pjji) );
				di = (acoeff * sjji) - ( (bcoeff[ 0 ] * pjji) + (bcoeff[ 1 ] * pjjr) );
				d[ 0 ] = dr;
				d[ 1 ] = -di; // conjugate

				if ( abs1( d, 0 ) <= dmin ) {
					d[ 0 ] = dmin;
					d[ 1 ] = 0.0;
				}

				if ( abs1( d, 0 ) < ONE ) {
					if ( abs1( sum, 0 ) >= bignum * abs1( d, 0 ) ) {
						temp = ONE / abs1( sum, 0 );
						for ( jr = je; jr < j; jr++ ) {
							WORKv[ jr * 2 ] *= temp;
							WORKv[ (jr * 2) + 1 ] *= temp;
						}
						xmax *= temp;
						sum[ 0 ] *= temp;
						sum[ 1 ] *= temp;
					}
				}

				// WORK(J) = ZLADIV(-SUM, D)
				ZLADIV_Xv[ 0 ] = -sum[ 0 ];
				ZLADIV_Xv[ 1 ] = -sum[ 1 ];
				ZLADIV_Yv[ 0 ] = d[ 0 ];
				ZLADIV_Yv[ 1 ] = d[ 1 ];
				zladiv( ZLADIV_X, 0, ZLADIV_Y, 0, ZLADIV_OUT, 0 );
				WORKv[ j * 2 ] = ZLADIV_OUTv[ 0 ];
				WORKv[ (j * 2) + 1 ] = ZLADIV_OUTv[ 1 ];
				xmax = Math.max( xmax, abs1( WORKv, j * 2 ) );
			}

			// Back-transform or copy result
			if ( ilback ) {
				// WORK(N+1:2N) = VL * WORK(JE:N)
				zgemv(
					'no-transpose', N, N - je, CONE, VL, strideVL1, strideVL2, offsetVL + (je * strideVL2),
					WORK, 1, je, CZERO, WORK, 1, N
				);
				isrc = 1; // result in WORKv[N*2..]
				ibeg = 0;
			} else {
				isrc = 0; // result in WORKv[0..]
				ibeg = je;
			}

			// Normalize and store in VL
			xmax = ZERO;
			for ( jr = ibeg; jr < N; jr++ ) {
				xmax = Math.max( xmax, abs1( WORKv, (isrc * (N * 2)) + (jr * 2) ) );
			}

			if ( xmax > safmin ) {
				temp = ONE / xmax;
				for ( jr = ibeg; jr < N; jr++ ) {
					VLv[ oVL + (jr * sVL1) + (( ieig - 1 ) * sVL2) ] = temp * WORKv[ (isrc * (N * 2)) + (jr * 2) ];
					VLv[ oVL + (jr * sVL1) + (( ieig - 1 ) * sVL2) + 1 ] = temp * WORKv[ (isrc * (N * 2)) + (jr * 2) + 1 ];
				}
			} else {
				ibeg = N;
			}

			for ( jr = 0; jr < ibeg; jr++ ) {
				VLv[ oVL + (jr * sVL1) + (( ieig - 1 ) * sVL2) ] = 0.0;
				VLv[ oVL + (jr * sVL1) + (( ieig - 1 ) * sVL2) + 1 ] = 0.0;
			}
		}
	}

	// ========================
	// RIGHT EIGENVECTORS
	// ========================
	if ( compr ) {
		ieig = im;

		for ( je = N - 1; je >= 0; je-- ) {
			if ( ilall ) {
				ilcomp = true;
			} else {
				ilcomp = SELECT[ offsetSELECT + (je * strideSELECT) ];
			}
			if ( !ilcomp ) {
				continue;
			}

			idx = oS + (je * sS1) + (je * sS2);
			idx2 = oP + (je * sP1) + (je * sP2);

			if ( abs1( Sv, idx ) <= safmin && Math.abs( Pv[ idx2 ] ) <= safmin ) {
				// Zero eigenvalue
				for ( jr = 0; jr < N; jr++ ) {
					VRv[ oVR + (jr * sVR1) + (( ieig - 1 ) * sVR2) ] = 0.0;
					VRv[ oVR + (jr * sVR1) + (( ieig - 1 ) * sVR2) + 1 ] = 0.0;
				}
				VRv[ oVR + (( ieig - 1 ) * sVR1) + (( ieig - 1 ) * sVR2) ] = 1.0;
				VRv[ oVR + (( ieig - 1 ) * sVR1) + (( ieig - 1 ) * sVR2) + 1 ] = 0.0;
				ieig -= 1;
				continue;
			}

			// Compute scaling
			temp = ONE / Math.max(
				abs1( Sv, idx ) * ascale,
				Math.abs( Pv[ idx2 ] ) * bscale,
				safmin
			);
			salpha[ 0 ] = ( temp * Sv[ idx ] ) * ascale;
			salpha[ 1 ] = ( temp * Sv[ idx + 1 ] ) * ascale;
			sbeta = ( temp * Pv[ idx2 ] ) * bscale;
			acoeff = sbeta * ascale;
			bcoeff[ 0 ] = salpha[ 0 ] * bscale;
			bcoeff[ 1 ] = salpha[ 1 ] * bscale;

			lsa = Math.abs( sbeta ) >= safmin && Math.abs( acoeff ) < small;
			lsb = abs1( salpha, 0 ) >= safmin && abs1( bcoeff, 0 ) < small;

			scale = ONE;
			if ( lsa ) {
				scale = ( small / Math.abs( sbeta ) ) * Math.min( anorm, big );
			}
			if ( lsb ) {
				scale = Math.max( scale, ( small / abs1( salpha, 0 ) ) * Math.min( bnorm, big ) );
			}
			if ( lsa || lsb ) {
				scale = Math.min( scale, ONE / ( safmin * Math.max( ONE, Math.abs( acoeff ), abs1( bcoeff, 0 ) ) ) );
				if ( lsa ) {
					acoeff = ascale * ( scale * sbeta );
				} else {
					acoeff *= scale;
				}
				if ( lsb ) {
					bcoeff[ 0 ] = bscale * ( scale * salpha[ 0 ] );
					bcoeff[ 1 ] = bscale * ( scale * salpha[ 1 ] );
				} else {
					bcoeff[ 0 ] *= scale;
					bcoeff[ 1 ] *= scale;
				}
			}

			acoefa = Math.abs( acoeff );
			bcoefa = abs1( bcoeff, 0 );
			xmax = ONE;

			// Initialize WORK
			for ( jr = 0; jr < N; jr++ ) {
				WORKv[ jr * 2 ] = 0.0;
				WORKv[ (jr * 2) + 1 ] = 0.0;
			}
			WORKv[ je * 2 ] = 1.0;
			WORKv[ (je * 2) + 1 ] = 0.0;

			dmin = Math.max( ulp * acoefa * anorm, ulp * bcoefa * bnorm, safmin );

			// Initialize WORK(1:JE-1) = ACOEFF * S(:,JE) - BCOEFF * P(:,JE)
			for ( jr = 0; jr < je; jr++ ) {
				srr = Sv[ oS + (jr * sS1) + (je * sS2) ];
				sri = Sv[ oS + (jr * sS1) + (je * sS2) + 1 ];
				prr = Pv[ oP + (jr * sP1) + (je * sP2) ];
				pri = Pv[ oP + (jr * sP1) + (je * sP2) + 1 ];
				WORKv[ jr * 2 ] = (acoeff * srr) - ( (bcoeff[ 0 ] * prr) - (bcoeff[ 1 ] * pri) );
				WORKv[ (jr * 2) + 1 ] = (acoeff * sri) - ( (bcoeff[ 0 ] * pri) + (bcoeff[ 1 ] * prr) );
			}

			// Back-substitution
			for ( j = je - 1; j >= 0; j-- ) {
				// D = ACOEFF * S(J,J) - BCOEFF * P(J,J)
				sjjr = Sv[ oS + (j * sS1) + (j * sS2) ];
				sjji = Sv[ oS + (j * sS1) + (j * sS2) + 1 ];
				pjjr = Pv[ oP + (j * sP1) + (j * sP2) ];
				pjji = Pv[ oP + (j * sP1) + (j * sP2) + 1 ];

				d[ 0 ] = (acoeff * sjjr) - ( (bcoeff[ 0 ] * pjjr) - (bcoeff[ 1 ] * pjji) );
				d[ 1 ] = (acoeff * sjji) - ( (bcoeff[ 0 ] * pjji) + (bcoeff[ 1 ] * pjjr) );

				if ( abs1( d, 0 ) <= dmin ) {
					d[ 0 ] = dmin;
					d[ 1 ] = 0.0;
				}

				if ( abs1( d, 0 ) < ONE ) {
					if ( abs1( WORKv, j * 2 ) >= bignum * abs1( d, 0 ) ) {
						temp = ONE / abs1( WORKv, j * 2 );
						for ( jr = 0; jr <= je; jr++ ) {
							WORKv[ jr * 2 ] *= temp;
							WORKv[ (jr * 2) + 1 ] *= temp;
						}
					}
				}

				// WORK(J) = ZLADIV(-WORK(J), D)
				ZLADIV_Xv[ 0 ] = -WORKv[ j * 2 ];
				ZLADIV_Xv[ 1 ] = -WORKv[ (j * 2) + 1 ];
				ZLADIV_Yv[ 0 ] = d[ 0 ];
				ZLADIV_Yv[ 1 ] = d[ 1 ];
				zladiv( ZLADIV_X, 0, ZLADIV_Y, 0, ZLADIV_OUT, 0 );
				WORKv[ j * 2 ] = ZLADIV_OUTv[ 0 ];
				WORKv[ (j * 2) + 1 ] = ZLADIV_OUTv[ 1 ];

				if ( j > 0 ) {
					// Scale to avoid overflow and update
					if ( abs1( WORKv, j * 2 ) > ONE ) {
						temp = ONE / abs1( WORKv, j * 2 );
						if ( (acoefa * RWORK[ offsetRWORK + (j * strideRWORK) ]) + (bcoefa * RWORK[ offsetRWORK + (( N + j ) * strideRWORK) ]) >= (bignum * temp) ) {
							for ( jr = 0; jr <= je; jr++ ) {
								WORKv[ jr * 2 ] *= temp;
								WORKv[ (jr * 2) + 1 ] *= temp;
							}
						}
					}

					// CA = ACOEFF * WORK(J)
					ca[ 0 ] = acoeff * WORKv[ j * 2 ];
					ca[ 1 ] = acoeff * WORKv[ (j * 2) + 1 ];

					// CB = BCOEFF * WORK(J)
					cb[ 0 ] = (bcoeff[ 0 ] * WORKv[ j * 2 ]) - (bcoeff[ 1 ] * WORKv[ (j * 2) + 1 ]);
					cb[ 1 ] = (bcoeff[ 0 ] * WORKv[ (j * 2) + 1 ]) + (bcoeff[ 1 ] * WORKv[ j * 2 ]);

					for ( jr = 0; jr < j; jr++ ) {
						// WORK(JR) += CA * S(JR,J) - CB * P(JR,J)
						sr = Sv[ oS + (jr * sS1) + (j * sS2) ];
						si = Sv[ oS + (jr * sS1) + (j * sS2) + 1 ];
						pr = Pv[ oP + (jr * sP1) + (j * sP2) ];
						pi = Pv[ oP + (jr * sP1) + (j * sP2) + 1 ];

						WORKv[ jr * 2 ] += ( (ca[ 0 ] * sr) - (ca[ 1 ] * si) ) - ( (cb[ 0 ] * pr) - (cb[ 1 ] * pi) );
						WORKv[ (jr * 2) + 1 ] += ( (ca[ 0 ] * si) + (ca[ 1 ] * sr) ) - ( (cb[ 0 ] * pi) + (cb[ 1 ] * pr) );
					}
				}
			}

			// Back-transform or copy result
			if ( ilback ) {
				zgemv(
					'no-transpose', N, je + 1, CONE, VR, strideVR1, strideVR2, offsetVR,
					WORK, 1, 0, CZERO, WORK, 1, N
				);
				isrc = 1;
				iend = N;
			} else {
				isrc = 0;
				iend = je + 1;
			}

			// Normalize and store in VR
			xmax = ZERO;
			for ( jr = 0; jr < iend; jr++ ) {
				xmax = Math.max( xmax, abs1( WORKv, (isrc * (N * 2)) + (jr * 2) ) );
			}

			if ( xmax > safmin ) {
				temp = ONE / xmax;
				for ( jr = 0; jr < iend; jr++ ) {
					VRv[ oVR + (jr * sVR1) + (( ieig - 1 ) * sVR2) ] = temp * WORKv[ (isrc * (N * 2)) + (jr * 2) ];
					VRv[ oVR + (jr * sVR1) + (( ieig - 1 ) * sVR2) + 1 ] = temp * WORKv[ (isrc * (N * 2)) + (jr * 2) + 1 ];
				}
			} else {
				iend = 0;
			}

			for ( jr = iend; jr < N; jr++ ) {
				VRv[ oVR + (jr * sVR1) + (( ieig - 1 ) * sVR2) ] = 0.0;
				VRv[ oVR + (jr * sVR1) + (( ieig - 1 ) * sVR2) + 1 ] = 0.0;
			}

			ieig -= 1;
		}
	}

	return 0;
}


// EXPORTS //

export default ztgevc;
