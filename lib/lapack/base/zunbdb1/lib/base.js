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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarf from './../../zlarf/lib/base.js';
import zlarfgp from './../../zlarfgp/lib/base.js';
import zlacgv from './../../zlacgv/lib/base.js';
import zunbdb5 from './../../zunbdb5/lib/base.js';
import dznrm2 from './../../../../blas/base/dznrm2/lib/base.js';
import zdrot from './../../../../blas/base/zdrot/lib/base.js';


// MAIN //

/**
* Simultaneously bidiagonalizes the blocks of a tall and skinny complex matrix `X = [X11; X21]` with orthonormal columns.
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
* where `X11` is `P`-by-`Q`, `X21` is `(M-P)`-by-`Q`, and `Q <= min(P, M-P, M-Q)`. `P1`, `P2`, and `Q1` are unitary matrices represented implicitly via Householder reflectors stored in `X11`/`X21` and the scalar arrays `TAUP1`/`TAUP2`/`TAUQ1`. `B11` and `B21` are upper bidiagonal `Q`-by-`Q` matrices represented implicitly by the angle arrays `THETA` (length `Q`, real) and `PHI` (length `Q-1`, real).
*
* @private
* @param {NonNegativeInteger} M - total number of rows in `[X11; X21]` (i.e. `P + (M-P)`)
* @param {NonNegativeInteger} P - number of rows in `X11` (`0 <= P <= M`)
* @param {NonNegativeInteger} Q - number of columns in both `X11` and `X21` (`0 <= Q <= min(P, M-P, M-Q)`)
* @param {Complex128Array} X11 - top block (`P`-by-`Q`); on exit, `tril(X11)` holds reflectors for `P1` and `triu(X11,1)` holds reflectors for `Q1`
* @param {integer} strideX111 - stride of the first dimension of `X11` (in complex elements)
* @param {integer} strideX112 - stride of the second dimension of `X11` (in complex elements)
* @param {NonNegativeInteger} offsetX11 - starting index for `X11` (in complex elements)
* @param {Complex128Array} X21 - bottom block (`(M-P)`-by-`Q`); on exit, `tril(X21)` holds reflectors for `P2`
* @param {integer} strideX211 - stride of the first dimension of `X21` (in complex elements)
* @param {integer} strideX212 - stride of the second dimension of `X21` (in complex elements)
* @param {NonNegativeInteger} offsetX21 - starting index for `X21` (in complex elements)
* @param {Float64Array} THETA - output array (length at least `Q`); CSD bidiagonal angles (real)
* @param {integer} strideTHETA - stride length for `THETA`
* @param {NonNegativeInteger} offsetTHETA - starting index for `THETA`
* @param {Float64Array} PHI - output array (length at least `Q-1`); CSD bidiagonal angles (real)
* @param {integer} stridePHI - stride length for `PHI`
* @param {NonNegativeInteger} offsetPHI - starting index for `PHI`
* @param {Complex128Array} TAUP1 - output array (length at least `P`); Householder scalars defining `P1`
* @param {integer} strideTAUP1 - stride length for `TAUP1` (in complex elements)
* @param {NonNegativeInteger} offsetTAUP1 - starting index for `TAUP1` (in complex elements)
* @param {Complex128Array} TAUP2 - output array (length at least `M-P`); Householder scalars defining `P2`
* @param {integer} strideTAUP2 - stride length for `TAUP2` (in complex elements)
* @param {NonNegativeInteger} offsetTAUP2 - starting index for `TAUP2` (in complex elements)
* @param {Complex128Array} TAUQ1 - output array (length at least `Q`); Householder scalars defining `Q1`
* @param {integer} strideTAUQ1 - stride length for `TAUQ1` (in complex elements)
* @param {NonNegativeInteger} offsetTAUQ1 - starting index for `TAUQ1` (in complex elements)
* @param {Complex128Array} WORK - workspace (length at least `M-Q`); the kernel uses two segments — `WORK[0..max(P-1,M-P-1,Q-1)-1]` for `zlarf` scratch and `WORK[0..Q-2-1]` for the `zunbdb5` scratch (these segments share the same buffer and are reused across the loop)
* @param {integer} strideWORK - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (in complex elements)
* @returns {integer} `info` (0 = success)
*/
function zunbdb1( M, P, Q, X11, strideX111, strideX112, offsetX11, X21, strideX211, strideX212, offsetX21, THETA, strideTHETA, offsetTHETA, PHI, stridePHI, offsetPHI, TAUP1, strideTAUP1, offsetTAUP1, TAUP2, strideTAUP2, offsetTAUP2, TAUQ1, strideTAUQ1, offsetTAUQ1, WORK, strideWORK, offsetWORK ) {
	var conjTauArr;
	var conjTauV;
	var oX11ii;
	var oX21ii;
	var theta;
	var tauv;
	var oTau;
	var X11v;
	var X21v;
	var n1;
	var n2;
	var c;
	var i;
	var s;

	// Reinterpret the complex arrays as Float64 views so we can set the diagonal element (an implicit `1` for the Householder vector) without allocating Complex128 objects in the loop. Strides/offsets must be doubled when indexing the Float64 view.
	X11v = reinterpret( X11, 0 );
	X21v = reinterpret( X21, 0 );

	// Buffer used to hold a conjugated tau value as a length-1 Complex128Array when calling zlarf with DCONJG(tau).
	conjTauArr = new Complex128Array( 1 );
	conjTauV = reinterpret( conjTauArr, 0 );

	// Reduce columns 0, ..., Q-1 of X11 and X21
	for ( i = 0; i < Q; i++ ) {
		// Offsets for the diagonal element X11(i,i) and X21(i,i) — in complex elements
		oX11ii = offsetX11 + ( i * strideX111 ) + ( i * strideX112 );
		oX21ii = offsetX21 + ( i * strideX211 ) + ( i * strideX212 );

		// Compute Householder reflector annihilating X11(i+1:p-1, i): result writes new alpha into X11(i,i) and the reflector into X11(i+1:p-1, i)
		zlarfgp( P - i, X11, oX11ii, X11, strideX111, oX11ii + strideX111, TAUP1, offsetTAUP1 + ( i * strideTAUP1 ) );

		// Compute Householder reflector annihilating X21(i+1:m-p-1, i): result writes new alpha into X21(i,i) and the reflector into X21(i+1:m-p-1, i)
		zlarfgp( M - P - i, X21, oX21ii, X21, strideX211, oX21ii + strideX211, TAUP2, offsetTAUP2 + ( i * strideTAUP2 ) );

		// After zlarfgp, the diagonal entries X11(i,i) and X21(i,i) are real and nonnegative (they are the magnitudes returned by ZLARFGP). Compute THETA(i) = atan2(X21(i,i), X11(i,i)) from their real parts.
		theta = Math.atan2( X21v[ oX21ii * 2 ], X11v[ oX11ii * 2 ] );
		THETA[ offsetTHETA + ( i * strideTHETA ) ] = theta;
		c = Math.cos( theta );
		s = Math.sin( theta );

		// Plant the implicit complex `1` for the Householder vector v at the diagonal
		X11v[ oX11ii * 2 ] = 1.0;
		X11v[ ( oX11ii * 2 ) + 1 ] = 0.0;
		X21v[ oX21ii * 2 ] = 1.0;
		X21v[ ( oX21ii * 2 ) + 1 ] = 0.0;

		// Apply P1 reflector to the trailing block X11(i:p-1, i+1:q-1) from the left, using the CONJUGATE of TAUP1(i) (Fortran: DCONJG(TAUP1(I))).
		oTau = ( offsetTAUP1 + ( i * strideTAUP1 ) ) * 2;
		tauv = reinterpret( TAUP1, 0 );
		conjTauV[ 0 ] = tauv[ oTau ];
		conjTauV[ 1 ] = -tauv[ oTau + 1 ];
		zlarf( 'left', P - i, Q - i - 1, X11, strideX111, oX11ii, conjTauArr, 0, X11, strideX111, strideX112, oX11ii + strideX112, WORK, strideWORK, offsetWORK );

		// Apply P2 reflector to the trailing block X21(i:m-p-1, i+1:q-1) from the left, using the conjugate of TAUP2(i).
		oTau = ( offsetTAUP2 + ( i * strideTAUP2 ) ) * 2;
		tauv = reinterpret( TAUP2, 0 );
		conjTauV[ 0 ] = tauv[ oTau ];
		conjTauV[ 1 ] = -tauv[ oTau + 1 ];
		zlarf( 'left', M - P - i, Q - i - 1, X21, strideX211, oX21ii, conjTauArr, 0, X21, strideX211, strideX212, oX21ii + strideX212, WORK, strideWORK, offsetWORK );

		if ( i < Q - 1 ) {
			// Rotate row i of X11 and X21 (columns i+1..q-1) by [c, s]; this combines the two block rows into a single bidiagonalized row.
			zdrot( Q - i - 1, X11, strideX112, oX11ii + strideX112, X21, strideX212, oX21ii + strideX212, c, s );

			// Conjugate row i of X21(:, i+1:q-1) before computing the row-vector Householder reflector (Fortran uses the unconjugated reflector formula on a transposed row).
			zlacgv( Q - i - 1, X21, strideX212, oX21ii + strideX212 );

			// Compute Q1 reflector along row i of X21 (columns i+1..q-1): writes new alpha into X21(i,i+1) and the reflector into X21(i,i+2..q-1).
			zlarfgp( Q - i - 1, X21, oX21ii + strideX212, X21, strideX212, oX21ii + ( 2 * strideX212 ), TAUQ1, offsetTAUQ1 + ( i * strideTAUQ1 ) );

			// Capture the new alpha (the bidiagonal off-diagonal entry's magnitude) — zlarfgp produces a real nonnegative scalar, so read the real part only. Then overwrite the slot with the implicit `1`.
			s = X21v[ ( oX21ii + strideX212 ) * 2 ];
			X21v[ ( oX21ii + strideX212 ) * 2 ] = 1.0;
			X21v[ ( ( oX21ii + strideX212 ) * 2 ) + 1 ] = 0.0;

			// Apply Q1 reflector from the right to the trailing block X11(i+1:p-1, i+1:q-1). Note: the reflector vector lives in row i of X21 with stride strideX212 (column stride), and TAUQ1 is used as-is (no conjugate).
			zlarf( 'right', P - i - 1, Q - i - 1, X21, strideX212, oX21ii + strideX212, TAUQ1, offsetTAUQ1 + ( i * strideTAUQ1 ), X11, strideX111, strideX112, oX11ii + strideX111 + strideX112, WORK, strideWORK, offsetWORK );

			// Apply Q1 reflector from the right to the trailing block X21(i+1:m-p-1, i+1:q-1).
			zlarf( 'right', M - P - i - 1, Q - i - 1, X21, strideX212, oX21ii + strideX212, TAUQ1, offsetTAUQ1 + ( i * strideTAUQ1 ), X21, strideX211, strideX212, oX21ii + strideX211 + strideX212, WORK, strideWORK, offsetWORK );

			// Restore (un-conjugate) row i of X21(:, i+1:q-1) so storage continues to hold the reflector in its expected (unconjugated) form for any subsequent consumer.
			zlacgv( Q - i - 1, X21, strideX212, oX21ii + strideX212 );

			// Compute c = sqrt(||X11(i+1:p-1, i+1)||^2 + ||X21(i+1:m-p-1, i+1)||^2). The norms are along the (i+1) column starting at row i+1.
			n1 = dznrm2( P - i - 1, X11, strideX111, oX11ii + strideX111 + strideX112 );
			n2 = dznrm2( M - P - i - 1, X21, strideX211, oX21ii + strideX211 + strideX212 );
			c = Math.sqrt( ( n1 * n1 ) + ( n2 * n2 ) );

			// Compute the angle PHI(i) = atan2(s, c)
			PHI[ offsetPHI + ( i * stridePHI ) ] = Math.atan2( s, c );

			// Re-orthogonalize the (i+1)-th column residual using the previously computed reflectors as the basis. The "Q" matrix here is X11(i+1:p-1, i+2:q-1) and X21(i+1:m-p-1, i+2:q-1), the implicit Householder vectors of the columns already reduced.
			zunbdb5( P - i - 1, M - P - i - 1, Q - i - 2, X11, strideX111, oX11ii + strideX111 + strideX112, X21, strideX211, oX21ii + strideX211 + strideX212, X11, strideX111, strideX112, oX11ii + strideX111 + ( 2 * strideX112 ), X21, strideX211, strideX212, oX21ii + strideX211 + ( 2 * strideX212 ), WORK, strideWORK, offsetWORK );
		}
	}

	return 0;
}


// EXPORTS //

export default zunbdb1;
