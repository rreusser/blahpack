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

/* eslint-disable max-len, max-params */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarfg from '../../zlarfg/lib/base.js';
import zlarf from '../../zlarf/lib/base.js';
import zlacgv from '../../zlacgv/lib/base.js';


// MAIN //

/**
* Reduces a complex M-by-N matrix A to upper or lower real bidiagonal form B.
* by a unitary transformation: `Q^H*A*P = B`.
*
* If M >= N, B is upper bidiagonal; if M < N, B is lower bidiagonal.
*
* @private
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Complex128Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Float64Array} d - output array of real diagonal elements of B
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - output array of real off-diagonal elements of B
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {Complex128Array} TAUQ - output array of scalar factors for Q
* @param {integer} strideTAUQ - stride for TAUQ (in complex elements)
* @param {NonNegativeInteger} offsetTAUQ - starting index for TAUQ (in complex elements)
* @param {Complex128Array} TAUP - output array of scalar factors for P
* @param {integer} strideTAUP - stride for TAUP (in complex elements)
* @param {NonNegativeInteger} offsetTAUP - starting index for TAUP (in complex elements)
* @param {Complex128Array} WORK - workspace array (length >= max(M,N))
* @param {integer} strideWork - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @returns {integer} info - 0 if successful
*/
function zgebd2( M, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAUQ, strideTAUQ, offsetTAUQ, TAUP, strideTAUP, offsetTAUP, WORK, strideWork, offsetWork ) {
	var conj_tauq;
	var conj_f64;
	var tauq_f64;
	var taup_f64;
	var tauq_off;
	var taup_off;
	var sa1;
	var sa2;
	var aii;
	var aij;
	var oA;
	var Av;
	var i;

	/* @complex-arrays A, TAUQ, TAUP, WORK */

	// Get Float64 views for direct element access
	Av = reinterpret( A, 0 );
	tauq_f64 = reinterpret( TAUQ, 0 );
	taup_f64 = reinterpret( TAUP, 0 );

	// Float64 strides and offsets
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;

	conj_tauq = new Complex128Array( 1 );
	conj_f64 = reinterpret( conj_tauq, 0 );

	if ( M >= N ) {
		// Reduce to upper bidiagonal form
		for ( i = 0; i < N; i++ ) {
			// Float64 index of A(i,i)
			aii = oA + (i * sa1) + (i * sa2);

			// Complex-element offsets for sub-routine calls
			tauq_off = offsetTAUQ + (i * strideTAUQ);

			// Generate elementary reflector H(i) to annihilate A(i+1:M-1, i)
			zlarfg( M - i, A, offsetA + (i * strideA1) + (i * strideA2), A, strideA1, offsetA + (Math.min( i + 1, M - 1 ) * strideA1) + (i * strideA2), TAUQ, tauq_off );

			// D(i) = real(alpha)
			d[ offsetD + (i * strideD) ] = Av[ aii ];

			// A(i,i) = 1.0 + 0.0i
			Av[ aii ] = 1.0;
			Av[ aii + 1 ] = 0.0;

			// Apply H(i)^H to A(i:M-1, i+1:N-1) from the left
			if ( i < N - 1 ) {
				// Zlarf uses conj(tau) for left application of H^H
				conj_f64[ 0 ] = tauq_f64[ ( offsetTAUQ + (i * strideTAUQ) ) * 2 ];
				conj_f64[ 1 ] = -tauq_f64[ (( offsetTAUQ + (i * strideTAUQ) ) * 2) + 1 ];

				zlarf( 'left', M - i, N - i - 1, A, strideA1, offsetA + (i * strideA1) + (i * strideA2), conj_tauq, 0, A, strideA1, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2), WORK, strideWork, offsetWork );
			}

			// Restore A(i,i) = D(i) (real, so imag = 0)
			Av[ aii ] = d[ offsetD + (i * strideD) ];
			Av[ aii + 1 ] = 0.0;

			if ( i < N - 1 ) {
				// TAUP(i) complex-element offset
				taup_off = offsetTAUP + (i * strideTAUP);

				// Float64 index of A(i, i+1)
				aij = oA + (i * sa1) + (( i + 1 ) * sa2);

				// Conjugate row A(i, i+1:N-1) for the reflector generation
				zlacgv( N - i - 1, A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2) );

				// Generate elementary reflector G(i) to annihilate A(i, i+2:N-1)
				zlarfg( N - i - 1, A, offsetA + (i * strideA1) + (( i + 1 ) * strideA2), A, strideA2, offsetA + (i * strideA1) + (Math.min( i + 2, N - 1 ) * strideA2), TAUP, taup_off );

				// E(i) = real(alpha)
				e[ offsetE + (i * strideE) ] = Av[ aij ];

				// A(i, i+1) = 1.0 + 0.0i
				Av[ aij ] = 1.0;
				Av[ aij + 1 ] = 0.0;

				// Apply G(i) to A(i+1:M-1, i+1:N-1) from the right
				zlarf( 'right', M - i - 1, N - i - 1, A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2), TAUP, taup_off, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (( i + 1 ) * strideA2), WORK, strideWork, offsetWork );

				// Unconjugate row A(i, i+1:N-1)
				zlacgv( N - i - 1, A, strideA2, offsetA + (i * strideA1) + (( i + 1 ) * strideA2) );

				// Restore A(i, i+1) = E(i) (real, so imag = 0)
				Av[ aij ] = e[ offsetE + (i * strideE) ];
				Av[ aij + 1 ] = 0.0;
			} else {
				// TAUP(i) = 0
				taup_off = ( offsetTAUP + (i * strideTAUP) ) * 2;
				taup_f64[ taup_off ] = 0.0;
				taup_f64[ taup_off + 1 ] = 0.0;
			}
		}
	} else {
		// Reduce to lower bidiagonal form
		for ( i = 0; i < M; i++ ) {
			// Float64 index of A(i,i)
			aii = oA + (i * sa1) + (i * sa2);

			// TAUP(i) complex-element offset
			taup_off = offsetTAUP + (i * strideTAUP);

			// Conjugate row A(i, i:N-1) for the reflector generation
			zlacgv( N - i, A, strideA2, offsetA + (i * strideA1) + (i * strideA2) );

			// Generate elementary reflector G(i) to annihilate A(i, i+1:N-1)
			zlarfg( N - i, A, offsetA + (i * strideA1) + (i * strideA2), A, strideA2, offsetA + (i * strideA1) + (Math.min( i + 1, N - 1 ) * strideA2), TAUP, taup_off );

			// D(i) = real(alpha)
			d[ offsetD + (i * strideD) ] = Av[ aii ];

			// A(i,i) = 1.0 + 0.0i
			Av[ aii ] = 1.0;
			Av[ aii + 1 ] = 0.0;

			// Apply G(i) to A(i+1:M-1, i:N-1) from the right
			if ( i < M - 1 ) {
				zlarf( 'right', M - i - 1, N - i, A, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAUP, taup_off, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), WORK, strideWork, offsetWork );
			}

			// Unconjugate row A(i, i:N-1)
			zlacgv( N - i, A, strideA2, offsetA + (i * strideA1) + (i * strideA2) );

			// Restore A(i,i) = D(i) (real, so imag = 0)
			Av[ aii ] = d[ offsetD + (i * strideD) ];
			Av[ aii + 1 ] = 0.0;

			if ( i < M - 1 ) {
				// TAUQ(i) complex-element offset
				tauq_off = offsetTAUQ + (i * strideTAUQ);

				// Float64 index of A(i+1, i)
				aij = oA + (( i + 1 ) * sa1) + (i * sa2);

				// Generate elementary reflector H(i) to annihilate A(i+2:M-1, i)
				zlarfg( M - i - 1, A, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), A, strideA1, offsetA + (Math.min( i + 2, M - 1 ) * strideA1) + (i * strideA2), TAUQ, tauq_off );

				// E(i) = real(alpha)
				e[ offsetE + (i * strideE) ] = Av[ aij ];

				// A(i+1, i) = 1.0 + 0.0i
				Av[ aij ] = 1.0;
				Av[ aij + 1 ] = 0.0;

				// Apply H(i)^H to A(i+1:M-1, i+1:N-1) from the left
				conj_f64[ 0 ] = tauq_f64[ ( offsetTAUQ + (i * strideTAUQ) ) * 2 ];
				conj_f64[ 1 ] = -tauq_f64[ (( offsetTAUQ + (i * strideTAUQ) ) * 2) + 1 ];

				zlarf( 'left', M - i - 1, N - i - 1, A, strideA1, offsetA + (( i + 1 ) * strideA1) + (i * strideA2), conj_tauq, 0, A, strideA1, strideA2, offsetA + (( i + 1 ) * strideA1) + (( i + 1 ) * strideA2), WORK, strideWork, offsetWork );

				// Restore A(i+1, i) = E(i) (real, so imag = 0)
				Av[ aij ] = e[ offsetE + (i * strideE) ];
				Av[ aij + 1 ] = 0.0;
			} else {
				// TAUQ(i) = 0
				tauq_off = ( offsetTAUQ + (i * strideTAUQ) ) * 2;
				tauq_f64[ tauq_off ] = 0.0;
				tauq_f64[ tauq_off + 1 ] = 0.0;
			}
		}
	}

	return 0;
}


// EXPORTS //

export default zgebd2;
