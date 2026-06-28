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

import dlarf from './../../dlarf/lib/base.js';
import dlarfgp from './../../dlarfgp/lib/base.js';
import dorbdb5 from './../../dorbdb5/lib/base.js';
import dnrm2 from './../../../../blas/base/dnrm2/lib/base.js';
import drot from './../../../../blas/base/drot/lib/base.js';
import dscal from './../../../../blas/base/dscal/lib/base.js';


// MAIN //

/**
* Simultaneously bidiagonalizes the blocks of a tall and skinny matrix `X = [X11; X21]` with orthonormal columns (CSD-prep variant 4 — widest `M1`/`M2` partition).
*
* The reduction has the form:
*
* ```text
*                          [ B11 ]
*    [ X11 ]   [ P1 |    ] [  0  ]
*    [-----] = [---------] [-----] Q1**T
*    [ X21 ]   [    | P2 ] [ B21 ]
*                          [  0  ]
* ```
*
* where `X11` is `P`-by-`Q`, `X21` is `(M-P)`-by-`Q`, and `M-Q` must be no larger than `P`, `M-P`, or `Q`. `P1`, `P2`, and `Q1` are orthogonal matrices represented implicitly via Householder reflectors stored in `X11`/`X21` and the scalar arrays `TAUP1`/`TAUP2`/`TAUQ1`. `B11` and `B21` are `(M-Q)`-by-`(M-Q)` upper bidiagonal matrices represented implicitly by the angle arrays `THETA` (length `Q`) and `PHI` (length `Q-1`). `PHANTOM` is an `M`-element scratch vector used to construct an additional orthogonal direction during the first iteration; on exit it stores the corresponding Householder vectors.
*
* @private
* @param {NonNegativeInteger} M - total number of rows in `[X11; X21]` (i.e. `P + (M-P)`)
* @param {NonNegativeInteger} P - number of rows in `X11` (`0 <= P <= M`)
* @param {NonNegativeInteger} Q - number of columns in both `X11` and `X21` (`0 <= Q <= M` and `M-Q <= min(P, M-P, Q)`)
* @param {Float64Array} X11 - top block (`P`-by-`Q`); on exit, `tril(X11)` holds reflectors for `P1` and `triu(X11,1)` holds reflectors for `Q1`
* @param {integer} strideX111 - stride of the first dimension of `X11`
* @param {integer} strideX112 - stride of the second dimension of `X11`
* @param {NonNegativeInteger} offsetX11 - starting index for `X11`
* @param {Float64Array} X21 - bottom block (`(M-P)`-by-`Q`); on exit, `tril(X21)` holds reflectors for `P2`
* @param {integer} strideX211 - stride of the first dimension of `X21`
* @param {integer} strideX212 - stride of the second dimension of `X21`
* @param {NonNegativeInteger} offsetX21 - starting index for `X21`
* @param {Float64Array} THETA - output array (length at least `Q`); CSD bidiagonal angles
* @param {integer} strideTHETA - stride length for `THETA`
* @param {NonNegativeInteger} offsetTHETA - starting index for `THETA`
* @param {Float64Array} PHI - output array (length at least `Q-1`); CSD bidiagonal angles
* @param {integer} stridePHI - stride length for `PHI`
* @param {NonNegativeInteger} offsetPHI - starting index for `PHI`
* @param {Float64Array} TAUP1 - output array (length at least `M-Q`); Householder scalars defining `P1`
* @param {integer} strideTAUP1 - stride length for `TAUP1`
* @param {NonNegativeInteger} offsetTAUP1 - starting index for `TAUP1`
* @param {Float64Array} TAUP2 - output array (length at least `M-Q`); Householder scalars defining `P2`
* @param {integer} strideTAUP2 - stride length for `TAUP2`
* @param {NonNegativeInteger} offsetTAUP2 - starting index for `TAUP2`
* @param {Float64Array} TAUQ1 - output array (length at least `Q`); Householder scalars defining `Q1`
* @param {integer} strideTAUQ1 - stride length for `TAUQ1`
* @param {NonNegativeInteger} offsetTAUQ1 - starting index for `TAUQ1`
* @param {Float64Array} PHANTOM - workspace and output (length at least `M`); on exit `PHANTOM[0..P-1]` and `PHANTOM[P..M-1]` hold the Householder vectors for the synthesized orthogonal direction
* @param {integer} stridePHANTOM - stride length for `PHANTOM`
* @param {NonNegativeInteger} offsetPHANTOM - starting index for `PHANTOM`
* @param {Float64Array} WORK - workspace (length at least `max(P-1, M-P-1, Q-1, Q) + 1`); reused by `dlarf` and `dorbdb5`
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} `info` (0 = success)
*/
function dorbdb4( M, P, Q, X11, strideX111, strideX112, offsetX11, X21, strideX211, strideX212, offsetX21, THETA, strideTHETA, offsetTHETA, PHI, stridePHI, offsetPHI, TAUP1, strideTAUP1, offsetTAUP1, TAUP2, strideTAUP2, offsetTAUP2, TAUQ1, strideTAUQ1, offsetTAUQ1, PHANTOM, stridePHANTOM, offsetPHANTOM, WORK, strideWork, offsetWork ) {
	var oX11Im1; // offset of X11(i, i-1)
	var oX21Im1; // offset of X21(i, i-1)
	var oPhTop;  // offset of PHANTOM(0)
	var oPhBot;  // offset of PHANTOM(P)
	var oX11ii;  // offset of X11(i, i)
	var oX21ii;  // offset of X21(i, i)
	var theta;
	var taup1;
	var taup2;
	var tauq1;
	var n1;
	var n2;
	var c;
	var i;
	var j;
	var s;

	// Reduce columns 0, ..., M-Q-1 of X11 and X21 (the "phantom" loop)
	for ( i = 0; i < M - Q; i++ ) {
		// Offsets for X11(i, i) and X21(i, i)
		oX11ii = offsetX11 + ( i * strideX111 ) + ( i * strideX112 );
		oX21ii = offsetX21 + ( i * strideX211 ) + ( i * strideX212 );

		if ( i === 0 ) {
			// Synthesize an extra orthogonal direction Y = [PHANTOM(0..P-1); PHANTOM(P..M-1)] using dorbdb5: zero PHANTOM, then return a vector orthogonal to all columns of [X11; X21] (the columns are the existing orthonormal columns of X)
			oPhTop = offsetPHANTOM;
			oPhBot = offsetPHANTOM + ( P * stridePHANTOM );
			for ( j = 0; j < M; j++ ) {
				PHANTOM[ offsetPHANTOM + ( j * stridePHANTOM ) ] = 0.0;
			}
			dorbdb5( P, M - P, Q, PHANTOM, stridePHANTOM, oPhTop, PHANTOM, stridePHANTOM, oPhBot, X11, strideX111, strideX112, offsetX11, X21, strideX211, strideX212, offsetX21, WORK, strideWork, offsetWork );

			// Negate the top half (matches the Fortran DSCAL(P, NEGONE, PHANTOM(1), 1))
			dscal( P, -1.0, PHANTOM, stridePHANTOM, oPhTop );

			// Compute Householder reflectors for the top and bottom halves of PHANTOM. dlarfgp writes the new alpha back into PHANTOM(0)/PHANTOM(P) and the reflector into PHANTOM(1..P-1)/PHANTOM(P+1..M-1).
			dlarfgp( P, PHANTOM, oPhTop, PHANTOM, stridePHANTOM, oPhTop + stridePHANTOM, TAUP1, offsetTAUP1 );
			dlarfgp( M - P, PHANTOM, oPhBot, PHANTOM, stridePHANTOM, oPhBot + stridePHANTOM, TAUP2, offsetTAUP2 );

			// THETA(0) = atan2(PHANTOM(0), PHANTOM(P))
			theta = Math.atan2( PHANTOM[ oPhTop ], PHANTOM[ oPhBot ] );
			THETA[ offsetTHETA ] = theta;
			c = Math.cos( theta );
			s = Math.sin( theta );

			// Plant the implicit `1` for the Householder vector at PHANTOM(0) and PHANTOM(P)
			PHANTOM[ oPhTop ] = 1.0;
			PHANTOM[ oPhBot ] = 1.0;

			// Apply P1 reflector to X11(0:P-1, 0:Q-1) from the left
			dlarf( 'left', P, Q, PHANTOM, stridePHANTOM, oPhTop, TAUP1[ offsetTAUP1 ], X11, strideX111, strideX112, offsetX11, WORK, strideWork, offsetWork );

			// Apply P2 reflector to X21(0:M-P-1, 0:Q-1) from the left
			dlarf( 'left', M - P, Q, PHANTOM, stridePHANTOM, oPhBot, TAUP2[ offsetTAUP2 ], X21, strideX211, strideX212, offsetX21, WORK, strideWork, offsetWork );
		} else {
			// Working column is column (i-1) of X11/X21, sub-vector starting at row i
			oX11Im1 = offsetX11 + ( i * strideX111 ) + ( ( i - 1 ) * strideX112 );
			oX21Im1 = offsetX21 + ( i * strideX211 ) + ( ( i - 1 ) * strideX212 );

			// Re-orthogonalize the working column against the previously computed reflectors stored in the trailing block. The "Q" matrix here is X11(i:P-1, i:Q-1) and X21(i:M-P-1, i:Q-1).
			dorbdb5( P - i, M - P - i, Q - i, X11, strideX111, oX11Im1, X21, strideX211, oX21Im1, X11, strideX111, strideX112, oX11ii, X21, strideX211, strideX212, oX21ii, WORK, strideWork, offsetWork );

			// Negate the top piece (DSCAL(P-I+1, NEGONE, X11(I,I-1), 1))
			dscal( P - i, -1.0, X11, strideX111, oX11Im1 );

			// Householder reflectors for the working column (top and bottom halves)
			dlarfgp( P - i, X11, oX11Im1, X11, strideX111, oX11Im1 + strideX111, TAUP1, offsetTAUP1 + ( i * strideTAUP1 ) );
			dlarfgp( M - P - i, X21, oX21Im1, X21, strideX211, oX21Im1 + strideX211, TAUP2, offsetTAUP2 + ( i * strideTAUP2 ) );

			// THETA(i) = atan2(X11(i, i-1), X21(i, i-1))
			theta = Math.atan2( X11[ oX11Im1 ], X21[ oX21Im1 ] );
			THETA[ offsetTHETA + ( i * strideTHETA ) ] = theta;
			c = Math.cos( theta );
			s = Math.sin( theta );

			// Plant the implicit `1` for the Householder vector at the diagonal of column (i-1)
			X11[ oX11Im1 ] = 1.0;
			X21[ oX21Im1 ] = 1.0;

			// Apply P1 reflector to X11(i:P-1, i:Q-1) from the left
			taup1 = TAUP1[ offsetTAUP1 + ( i * strideTAUP1 ) ];
			dlarf( 'left', P - i, Q - i, X11, strideX111, oX11Im1, taup1, X11, strideX111, strideX112, oX11ii, WORK, strideWork, offsetWork );

			// Apply P2 reflector to X21(i:M-P-1, i:Q-1) from the left
			taup2 = TAUP2[ offsetTAUP2 + ( i * strideTAUP2 ) ];
			dlarf( 'left', M - P - i, Q - i, X21, strideX211, oX21Im1, taup2, X21, strideX211, strideX212, oX21ii, WORK, strideWork, offsetWork );
		}

		// Combine row i of X11 and X21 (columns i..Q-1) via Givens rotation [s, -c]: this bidiagonalizes the row
		drot( Q - i, X11, strideX112, oX11ii, X21, strideX212, oX21ii, s, -c );

		// Q1 reflector along row i of X21 (columns i+1..Q-1): writes new alpha into X21(i,i) and the reflector into X21(i,i+1..Q-1)
		dlarfgp( Q - i, X21, oX21ii, X21, strideX212, oX21ii + strideX212, TAUQ1, offsetTAUQ1 + ( i * strideTAUQ1 ) );

		// Capture the new alpha (the bidiagonal off-diagonal entry) before overwriting with the implicit `1`
		c = X21[ oX21ii ];
		X21[ oX21ii ] = 1.0;

		// Apply Q1 reflector from the right to X11(i+1:P-1, i:Q-1)
		tauq1 = TAUQ1[ offsetTAUQ1 + ( i * strideTAUQ1 ) ];
		dlarf( 'right', P - i - 1, Q - i, X21, strideX212, oX21ii, tauq1, X11, strideX111, strideX112, oX11ii + strideX111, WORK, strideWork, offsetWork );

		// Apply Q1 reflector from the right to X21(i+1:M-P-1, i:Q-1)
		dlarf( 'right', M - P - i - 1, Q - i, X21, strideX212, oX21ii, tauq1, X21, strideX211, strideX212, oX21ii + strideX211, WORK, strideWork, offsetWork );

		if ( i < M - Q - 1 ) {
			// PHI(i) = atan2(s, c) where s = sqrt(||X11(i+1:P-1, i)||^2 + ||X21(i+1:M-P-1, i)||^2)
			n1 = dnrm2( P - i - 1, X11, strideX111, oX11ii + strideX111 );
			n2 = dnrm2( M - P - i - 1, X21, strideX211, oX21ii + strideX211 );
			s = Math.sqrt( ( n1 * n1 ) + ( n2 * n2 ) );
			PHI[ offsetPHI + ( i * stridePHI ) ] = Math.atan2( s, c );
		}
	}

	// Reduce the bottom-right portion of X11 to [I 0]
	for ( i = M - Q; i < P; i++ ) {
		oX11ii = offsetX11 + ( i * strideX111 ) + ( i * strideX112 );

		// Q1 reflector along row i of X11 (columns i+1..Q-1)
		dlarfgp( Q - i, X11, oX11ii, X11, strideX112, oX11ii + strideX112, TAUQ1, offsetTAUQ1 + ( i * strideTAUQ1 ) );
		X11[ oX11ii ] = 1.0;

		// Apply Q1 reflector from the right to X11(i+1:P-1, i:Q-1)
		tauq1 = TAUQ1[ offsetTAUQ1 + ( i * strideTAUQ1 ) ];
		dlarf( 'right', P - i - 1, Q - i, X11, strideX112, oX11ii, tauq1, X11, strideX111, strideX112, oX11ii + strideX111, WORK, strideWork, offsetWork );

		// Apply Q1 reflector to the bottom Q-P rows of X21 (rows M-Q..M-P-1, columns i..Q-1)
		dlarf( 'right', Q - P, Q - i, X11, strideX112, oX11ii, tauq1, X21, strideX211, strideX212, offsetX21 + ( ( M - Q ) * strideX211 ) + ( i * strideX212 ), WORK, strideWork, offsetWork );
	}

	// Reduce the bottom-right portion of X21 to [0 I]
	for ( i = P; i < Q; i++ ) {
		// Working row is X21(M-Q+i-P, i)
		oX21ii = offsetX21 + ( ( M - Q + i - P ) * strideX211 ) + ( i * strideX212 );

		// Q1 reflector along row M-Q+i-P of X21 (columns i+1..Q-1)
		dlarfgp( Q - i, X21, oX21ii, X21, strideX212, oX21ii + strideX212, TAUQ1, offsetTAUQ1 + ( i * strideTAUQ1 ) );
		X21[ oX21ii ] = 1.0;

		// Apply Q1 reflector from the right to X21(M-Q+i-P+1:M-P-1, i:Q-1)
		tauq1 = TAUQ1[ offsetTAUQ1 + ( i * strideTAUQ1 ) ];
		dlarf( 'right', Q - i - 1, Q - i, X21, strideX212, oX21ii, tauq1, X21, strideX211, strideX212, oX21ii + strideX211, WORK, strideWork, offsetWork );
	}

	return 0;
}


// EXPORTS //

export default dorbdb4;
