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


// VARIABLES //

// Module-level scratch buffer for passing conjugated tau scalars to zlarf without per-call allocation.
var scratchTau = new Complex128Array( 1 );
var scratchTauv = reinterpret( scratchTau, 0 );


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
* where `X11` is `P`-by-`Q`, `X21` is `(M-P)`-by-`Q`, and `M-P <= min(P, Q, M-Q)` (variant 3 of the zunbdb1-6 family — `M-P` is the minimum dimension). `P1`, `P2`, and `Q1` are unitary matrices represented implicitly via Householder reflectors stored in `X11`/`X21` and the scalar arrays `TAUP1`/`TAUP2`/`TAUQ1`. `B11` and `B21` are upper-bidiagonal `(M-P)`-by-`(M-P)` matrices represented implicitly by the real angle arrays `THETA` and `PHI`.
*
* @private
* @param {NonNegativeInteger} M - total number of rows in `[X11; X21]` (i.e. `P + (M-P)`)
* @param {NonNegativeInteger} P - number of rows in `X11` (`2*P >= M`, i.e. `M-P <= P`)
* @param {NonNegativeInteger} Q - number of columns in both `X11` and `X21` (`Q >= M-P` and `Q <= P`)
* @param {Complex128Array} X11 - top block (`P`-by-`Q`); on exit, `tril(X11)` holds reflectors for `P1` and `triu(X11,1)` holds reflectors for `Q1`
* @param {integer} strideX111 - stride of the first dimension of `X11` (in complex elements)
* @param {integer} strideX112 - stride of the second dimension of `X11` (in complex elements)
* @param {NonNegativeInteger} offsetX11 - starting index for `X11` (in complex elements)
* @param {Complex128Array} X21 - bottom block (`(M-P)`-by-`Q`); on exit, `tril(X21)` holds reflectors for `P2`
* @param {integer} strideX211 - stride of the first dimension of `X21` (in complex elements)
* @param {integer} strideX212 - stride of the second dimension of `X21` (in complex elements)
* @param {NonNegativeInteger} offsetX21 - starting index for `X21` (in complex elements)
* @param {Float64Array} THETA - output array (length at least `Q`); CSD bidiagonal angles (only the first `M-P` entries are written)
* @param {integer} strideTHETA - stride length for `THETA`
* @param {NonNegativeInteger} offsetTHETA - starting index for `THETA`
* @param {Float64Array} PHI - output array (length at least `Q-1`); CSD bidiagonal angles (only the first `M-P-1` entries are written)
* @param {integer} stridePHI - stride length for `PHI`
* @param {NonNegativeInteger} offsetPHI - starting index for `PHI`
* @param {Complex128Array} TAUP1 - output array (length at least `P`); Householder scalars defining `P1`
* @param {integer} strideTAUP1 - stride length for `TAUP1` (in complex elements)
* @param {NonNegativeInteger} offsetTAUP1 - starting index for `TAUP1` (in complex elements)
* @param {Complex128Array} TAUP2 - output array (length at least `M-P`); Householder scalars defining `P2`
* @param {integer} strideTAUP2 - stride length for `TAUP2` (in complex elements)
* @param {NonNegativeInteger} offsetTAUP2 - starting index for `TAUP2` (in complex elements)
* @param {Complex128Array} TAUQ1 - output array (length at least `Q`); Householder scalars defining `Q1` (only the first `M-P` entries are written)
* @param {integer} strideTAUQ1 - stride length for `TAUQ1` (in complex elements)
* @param {NonNegativeInteger} offsetTAUQ1 - starting index for `TAUQ1` (in complex elements)
* @param {Complex128Array} WORK - workspace (length at least `max(P, M-P-1, Q-1)` complex elements)
* @param {integer} strideWORK - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (in complex elements)
* @returns {integer} `info` (0 = success)
*/
function zunbdb3( M, P, Q, X11, strideX111, strideX112, offsetX11, X21, strideX211, strideX212, offsetX21, THETA, strideTHETA, offsetTHETA, PHI, stridePHI, offsetPHI, TAUP1, strideTAUP1, offsetTAUP1, TAUP2, strideTAUP2, offsetTAUP2, TAUQ1, strideTAUQ1, offsetTAUQ1, WORK, strideWORK, offsetWORK ) {
	var oX11iiC;
	var oX21iiC;
	var oX11ii;
	var oX21ii;
	var oTAUP1;
	var oTAUP2;
	var oTAUQ1;
	var TAUP1v;
	var TAUP2v;
	var theta;
	var sx211;
	var X11v;
	var X21v;
	var phi;
	var n1;
	var n2;
	var c;
	var i;
	var s;

	// Float64 views of the complex arrays for direct real-part reads and for planting the implicit `1.0 + 0.0i`.
	X11v = reinterpret( X11, 0 );
	X21v = reinterpret( X21, 0 );
	TAUP1v = reinterpret( TAUP1, 0 );
	TAUP2v = reinterpret( TAUP2, 0 );

	// Cache the doubled row-stride used for Float64 indexing of X21.
	sx211 = strideX211 * 2;

	// Reduce rows 0, ..., M-P-1 of X11 and X21
	for ( i = 0; i < M - P; i++ ) {
		// Complex-element offsets for the diagonal X11(i,i) and X21(i,i), used when passing to dependencies.
		oX11iiC = offsetX11 + ( i * strideX111 ) + ( i * strideX112 );
		oX21iiC = offsetX21 + ( i * strideX211 ) + ( i * strideX212 );

		// Float64-view offsets (doubled).
		oX11ii = oX11iiC * 2;
		oX21ii = oX21iiC * 2;

		if ( i > 0 ) {
			// Mix row i-1 of X11 with row i of X21 along columns i..Q-1 (Q-i entries — Fortran "Q-I+1") using the cosine/sine from the previous iteration's PHI. Note: the reference Fortran calls ZDROT with LDX11 as the stride for *both* X11 and X21 (a known peculiarity of zunbdb3.f line 282 in LAPACK 3.12.0); we mirror that behavior so test fixtures match the Fortran reference exactly. The layout wrapper enforces LDX11 = LDX21 implicitly because both share the order parameter.
			// TODO: This ZDROT uses strideX112 for both X11 and X21, mirroring a likely typo in reference zunbdb3.f (LDX11 vs LDX21). When the two leading dimensions differ, the result will diverge from a "correct" implementation. The wrapper picks matching strides so this never triggers in normal usage.
			zdrot( Q - i, X11, strideX112, oX11iiC - strideX111, X21, strideX112, oX21iiC, c, s );
		}

		// Conjugate row i of X21 in place along columns i..Q-1 (Fortran ZLACGV before & after ZLARFGP / ZLARFs from right). This is the standard trick: zlarfgp/zlarf operate column-wise; the conjugation transposes "row from right" into "column from left" for the underlying complex Householder math.
		zlacgv( Q - i, X21, strideX212, oX21iiC );

		// Compute Q1^H reflector along row i of X21 starting at (i,i): writes new beta (real, ≥ 0) into X21(i,i) and the reflector into X21(i, i+1..Q-1).
		oTAUQ1 = offsetTAUQ1 + ( i * strideTAUQ1 );
		zlarfgp( Q - i, X21, oX21iiC, X21, strideX212, oX21iiC + strideX212, TAUQ1, oTAUQ1 );

		// Capture the new beta (bidiagonal entry, real-valued after zlarfgp) before overwriting it with the implicit `1+0i`.
		s = X21v[ oX21ii ];
		X21v[ oX21ii ] = 1.0;
		X21v[ oX21ii + 1 ] = 0.0;

		// Apply Q1 reflector from the right to X11(i:P-1, i:Q-1) using row i of X21 as the reflector vector.
		zlarf( 'right', P - i, Q - i, X21, strideX212, oX21iiC, TAUQ1, oTAUQ1, X11, strideX111, strideX112, oX11iiC, WORK, strideWORK, offsetWORK );

		// Apply Q1 reflector from the right to X21(i+1:M-P-1, i:Q-1)
		zlarf( 'right', M - P - i - 1, Q - i, X21, strideX212, oX21iiC, TAUQ1, oTAUQ1, X21, strideX211, strideX212, oX21iiC + strideX211, WORK, strideWORK, offsetWORK );

		// Restore row i of X21 (undo the conjugation applied above).
		zlacgv( Q - i, X21, strideX212, oX21iiC );

		// Compute c = sqrt(||X11(i:P-1, i)||^2 + ||X21(i+1:M-P-1, i)||^2). The norms are along column i.
		n1 = dznrm2( P - i, X11, strideX111, oX11iiC );
		n2 = dznrm2( M - P - i - 1, X21, strideX211, oX21iiC + strideX211 );
		c = Math.sqrt( ( n1 * n1 ) + ( n2 * n2 ) );

		// THETA(i) = atan2(s, c). s came from real(X21(i,i)) post-zlarfgp — real because beta is real-and-non-negative.
		theta = Math.atan2( s, c );
		THETA[ offsetTHETA + ( i * strideTHETA ) ] = theta;

		// Re-orthogonalize column i of [X11; X21] against the trailing block. The "Q" matrix here is X11(i:P-1, i+1:Q-1) and X21(i+1:M-P-1, i+1:Q-1), the implicit Householder vectors of the columns already reduced.
		zunbdb5( P - i, M - P - i - 1, Q - i - 1, X11, strideX111, oX11iiC, X21, strideX211, oX21iiC + strideX211, X11, strideX111, strideX112, oX11iiC + strideX112, X21, strideX211, strideX212, oX21iiC + strideX211 + strideX212, WORK, strideWORK, offsetWORK );

		// Compute Householder reflector annihilating X11(i+1:P-1, i): writes new alpha (real ≥ 0) into X11(i,i) and the reflector into X11(i+1:P-1, i).
		zlarfgp( P - i, X11, oX11iiC, X11, strideX111, oX11iiC + strideX111, TAUP1, offsetTAUP1 + ( i * strideTAUP1 ) );

		if ( i < M - P - 1 ) {
			// Compute Householder reflector annihilating X21(i+2:M-P-1, i): writes new alpha (real ≥ 0) into X21(i+1,i) and the reflector into X21(i+2:M-P-1, i).
			zlarfgp( M - P - i - 1, X21, oX21iiC + strideX211, X21, strideX211, oX21iiC + ( 2 * strideX211 ), TAUP2, offsetTAUP2 + ( i * strideTAUP2 ) );

			// PHI(i) = atan2( real(X21(i+1,i)), real(X11(i,i)) ). Both diagonal entries are real-and-non-negative after zlarfgp, so reading just the real component is correct.
			phi = Math.atan2( X21v[ oX21ii + sx211 ], X11v[ oX11ii ] );
			PHI[ offsetPHI + ( i * stridePHI ) ] = phi;
			c = Math.cos( phi );
			s = Math.sin( phi );

			// Plant the implicit `1 + 0i` for the P2 reflector v at X21(i+1, i).
			X21v[ oX21ii + sx211 ] = 1.0;
			X21v[ oX21ii + sx211 + 1 ] = 0.0;

			// Apply P2 from the left to X21(i+1:M-P-1, i+1:Q-1) using DCONJG(TAUP2(I)). Stage the conjugate into scratch and pass that as the tau Complex128Array.
			oTAUP2 = ( offsetTAUP2 + ( i * strideTAUP2 ) ) * 2;
			scratchTauv[ 0 ] = TAUP2v[ oTAUP2 ];
			scratchTauv[ 1 ] = -TAUP2v[ oTAUP2 + 1 ];
			zlarf( 'left', M - P - i - 1, Q - i - 1, X21, strideX211, oX21iiC + strideX211, scratchTau, 0, X21, strideX211, strideX212, oX21iiC + strideX211 + strideX212, WORK, strideWORK, offsetWORK );
		}

		// Plant the implicit `1 + 0i` for the P1 reflector v at X11(i, i), then apply P1 from the left to X11(i:P-1, i+1:Q-1) using DCONJG(TAUP1(I)).
		X11v[ oX11ii ] = 1.0;
		X11v[ oX11ii + 1 ] = 0.0;
		oTAUP1 = ( offsetTAUP1 + ( i * strideTAUP1 ) ) * 2;
		scratchTauv[ 0 ] = TAUP1v[ oTAUP1 ];
		scratchTauv[ 1 ] = -TAUP1v[ oTAUP1 + 1 ];
		zlarf( 'left', P - i, Q - i - 1, X11, strideX111, oX11iiC, scratchTau, 0, X11, strideX111, strideX112, oX11iiC + strideX112, WORK, strideWORK, offsetWORK );
	}

	// Reduce the bottom-right portion of X11 to the identity matrix (columns M-P..Q-1 of X11).
	for ( i = M - P; i < Q; i++ ) {
		oX11iiC = offsetX11 + ( i * strideX111 ) + ( i * strideX112 );
		oX11ii = oX11iiC * 2;

		// Householder reflector annihilating X11(i+1:P-1, i).
		zlarfgp( P - i, X11, oX11iiC, X11, strideX111, oX11iiC + strideX111, TAUP1, offsetTAUP1 + ( i * strideTAUP1 ) );

		// Plant the implicit `1 + 0i` and apply P1 to X11(i:P-1, i+1:Q-1) from the left, using DCONJG(TAUP1(I)).
		X11v[ oX11ii ] = 1.0;
		X11v[ oX11ii + 1 ] = 0.0;
		oTAUP1 = ( offsetTAUP1 + ( i * strideTAUP1 ) ) * 2;
		scratchTauv[ 0 ] = TAUP1v[ oTAUP1 ];
		scratchTauv[ 1 ] = -TAUP1v[ oTAUP1 + 1 ];
		zlarf( 'left', P - i, Q - i - 1, X11, strideX111, oX11iiC, scratchTau, 0, X11, strideX111, strideX112, oX11iiC + strideX112, WORK, strideWORK, offsetWORK );
	}

	return 0;
}


// EXPORTS //

export default zunbdb3;
