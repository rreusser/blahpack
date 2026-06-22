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

/* eslint-disable max-params, max-len, max-statements */

// MODULES //

import dlarf from './../../dlarf/lib/base.js';
import dlarfgp from './../../dlarfgp/lib/base.js';
import dorbdb5 from './../../dorbdb5/lib/base.js';
import dnrm2 from './../../../../blas/base/dnrm2/lib/base.js';
import drot from './../../../../blas/base/drot/lib/base.js';


// MAIN //

/**
* Simultaneously bidiagonalizes the blocks of a tall and skinny matrix `X = [X11; X21]` with orthonormal columns.
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
* where `X11` is `P`-by-`Q`, `X21` is `(M-P)`-by-`Q`, and `Q <= min(P, M-P, M-Q)`. `P1`, `P2`, and `Q1` are orthogonal matrices represented implicitly via Householder reflectors stored in `X11`/`X21` and the scalar arrays `TAUP1`/`TAUP2`/`TAUQ1`. `B11` and `B21` are upper bidiagonal `Q`-by-`Q` matrices represented implicitly by the angle arrays `THETA` (length `Q`) and `PHI` (length `Q-1`).
*
* @private
* @param {NonNegativeInteger} M - total number of rows in `[X11; X21]` (i.e. `P + (M-P)`)
* @param {NonNegativeInteger} P - number of rows in `X11` (`0 <= P <= M`)
* @param {NonNegativeInteger} Q - number of columns in both `X11` and `X21` (`0 <= Q <= min(P, M-P, M-Q)`)
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
* @param {Float64Array} TAUP1 - output array (length at least `P`); Householder scalars defining `P1`
* @param {integer} strideTAUP1 - stride length for `TAUP1`
* @param {NonNegativeInteger} offsetTAUP1 - starting index for `TAUP1`
* @param {Float64Array} TAUP2 - output array (length at least `M-P`); Householder scalars defining `P2`
* @param {integer} strideTAUP2 - stride length for `TAUP2`
* @param {NonNegativeInteger} offsetTAUP2 - starting index for `TAUP2`
* @param {Float64Array} TAUQ1 - output array (length at least `Q`); Householder scalars defining `Q1`
* @param {integer} strideTAUQ1 - stride length for `TAUQ1`
* @param {NonNegativeInteger} offsetTAUQ1 - starting index for `TAUQ1`
* @param {Float64Array} WORK - workspace (length at least `M-Q`); the kernel uses two segments — `WORK[0..max(P-1,M-P-1,Q-1)-1]` for `dlarf` scratch and `WORK[0..Q-2-1]` for the `dorbdb5` scratch (these segments are reused across the loop, so they may overlap one workspace buffer)
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {integer} `info` (0 = success)
*/
function dorbdb1( M, P, Q, X11, strideX111, strideX112, offsetX11, X21, strideX211, strideX212, offsetX21, THETA, strideTHETA, offsetTHETA, PHI, stridePHI, offsetPHI, TAUP1, strideTAUP1, offsetTAUP1, TAUP2, strideTAUP2, offsetTAUP2, TAUQ1, strideTAUQ1, offsetTAUQ1, WORK, strideWORK, offsetWORK ) {
	var oX11ii;
	var oX21ii;
	var theta;
	var n1;
	var n2;
	var c;
	var i;
	var s;

	// Reduce columns 0, ..., Q-1 of X11 and X21
	for ( i = 0; i < Q; i++ ) {
		// Offsets for the diagonal element X11(i,i) and X21(i,i)
		oX11ii = offsetX11 + ( i * strideX111 ) + ( i * strideX112 );
		oX21ii = offsetX21 + ( i * strideX211 ) + ( i * strideX212 );

		// Compute Householder reflector annihilating X11(i+1:p-1, i): result writes new alpha into X11(i,i) and the reflector into X11(i+1:p-1, i)
		dlarfgp( P - i, X11, oX11ii, X11, strideX111, oX11ii + strideX111, TAUP1, offsetTAUP1 + ( i * strideTAUP1 ) );

		// Compute Householder reflector annihilating X21(i+1:m-p-1, i): result writes new alpha into X21(i,i) and the reflector into X21(i+1:m-p-1, i)
		dlarfgp( M - P - i, X21, oX21ii, X21, strideX211, oX21ii + strideX211, TAUP2, offsetTAUP2 + ( i * strideTAUP2 ) );

		// Compute the angle THETA(i) = atan2(X21(i,i), X11(i,i))
		theta = Math.atan2( X21[ oX21ii ], X11[ oX11ii ] );
		THETA[ offsetTHETA + ( i * strideTHETA ) ] = theta;
		c = Math.cos( theta );
		s = Math.sin( theta );

		// Plant the implicit `1` for the Householder vector v at the diagonal
		X11[ oX11ii ] = 1.0;
		X21[ oX21ii ] = 1.0;

		// Apply P1 reflector to the trailing block X11(i:p-1, i+1:q-1) from the left
		dlarf( 'left', P - i, Q - i - 1, X11, strideX111, oX11ii, TAUP1[ offsetTAUP1 + ( i * strideTAUP1 ) ], X11, strideX111, strideX112, oX11ii + strideX112, WORK, strideWORK, offsetWORK );

		// Apply P2 reflector to the trailing block X21(i:m-p-1, i+1:q-1) from the left
		dlarf( 'left', M - P - i, Q - i - 1, X21, strideX211, oX21ii, TAUP2[ offsetTAUP2 + ( i * strideTAUP2 ) ], X21, strideX211, strideX212, oX21ii + strideX212, WORK, strideWORK, offsetWORK );

		if ( i < Q - 1 ) {
			// Rotate row i of X11 and X21 (columns i+1..q-1) by [c, s]; this combines the two block rows into a single bidiagonalized row
			drot( Q - i - 1, X11, strideX112, oX11ii + strideX112, X21, strideX212, oX21ii + strideX212, c, s );

			// Compute Q1 reflector along row i of X21 (columns i+1..q-1): writes new alpha into X21(i,i+1) and the reflector into X21(i,i+2..q-1)
			dlarfgp( Q - i - 1, X21, oX21ii + strideX212, X21, strideX212, oX21ii + ( 2 * strideX212 ), TAUQ1, offsetTAUQ1 + ( i * strideTAUQ1 ) );

			// Capture the new alpha (the bidiagonal off-diagonal entry, before being overwritten with the implicit `1`)
			s = X21[ oX21ii + strideX212 ];
			X21[ oX21ii + strideX212 ] = 1.0;

			// Apply Q1 reflector from the right to the trailing block X11(i+1:p-1, i+1:q-1)
			dlarf( 'right', P - i - 1, Q - i - 1, X21, strideX212, oX21ii + strideX212, TAUQ1[ offsetTAUQ1 + ( i * strideTAUQ1 ) ], X11, strideX111, strideX112, oX11ii + strideX111 + strideX112, WORK, strideWORK, offsetWORK );

			// Apply Q1 reflector from the right to the trailing block X21(i+1:m-p-1, i+1:q-1)
			dlarf( 'right', M - P - i - 1, Q - i - 1, X21, strideX212, oX21ii + strideX212, TAUQ1[ offsetTAUQ1 + ( i * strideTAUQ1 ) ], X21, strideX211, strideX212, oX21ii + strideX211 + strideX212, WORK, strideWORK, offsetWORK );

			// Compute c = sqrt(||X11(i+1:p-1, i+1)||^2 + ||X21(i+1:m-p-1, i+1)||^2). The norms are along the (i+1) column starting at row i+1.
			n1 = dnrm2( P - i - 1, X11, strideX111, oX11ii + strideX111 + strideX112 );
			n2 = dnrm2( M - P - i - 1, X21, strideX211, oX21ii + strideX211 + strideX212 );
			c = Math.sqrt( ( n1 * n1 ) + ( n2 * n2 ) );

			// Compute the angle PHI(i) = atan2(s, c)
			PHI[ offsetPHI + ( i * stridePHI ) ] = Math.atan2( s, c );

			// Re-orthogonalize the (i+1)-th column residual using the previously computed reflectors as the basis. The "Q" matrix here is X11(i+1:p-1, i+2:q-1) and X21(i+1:m-p-1, i+2:q-1), the implicit Householder vectors of the columns already reduced.
			dorbdb5( P - i - 1, M - P - i - 1, Q - i - 2, X11, strideX111, oX11ii + strideX111 + strideX112, X21, strideX211, oX21ii + strideX211 + strideX212, X11, strideX111, strideX112, oX11ii + strideX111 + ( 2 * strideX112 ), X21, strideX211, strideX212, oX21ii + strideX211 + ( 2 * strideX212 ), WORK, strideWORK, offsetWORK );
		}
	}

	return 0;
}


// EXPORTS //

export default dorbdb1;
