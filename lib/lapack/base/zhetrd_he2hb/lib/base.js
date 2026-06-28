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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function, camelcase */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import zhemm from '../../../../blas/base/zhemm/lib/base.js';
import zher2k from '../../../../blas/base/zher2k/lib/base.js';
import zgelqf from '../../zgelqf/lib/base.js';
import zgeqrf from '../../zgeqrf/lib/base.js';
import zlarft from '../../zlarft/lib/base.js';
import zlaset from '../../zlaset/lib/base.js';


// VARIABLES //

var ZERO = new Complex128( 0.0, 0.0 );
var ONE = new Complex128( 1.0, 0.0 );
var NEG_ONE = new Complex128( -1.0, 0.0 );
var NEG_HALF = new Complex128( -0.5, 0.0 );


// MAIN //

/**
* Reduces a complex Hermitian matrix A to complex Hermitian band-diagonal form AB.
* by a unitary similarity transformation: `Q__H * A * Q = AB`.
*
* Implements the blocked panel reduction of Haidar, Ltaief and Dongarra (SC11, SC13). At each panel of `kd` columns/rows, an LQ (upper) or QR (lower) factorization captures the reflectors that map the off-band entries to zero; the block reflector representation `T` is formed via `zlarft`, and the trailing Hermitian submatrix is updated via `zhemm`, `zgemm`, and `zher2k`. The reduced band is then copied into `AB` (band storage).
*
* The caller-provided `WORK` array is partitioned into four sub-buffers matching the Fortran reference:
*
* -   `WORK[0 .. kd*kd-1]`           — `T`, KD-by-KD triangular factor of the block reflector.
* -   `WORK[kd*kd .. kd*kd+N*kd-1]`  — `W`, LDW-by-KD intermediate buffer (LDW = kd for upper, N for lower).
* -   next `kd*kd` complex elements  — `S1`, KD-by-KD scratch.
* -   tail                           — `S2`, LDS2-by-KD scratch (LDS2 = kd for upper, N for lower); also used as `zgelqf`/`zgeqrf` workspace.
*
* The minimum size is `N*kd + N*max(kd, FACTOPTNB) + 2*kd*kd` complex elements (with `FACTOPTNB = 32`). When `WORK === null`, an internal buffer is allocated.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super-/sub-diagonals of the reduced band matrix
* @param {Complex128Array} A - input/output Hermitian matrix (complex-element strides)
* @param {integer} strideA1 - stride of first dimension of A (complex elements)
* @param {integer} strideA2 - stride of second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} AB - output band-diagonal matrix (complex-element strides)
* @param {integer} strideAB1 - stride of first dimension of AB (complex elements)
* @param {integer} strideAB2 - stride of second dimension of AB (complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for AB (complex elements)
* @param {Complex128Array} TAU - output array of scalar factors of reflectors (length N-KD)
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} WORK - workspace (caller-provided; minimum size `N*kd + N*max(kd,32) + 2*kd*kd` complex elements when used with kd >= 1)
* @param {integer} strideWork - stride for `WORK` (in complex elements; typically 1)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @returns {integer} info (0 = success)
*/
function zhetrd_he2hb( uplo, N, kd, A, strideA1, strideA2, offsetA, AB, strideAB1, strideAB2, offsetAB, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var s1pos;
	var s2pos;
	var upper;
	var ldab;
	var ldS1;
	var ldS2;
	var sab1;
	var sab2;
	var tpos;
	var wpos;
	var ldT;
	var ldW;
	var sa1;
	var sa2;
	var pn;
	var pk;
	var lk;
	var sw;
	var ow;
	var i;
	var j;

	upper = ( uplo === 'upper' );
	sa1 = strideA1;
	sa2 = strideA2;
	sab1 = strideAB1;
	sab2 = strideAB2;

	// Quick return:
	if ( N === 0 ) {
		return 0;
	}

	// Quick return: if N <= KD+1, just copy the relevant triangle of A into AB:
	if ( N <= kd + 1 ) {
		if ( upper ) {
			for ( i = 0; i < N; i++ ) {
				lk = Math.min( kd + 1, i + 1 );
				zcopy( lk, A, sa1, offsetA + (( i - lk + 1 ) * sa1) + (i * sa2), AB, sab1, offsetAB + (( kd + 1 - lk ) * sab1) + (i * sab2) );
			}
		} else {
			for ( i = 0; i < N; i++ ) {
				lk = Math.min( kd + 1, N - i );
				zcopy( lk, A, sa1, offsetA + (i * sa1) + (i * sa2), AB, sab1, offsetAB + (i * sab2) );
			}
		}
		return 0;
	}

	// Partition the workspace (Fortran TPOS / WPOS / S1POS / S2POS).
	// The Fortran sizes T (LT = KD*KD), W (LW = N*KD, regardless of uplo), S1 (LS1 = KD*KD), and S2 (LS2 = remainder). Leading dimensions LDW and LDS2 differ by uplo so subsequent BLAS calls index correctly within each block:
	ldT = kd;
	ldS1 = kd;
	if ( upper ) {
		ldW = kd;
		ldS2 = kd;
	} else {
		ldW = N;
		ldS2 = N;
	}
	sw = strideWork;
	ow = offsetWork;
	tpos = ow;
	wpos = tpos + ( (kd * kd) * sw );
	s1pos = wpos + ( (N * kd) * sw );
	s2pos = s1pos + ( (kd * kd) * sw );

	// Initialize T to zero so the unused upper/lower portion is always zero regardless of which branch zlarft writes into:
	zlaset( 'full', ldT, kd, ZERO, ZERO, WORK, sw, ldT * sw, tpos );

	// Stride for the band-copy of A's main diagonal into AB:
	ldab = sab2 - sab1;

	if ( upper ) {
		// Reduce the upper triangle of A. Fortran: DO I = 1, N-KD, KD (1-based) -> i = 0, KD, ... while i < N - KD (0-based):
		for ( i = 0; i < N - kd; i += kd ) {
			pn = N - i - kd;
			pk = Math.min( pn, kd );

			// LQ factorization of the panel A(i:i+KD-1, i+KD:N-1):
			zgelqf( kd, pn, A, sa1, sa2, offsetA + (i * sa1) + (( i + kd ) * sa2), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, sw, s2pos );

			// Copy the band columns of A into AB (Fortran: ZCOPY(LK, A(J,J), LDA, AB(KD+1,J), LDAB-1)):
			for ( j = i; j < i + pk; j++ ) {
				lk = Math.min( kd, N - 1 - j ) + 1;
				zcopy( lk, A, sa2, offsetA + (j * sa1) + (j * sa2), AB, ldab, offsetAB + (kd * sab1) + (j * sab2) );
			}

			// Replace the lower-trapezoidal reflector storage in A with the implicit identity (rowwise storage):
			zlaset( 'lower', pk, pk, ZERO, ONE, A, sa1, sa2, offsetA + (i * sa1) + (( i + kd ) * sa2) );

			// Form the block reflector T from the rowwise V:
			zlarft( 'forward', 'rowwise', pn, pk, A, sa1, sa2, offsetA + (i * sa1) + (( i + kd ) * sa2), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, sw, ldT * sw, tpos );

			// S2 = T^H * V (Fortran: ZGEMM('Conjugate', 'No transpose', PK, PN, PK, ONE, T, LDT, V, LDA, ZERO, S2, LDS2)):
			zgemm( 'conjugate-transpose', 'no-transpose', pk, pn, pk, ONE, WORK, sw, ldT * sw, tpos, A, sa1, sa2, offsetA + (i * sa1) + (( i + kd ) * sa2), ZERO, WORK, sw, ldS2 * sw, s2pos );

			// W = A_sub * S2 from the right (Fortran: ZHEMM('Right', UPLO, PK, PN, ONE, A(I+KD,I+KD), LDA, S2, LDS2, ZERO, W, LDW)):
			zhemm( 'right', uplo, pk, pn, ONE, A, sa1, sa2, offsetA + (( i + kd ) * sa1) + (( i + kd ) * sa2), WORK, sw, ldS2 * sw, s2pos, ZERO, WORK, sw, ldW * sw, wpos );

			// S1 = W * S2^H (Fortran: ZGEMM('No transpose', 'Conjugate', PK, PK, PN, ONE, W, LDW, S2, LDS2, ZERO, S1, LDS1)):
			zgemm( 'no-transpose', 'conjugate-transpose', pk, pk, pn, ONE, WORK, sw, ldW * sw, wpos, WORK, sw, ldS2 * sw, s2pos, ZERO, WORK, sw, ldS1 * sw, s1pos );

			// W := W - (1/2) * S1 * V (Fortran: ZGEMM('No transpose', 'No transpose', PK, PN, PK, -HALF, S1, LDS1, V, LDA, ONE, W, LDW)):
			zgemm( 'no-transpose', 'no-transpose', pk, pn, pk, NEG_HALF, WORK, sw, ldS1 * sw, s1pos, A, sa1, sa2, offsetA + (i * sa1) + (( i + kd ) * sa2), ONE, WORK, sw, ldW * sw, wpos );

			// Update trailing submatrix A(i+KD:N-1, i+KD:N-1) via the Hermitian rank-2k update A := A - V^H * W - W^H * V:
			zher2k( uplo, 'conjugate-transpose', pn, pk, NEG_ONE, A, sa1, sa2, offsetA + (i * sa1) + (( i + kd ) * sa2), WORK, sw, ldW * sw, wpos, 1.0, A, sa1, sa2, offsetA + (( i + kd ) * sa1) + (( i + kd ) * sa2) );
		}

		// Copy the final KD columns of A (now containing the band) into AB:
		for ( j = N - kd; j < N; j++ ) {
			lk = Math.min( kd, N - 1 - j ) + 1;
			zcopy( lk, A, sa2, offsetA + (j * sa1) + (j * sa2), AB, ldab, offsetAB + (kd * sab1) + (j * sab2) );
		}
	} else {
		// Reduce the lower triangle of A:
		for ( i = 0; i < N - kd; i += kd ) {
			pn = N - i - kd;
			pk = Math.min( pn, kd );

			// QR factorization of the panel A(i+KD:N-1, i:i+KD-1):
			zgeqrf( pn, kd, A, sa1, sa2, offsetA + (( i + kd ) * sa1) + (i * sa2), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, sw, s2pos );

			// Copy the band columns of A into AB (Fortran: ZCOPY(LK, A(J,J), 1, AB(1,J), 1)):
			for ( j = i; j < i + pk; j++ ) {
				lk = Math.min( kd, N - 1 - j ) + 1;
				zcopy( lk, A, sa1, offsetA + (j * sa1) + (j * sa2), AB, sab1, offsetAB + (j * sab2) );
			}

			// Replace the upper-triangular reflector storage with the implicit identity (columnwise V):
			zlaset( 'upper', pk, pk, ZERO, ONE, A, sa1, sa2, offsetA + (( i + kd ) * sa1) + (i * sa2) );

			// Form the block reflector T from the columnwise V:
			zlarft( 'forward', 'columnwise', pn, pk, A, sa1, sa2, offsetA + (( i + kd ) * sa1) + (i * sa2), TAU, strideTAU, offsetTAU + (i * strideTAU), WORK, sw, ldT * sw, tpos );

			// S2 = V * T (Fortran: ZGEMM('No transpose', 'No transpose', PN, PK, PK, ONE, V, LDA, T, LDT, ZERO, S2, LDS2)):
			zgemm( 'no-transpose', 'no-transpose', pn, pk, pk, ONE, A, sa1, sa2, offsetA + (( i + kd ) * sa1) + (i * sa2), WORK, sw, ldT * sw, tpos, ZERO, WORK, sw, ldS2 * sw, s2pos );

			// W = A_sub * S2 from the left (Fortran: ZHEMM('Left', UPLO, PN, PK, ONE, A(I+KD,I+KD), LDA, S2, LDS2, ZERO, W, LDW)):
			zhemm( 'left', uplo, pn, pk, ONE, A, sa1, sa2, offsetA + (( i + kd ) * sa1) + (( i + kd ) * sa2), WORK, sw, ldS2 * sw, s2pos, ZERO, WORK, sw, ldW * sw, wpos );

			// S1 = S2^H * W (Fortran: ZGEMM('Conjugate', 'No transpose', PK, PK, PN, ONE, S2, LDS2, W, LDW, ZERO, S1, LDS1)):
			zgemm( 'conjugate-transpose', 'no-transpose', pk, pk, pn, ONE, WORK, sw, ldS2 * sw, s2pos, WORK, sw, ldW * sw, wpos, ZERO, WORK, sw, ldS1 * sw, s1pos );

			// W := W - (1/2) * V * S1 (Fortran: ZGEMM('No transpose', 'No transpose', PN, PK, PK, -HALF, V, LDA, S1, LDS1, ONE, W, LDW)):
			zgemm( 'no-transpose', 'no-transpose', pn, pk, pk, NEG_HALF, A, sa1, sa2, offsetA + (( i + kd ) * sa1) + (i * sa2), WORK, sw, ldS1 * sw, s1pos, ONE, WORK, sw, ldW * sw, wpos );

			// Update trailing submatrix via the Hermitian rank-2k update A := A - V * W^H - W * V^H:
			zher2k( uplo, 'no-transpose', pn, pk, NEG_ONE, A, sa1, sa2, offsetA + (( i + kd ) * sa1) + (i * sa2), WORK, sw, ldW * sw, wpos, 1.0, A, sa1, sa2, offsetA + (( i + kd ) * sa1) + (( i + kd ) * sa2) );
		}

		// Copy the final KD columns of A (now lower band) into AB:
		for ( j = N - kd; j < N; j++ ) {
			lk = Math.min( kd, N - 1 - j ) + 1;
			zcopy( lk, A, sa1, offsetA + (j * sa1) + (j * sa2), AB, sab1, offsetAB + (j * sab2) );
		}
	}

	return 0;
}


// EXPORTS //

export default zhetrd_he2hb;
