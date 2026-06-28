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

/* eslint-disable max-len, max-params */

// MODULES //

import Int32Array from '@stdlib/array/int32/lib/index.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import dlange from '../../dlange/lib/base.js';
import dggsvp3 from '../../dggsvp3/lib/base.js';
import dtgsja from '../../dtgsja/lib/base.js';


// VARIABLES //

var ULP = dlamch( 'Precision' );
var UNFL = dlamch( 'Safe Minimum' );


// MAIN //

/**
* Computes the generalized singular value decomposition (GSVD) of an M-by-N.
* real matrix A and P-by-N real matrix B:
*
*   U^T_A_Q = D1_(0 R),    V^T_B_Q = D2_(0 R)
*
* where U, V and Q are orthogonal matrices.
*
* @private
* @param {string} jobu - `'compute-U'` or `'none'`
* @param {string} jobv - `'compute-V'` or `'none'`
* @param {string} jobq - `'compute-Q'` or `'none'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {NonNegativeInteger} p - number of rows of B
* @param {Int32Array} K - output: K[0] receives first dimension of subblocks
* @param {Int32Array} l - output: l[0] receives second dimension of subblocks
* @param {Float64Array} A - M-by-N matrix A (overwritten with triangular R)
* @param {integer} strideA1 - stride of first dimension of A
* @param {integer} strideA2 - stride of second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - P-by-N matrix B (overwritten)
* @param {integer} strideB1 - stride of first dimension of B
* @param {integer} strideB2 - stride of second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} ALPHA - output array for alpha values (length N)
* @param {integer} strideALPHA - stride for ALPHA
* @param {NonNegativeInteger} offsetALPHA - starting index for ALPHA
* @param {Float64Array} BETA - output array for beta values (length N)
* @param {integer} strideBETA - stride for BETA
* @param {NonNegativeInteger} offsetBETA - starting index for BETA
* @param {Float64Array} U - M-by-M orthogonal matrix U
* @param {integer} strideU1 - stride of first dimension of U
* @param {integer} strideU2 - stride of second dimension of U
* @param {NonNegativeInteger} offsetU - starting index for U
* @param {Float64Array} V - P-by-P orthogonal matrix V
* @param {integer} strideV1 - stride of first dimension of V
* @param {integer} strideV2 - stride of second dimension of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {Float64Array} Q - N-by-N orthogonal matrix Q
* @param {integer} strideQ1 - stride of first dimension of Q
* @param {integer} strideQ2 - stride of second dimension of Q
* @param {NonNegativeInteger} offsetQ - starting index for Q
* @param {Float64Array} WORK - workspace array of length at least max(1, lwork)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {integer} lwork - workspace size; -1 for workspace query
* @param {Int32Array} IWORK - integer workspace of length N
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @returns {integer} info - 0 for success, 1 if Jacobi procedure failed to converge
*/
function dggsvd3( jobu, jobv, jobq, M, N, p, K, l, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork, lwork, IWORK, strideIWork, offsetIWork ) {
	var lwkopt;
	var ncycle;
	var anorm;
	var bnorm;
	var ibnd;
	var isub;
	var smax;
	var temp;
	var tola;
	var tolb;
	var info;
	var kval;
	var lval;
	var i;
	var j;

	// Compute workspace

	// Call dggsvp3 with lwork=-1 for workspace query
	lwkopt = 1;

	// For workspace query, call dggsvp3 with lwork=-1

	// dggsvp3 needs TAU(N) + inner WORK; we put TAU in WORK[0..N-1]

	// And inner WORK in WORK[N..].
	dggsvp3( jobu, jobv, jobq, M, p, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, 0, 0, K, l, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWork, offsetIWork, WORK, strideWork, offsetWork, WORK, strideWork, offsetWork, -1);
	lwkopt = N + ( WORK[ offsetWork ] | 0 );
	lwkopt = Math.max( 2 * N, lwkopt );
	lwkopt = Math.max( 1, lwkopt );
	WORK[ offsetWork ] = lwkopt;

	if ( lwork === -1 ) {
		return 0;
	}

	// Compute the Frobenius norm of matrices A and B
	anorm = dlange( 'one-norm', M, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork );
	bnorm = dlange( 'one-norm', p, N, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork );

	// Get machine precision and set up threshold for determining

	// The effective numerical rank of the matrices A and B.
	tola = Math.max( M, N ) * Math.max( anorm, UNFL ) * ULP;
	tolb = Math.max( p, N ) * Math.max( bnorm, UNFL ) * ULP;

	// Preprocessing
	dggsvp3( jobu, jobv, jobq, M, p, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, K, l, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWork, offsetIWork, WORK, strideWork, offsetWork, WORK, strideWork, offsetWork + ( N * strideWork ), lwork - N);

	kval = K[ 0 ];
	lval = l[ 0 ];

	// Compute the GSVD of two upper "triangular" matrices
	ncycle = new Int32Array( 1 );
	info = dtgsja( jobu, jobv, jobq, M, p, N, kval, lval, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork, ncycle);

	// Sort the singular values and store the pivot indices in IWORK

	// Copy ALPHA to WORK, then sort ALPHA in WORK
	dcopy( N, ALPHA, strideALPHA, offsetALPHA, WORK, strideWork, offsetWork );
	ibnd = Math.min( lval, M - kval );
	for ( i = 0; i < ibnd; i++ ) {
		// Scan for largest ALPHA(K+I)
		isub = i;
		smax = WORK[ offsetWork + ( ( kval + i ) * strideWork ) ];
		for ( j = i + 1; j < ibnd; j++ ) {
			temp = WORK[ offsetWork + ( ( kval + j ) * strideWork ) ];
			if ( temp > smax ) {
				isub = j;
				smax = temp;
			}
		}
		if ( isub !== i ) {
			WORK[ offsetWork + ( ( kval + isub ) * strideWork ) ] = WORK[ offsetWork + ( ( kval + i ) * strideWork ) ];
			WORK[ offsetWork + ( ( kval + i ) * strideWork ) ] = smax;
			IWORK[ offsetIWork + ( ( kval + i ) * strideIWork ) ] = kval + isub;
		} else {
			IWORK[ offsetIWork + ( ( kval + i ) * strideIWork ) ] = kval + i;
		}
	}

	WORK[ offsetWork ] = lwkopt;
	return info;
}


// EXPORTS //

export default dggsvd3;
