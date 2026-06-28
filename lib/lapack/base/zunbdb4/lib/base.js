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

/* eslint-disable max-params, max-len, max-statements */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarf from './../../zlarf/lib/base.js';
import zlarfgp from './../../zlarfgp/lib/base.js';
import zlacgv from './../../zlacgv/lib/base.js';
import zunbdb5 from './../../zunbdb5/lib/base.js';
import dznrm2 from './../../../../blas/base/dznrm2/lib/base.js';
import zdrot from './../../../../blas/base/zdrot/lib/base.js';
import zdscal from './../../../../blas/base/zdscal/lib/base.js';


// VARIABLES //

// Module-level scratch buffer for passing conjugated tau scalars to zlarf without per-call allocation.
var scratchTau = new Complex128Array( 1 );
var scratchTauv = reinterpret( scratchTau, 0 );


// MAIN //

/**
* Simultaneously bidiagonalizes the blocks of a tall and skinny complex matrix `X = [X11; X21]` with orthonormal columns (CSD-prep variant 4 — widest `M1`/`M2` partition).
*
* The reduction has the form:
*
* ```text
*                          [ B11 ]
*    [ X11 ]   [ P1 |    ] [  0  ]
*    [-----] = [---------] [-----] Q1**H
*    [ X21 ]   [    | P2 ] [ B21 ]
*                          [  0  ]
* ```
*
* where `X11` is `P`-by-`Q`, `X21` is `(M-P)`-by-`Q`, and `M-Q` must be no larger than `P`, `M-P`, or `Q`. `P1`, `P2`, and `Q1` are unitary matrices represented implicitly via Householder reflectors stored in `X11`/`X21` and the scalar arrays `TAUP1`/`TAUP2`/`TAUQ1`. `B11` and `B21` are `(M-Q)`-by-`(M-Q)` upper-bidiagonal matrices represented implicitly by the real angle arrays `THETA` (length `Q`) and `PHI` (length `Q-1`). `PHANTOM` is an `M`-element scratch vector used to construct an additional orthogonal direction during the first iteration; on exit it stores the corresponding Householder vectors.
*
* @private
* @param {NonNegativeInteger} M - total number of rows in `[X11; X21]` (i.e. `P + (M-P)`)
* @param {NonNegativeInteger} P - number of rows in `X11` (`0 <= P <= M`)
* @param {NonNegativeInteger} Q - number of columns in both `X11` and `X21` (`0 <= Q <= M` and `M-Q <= min(P, M-P, Q)`)
* @param {Complex128Array} X11 - top block (`P`-by-`Q`); on exit, `tril(X11)` holds reflectors for `P1` and `triu(X11,1)` holds reflectors for `Q1`
* @param {integer} strideX111 - stride of the first dimension of `X11` (in complex elements)
* @param {integer} strideX112 - stride of the second dimension of `X11` (in complex elements)
* @param {NonNegativeInteger} offsetX11 - starting index for `X11` (in complex elements)
* @param {Complex128Array} X21 - bottom block (`(M-P)`-by-`Q`); on exit, `tril(X21)` holds reflectors for `P2`
* @param {integer} strideX211 - stride of the first dimension of `X21` (in complex elements)
* @param {integer} strideX212 - stride of the second dimension of `X21` (in complex elements)
* @param {NonNegativeInteger} offsetX21 - starting index for `X21` (in complex elements)
* @param {Float64Array} THETA - output array (length at least `Q`); CSD bidiagonal angles
* @param {integer} strideTHETA - stride length for `THETA`
* @param {NonNegativeInteger} offsetTHETA - starting index for `THETA`
* @param {Float64Array} PHI - output array (length at least `Q-1`); CSD bidiagonal angles
* @param {integer} stridePHI - stride length for `PHI`
* @param {NonNegativeInteger} offsetPHI - starting index for `PHI`
* @param {Complex128Array} TAUP1 - output array (length at least `M-Q`); Householder scalars defining `P1`
* @param {integer} strideTAUP1 - stride length for `TAUP1` (in complex elements)
* @param {NonNegativeInteger} offsetTAUP1 - starting index for `TAUP1` (in complex elements)
* @param {Complex128Array} TAUP2 - output array (length at least `M-Q`); Householder scalars defining `P2`
* @param {integer} strideTAUP2 - stride length for `TAUP2` (in complex elements)
* @param {NonNegativeInteger} offsetTAUP2 - starting index for `TAUP2` (in complex elements)
* @param {Complex128Array} TAUQ1 - output array (length at least `Q`); Householder scalars defining `Q1`
* @param {integer} strideTAUQ1 - stride length for `TAUQ1` (in complex elements)
* @param {NonNegativeInteger} offsetTAUQ1 - starting index for `TAUQ1` (in complex elements)
* @param {Complex128Array} PHANTOM - workspace and output (length at least `M`); on exit `PHANTOM[0..P-1]` and `PHANTOM[P..M-1]` hold the Householder vectors for the synthesized orthogonal direction
* @param {integer} stridePHANTOM - stride length for `PHANTOM` (in complex elements)
* @param {NonNegativeInteger} offsetPHANTOM - starting index for `PHANTOM` (in complex elements)
* @param {Complex128Array} WORK - workspace (length at least `max(P-1, M-P-1, Q-1, Q)` complex elements)
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @returns {integer} `info` (0 = success)
*/
function zunbdb4( M, P, Q, X11, strideX111, strideX112, offsetX11, X21, strideX211, strideX212, offsetX21, THETA, strideTHETA, offsetTHETA, PHI, stridePHI, offsetPHI, TAUP1, strideTAUP1, offsetTAUP1, TAUP2, strideTAUP2, offsetTAUP2, TAUQ1, strideTAUQ1, offsetTAUQ1, PHANTOM, stridePHANTOM, offsetPHANTOM, WORK, strideWork, offsetWork ) {
	var oPhComplex;
	var oX11Im1C; // complex offset of X11(i, i-1)
	var oX21Im1C; // complex offset of X21(i, i-1)
	var PHANTOMv;
	var oX11Im1;  // Float64-view offset of X11(i, i-1)
	var oX21Im1;  // Float64-view offset of X21(i, i-1)
	var oX11iiC;  // complex offset of X11(i, i)
	var oX21iiC;  // complex offset of X21(i, i)
	var oPhTopC;  // complex offset of PHANTOM(0)
	var oPhBotC;  // complex offset of PHANTOM(P)
	var TAUP1v;
	var TAUP2v;
	var oX11ii;   // Float64-view offset of X11(i, i)
	var oX21ii;   // Float64-view offset of X21(i, i)
	var oPhTop;   // Float64-view offset of PHANTOM(0)
	var oPhBot;   // Float64-view offset of PHANTOM(P)
	var oTAUP1;
	var oTAUP2;
	var oTAUQ1;
	var theta;
	var X11v;
	var X21v;
	var n1;
	var n2;
	var c;
	var i;
	var j;
	var s;

	// Float64 views of the complex arrays for direct real-part reads and for planting the implicit `1.0 + 0.0i`.
	X11v = reinterpret( X11, 0 );
	X21v = reinterpret( X21, 0 );
	TAUP1v = reinterpret( TAUP1, 0 );
	TAUP2v = reinterpret( TAUP2, 0 );
	PHANTOMv = reinterpret( PHANTOM, 0 );

	// Reduce columns 0, ..., M-Q-1 of X11 and X21 (the "phantom" loop)
	for ( i = 0; i < M - Q; i++ ) {
		// Complex-element offsets for the diagonal X11(i,i) and X21(i,i).
		oX11iiC = offsetX11 + ( i * strideX111 ) + ( i * strideX112 );
		oX21iiC = offsetX21 + ( i * strideX211 ) + ( i * strideX212 );

		// Float64-view offsets (doubled).
		oX11ii = oX11iiC * 2;
		oX21ii = oX21iiC * 2;

		if ( i === 0 ) {
			// Synthesize an extra orthogonal direction Y = [PHANTOM(0..P-1); PHANTOM(P..M-1)] using zunbdb5: zero PHANTOM, then return a vector orthogonal to all columns of [X11; X21] (the columns are the existing orthonormal columns of X).
			oPhTopC = offsetPHANTOM;
			oPhBotC = offsetPHANTOM + ( P * stridePHANTOM );
			oPhTop = oPhTopC * 2;
			oPhBot = oPhBotC * 2;

			// Zero PHANTOM (both real and imaginary parts).
			for ( j = 0; j < M; j++ ) {
				oPhComplex = ( offsetPHANTOM + ( j * stridePHANTOM ) ) * 2;
				PHANTOMv[ oPhComplex ] = 0.0;
				PHANTOMv[ oPhComplex + 1 ] = 0.0;
			}
			zunbdb5( P, M - P, Q, PHANTOM, stridePHANTOM, oPhTopC, PHANTOM, stridePHANTOM, oPhBotC, X11, strideX111, strideX112, offsetX11, X21, strideX211, strideX212, offsetX21, WORK, strideWork, offsetWork );

			// Negate the top half. The Fortran calls ZSCAL(P, NEGONE, ...) with NEGONE = (-1, 0) which is equivalent to zdscal with real scalar -1.
			zdscal( P, -1.0, PHANTOM, stridePHANTOM, oPhTopC );

			// Compute Householder reflectors for the top and bottom halves of PHANTOM. zlarfgp writes the new (real, non-negative) alpha back into PHANTOM(0)/PHANTOM(P) and the reflector into PHANTOM(1..P-1)/PHANTOM(P+1..M-1).
			zlarfgp( P, PHANTOM, oPhTopC, PHANTOM, stridePHANTOM, oPhTopC + stridePHANTOM, TAUP1, offsetTAUP1 );
			zlarfgp( M - P, PHANTOM, oPhBotC, PHANTOM, stridePHANTOM, oPhBotC + stridePHANTOM, TAUP2, offsetTAUP2 );

			// THETA(0) = atan2(real(PHANTOM(0)), real(PHANTOM(P))). Both are real and non-negative after zlarfgp.
			theta = Math.atan2( PHANTOMv[ oPhTop ], PHANTOMv[ oPhBot ] );
			THETA[ offsetTHETA ] = theta;
			c = Math.cos( theta );
			s = Math.sin( theta );

			// Plant the implicit `1 + 0i` for the Householder vector at PHANTOM(0) and PHANTOM(P).
			PHANTOMv[ oPhTop ] = 1.0;
			PHANTOMv[ oPhTop + 1 ] = 0.0;
			PHANTOMv[ oPhBot ] = 1.0;
			PHANTOMv[ oPhBot + 1 ] = 0.0;

			// Apply P1 reflector to X11(0:P-1, 0:Q-1) from the left, using DCONJG(TAUP1(0)). Stage the conjugate into scratchTau and pass it.
			scratchTauv[ 0 ] = TAUP1v[ offsetTAUP1 * 2 ];
			scratchTauv[ 1 ] = -TAUP1v[ ( offsetTAUP1 * 2 ) + 1 ];
			zlarf( 'left', P, Q, PHANTOM, stridePHANTOM, oPhTopC, scratchTau, 0, X11, strideX111, strideX112, offsetX11, WORK, strideWork, offsetWork );

			// Apply P2 reflector to X21(0:M-P-1, 0:Q-1) from the left, using DCONJG(TAUP2(0)).
			scratchTauv[ 0 ] = TAUP2v[ offsetTAUP2 * 2 ];
			scratchTauv[ 1 ] = -TAUP2v[ ( offsetTAUP2 * 2 ) + 1 ];
			zlarf( 'left', M - P, Q, PHANTOM, stridePHANTOM, oPhBotC, scratchTau, 0, X21, strideX211, strideX212, offsetX21, WORK, strideWork, offsetWork );
		} else {
			// Working column is column (i-1) of X11/X21, sub-vector starting at row i.
			oX11Im1C = offsetX11 + ( i * strideX111 ) + ( ( i - 1 ) * strideX112 );
			oX21Im1C = offsetX21 + ( i * strideX211 ) + ( ( i - 1 ) * strideX212 );
			oX11Im1 = oX11Im1C * 2;
			oX21Im1 = oX21Im1C * 2;

			// Re-orthogonalize the working column against the previously computed reflectors stored in the trailing block. The "Q" matrix here is X11(i:P-1, i:Q-1) and X21(i:M-P-1, i:Q-1).
			zunbdb5( P - i, M - P - i, Q - i, X11, strideX111, oX11Im1C, X21, strideX211, oX21Im1C, X11, strideX111, strideX112, oX11iiC, X21, strideX211, strideX212, oX21iiC, WORK, strideWork, offsetWork );

			// Negate the top piece (ZSCAL(P-I+1, NEGONE, X11(I,I-1), 1)).
			zdscal( P - i, -1.0, X11, strideX111, oX11Im1C );

			// Householder reflectors for the working column (top and bottom halves).
			oTAUP1 = offsetTAUP1 + ( i * strideTAUP1 );
			oTAUP2 = offsetTAUP2 + ( i * strideTAUP2 );
			zlarfgp( P - i, X11, oX11Im1C, X11, strideX111, oX11Im1C + strideX111, TAUP1, oTAUP1 );
			zlarfgp( M - P - i, X21, oX21Im1C, X21, strideX211, oX21Im1C + strideX211, TAUP2, oTAUP2 );

			// THETA(i) = atan2(real(X11(i, i-1)), real(X21(i, i-1))). Both real and non-negative after zlarfgp.
			theta = Math.atan2( X11v[ oX11Im1 ], X21v[ oX21Im1 ] );
			THETA[ offsetTHETA + ( i * strideTHETA ) ] = theta;
			c = Math.cos( theta );
			s = Math.sin( theta );

			// Plant the implicit `1 + 0i` for the Householder vector at the diagonal of column (i-1).
			X11v[ oX11Im1 ] = 1.0;
			X11v[ oX11Im1 + 1 ] = 0.0;
			X21v[ oX21Im1 ] = 1.0;
			X21v[ oX21Im1 + 1 ] = 0.0;

			// Apply P1 reflector to X11(i:P-1, i:Q-1) from the left, using DCONJG(TAUP1(i)).
			scratchTauv[ 0 ] = TAUP1v[ oTAUP1 * 2 ];
			scratchTauv[ 1 ] = -TAUP1v[ ( oTAUP1 * 2 ) + 1 ];
			zlarf( 'left', P - i, Q - i, X11, strideX111, oX11Im1C, scratchTau, 0, X11, strideX111, strideX112, oX11iiC, WORK, strideWork, offsetWork );

			// Apply P2 reflector to X21(i:M-P-1, i:Q-1) from the left, using DCONJG(TAUP2(i)).
			scratchTauv[ 0 ] = TAUP2v[ oTAUP2 * 2 ];
			scratchTauv[ 1 ] = -TAUP2v[ ( oTAUP2 * 2 ) + 1 ];
			zlarf( 'left', M - P - i, Q - i, X21, strideX211, oX21Im1C, scratchTau, 0, X21, strideX211, strideX212, oX21iiC, WORK, strideWork, offsetWork );
		}

		// Combine row i of X11 and X21 (columns i..Q-1) via real-cosine/real-sine Givens rotation [s, -c]: this bidiagonalizes the row.
		zdrot( Q - i, X11, strideX112, oX11iiC, X21, strideX212, oX21iiC, s, -c );

		// Conjugate row i of X21 in place along columns i..Q-1 (Fortran ZLACGV before zlarfgp + zlarf from right). The conjugation turns the row-vector reflector problem into the column-vector machinery.
		zlacgv( Q - i, X21, strideX212, oX21iiC );

		// Q1 reflector along row i of X21 (columns i+1..Q-1): writes new (real, non-negative) beta into X21(i,i) and the reflector into X21(i, i+1..Q-1).
		oTAUQ1 = offsetTAUQ1 + ( i * strideTAUQ1 );
		zlarfgp( Q - i, X21, oX21iiC, X21, strideX212, oX21iiC + strideX212, TAUQ1, oTAUQ1 );

		// Capture the new beta (real part of X21(i,i)) before overwriting with the implicit `1 + 0i`.
		c = X21v[ oX21ii ];
		X21v[ oX21ii ] = 1.0;
		X21v[ oX21ii + 1 ] = 0.0;

		// Apply Q1 reflector from the right to X11(i+1:P-1, i:Q-1).
		zlarf( 'right', P - i - 1, Q - i, X21, strideX212, oX21iiC, TAUQ1, oTAUQ1, X11, strideX111, strideX112, oX11iiC + strideX111, WORK, strideWork, offsetWork );

		// Apply Q1 reflector from the right to X21(i+1:M-P-1, i:Q-1).
		zlarf( 'right', M - P - i - 1, Q - i, X21, strideX212, oX21iiC, TAUQ1, oTAUQ1, X21, strideX211, strideX212, oX21iiC + strideX211, WORK, strideWork, offsetWork );

		// Restore row i of X21 (undo the conjugation applied above).
		zlacgv( Q - i, X21, strideX212, oX21iiC );

		if ( i < M - Q - 1 ) {
			// PHI(i) = atan2(s, c) where s = sqrt(||X11(i+1:P-1, i)||^2 + ||X21(i+1:M-P-1, i)||^2). The norms are along column i starting at row i+1.
			n1 = dznrm2( P - i - 1, X11, strideX111, oX11iiC + strideX111 );
			n2 = dznrm2( M - P - i - 1, X21, strideX211, oX21iiC + strideX211 );
			s = Math.sqrt( ( n1 * n1 ) + ( n2 * n2 ) );
			PHI[ offsetPHI + ( i * stridePHI ) ] = Math.atan2( s, c );
		}
	}

	// Reduce the bottom-right portion of X11 to [I 0]
	for ( i = M - Q; i < P; i++ ) {
		oX11iiC = offsetX11 + ( i * strideX111 ) + ( i * strideX112 );
		oX11ii = oX11iiC * 2;

		// Conjugate row i of X11 in place along columns i..Q-1 before applying the row-vector Q1 reflector.
		zlacgv( Q - i, X11, strideX112, oX11iiC );

		// Q1 reflector along row i of X11 (columns i+1..Q-1).
		oTAUQ1 = offsetTAUQ1 + ( i * strideTAUQ1 );
		zlarfgp( Q - i, X11, oX11iiC, X11, strideX112, oX11iiC + strideX112, TAUQ1, oTAUQ1 );

		// Plant `1 + 0i` for the reflector at X11(i,i).
		X11v[ oX11ii ] = 1.0;
		X11v[ oX11ii + 1 ] = 0.0;

		// Apply Q1 reflector from the right to X11(i+1:P-1, i:Q-1).
		zlarf( 'right', P - i - 1, Q - i, X11, strideX112, oX11iiC, TAUQ1, oTAUQ1, X11, strideX111, strideX112, oX11iiC + strideX111, WORK, strideWork, offsetWork );

		// Apply Q1 reflector to the bottom Q-P rows of X21 (rows M-Q..M-P-1, columns i..Q-1).
		zlarf( 'right', Q - P, Q - i, X11, strideX112, oX11iiC, TAUQ1, oTAUQ1, X21, strideX211, strideX212, offsetX21 + ( ( M - Q ) * strideX211 ) + ( i * strideX212 ), WORK, strideWork, offsetWork );

		// Restore row i of X11 (undo the conjugation).
		zlacgv( Q - i, X11, strideX112, oX11iiC );
	}

	// Reduce the bottom-right portion of X21 to [0 I]
	for ( i = P; i < Q; i++ ) {
		// Working row is X21(M-Q+i-P, i).
		oX21iiC = offsetX21 + ( ( M - Q + i - P ) * strideX211 ) + ( i * strideX212 );
		oX21ii = oX21iiC * 2;

		// Conjugate row M-Q+i-P of X21 in place along columns i..Q-1.
		zlacgv( Q - i, X21, strideX212, oX21iiC );

		// Q1 reflector along row M-Q+i-P of X21 (columns i+1..Q-1).
		oTAUQ1 = offsetTAUQ1 + ( i * strideTAUQ1 );
		zlarfgp( Q - i, X21, oX21iiC, X21, strideX212, oX21iiC + strideX212, TAUQ1, oTAUQ1 );

		// Plant `1 + 0i` for the reflector at X21(M-Q+i-P, i).
		X21v[ oX21ii ] = 1.0;
		X21v[ oX21ii + 1 ] = 0.0;

		// Apply Q1 reflector from the right to X21(M-Q+i-P+1:M-P-1, i:Q-1).
		zlarf( 'right', Q - i - 1, Q - i, X21, strideX212, oX21iiC, TAUQ1, oTAUQ1, X21, strideX211, strideX212, oX21iiC + strideX211, WORK, strideWork, offsetWork );

		// Restore row M-Q+i-P of X21 (undo the conjugation).
		zlacgv( Q - i, X21, strideX212, oX21iiC );
	}

	return 0;
}


// EXPORTS //

export default zunbdb4;
