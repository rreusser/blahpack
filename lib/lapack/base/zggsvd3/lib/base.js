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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import zlange from '../../zlange/lib/base.js';
import zggsvp3 from '../../zggsvp3/lib/base.js';
import ztgsja from '../../ztgsja/lib/base.js';


// VARIABLES //

var ULP = dlamch( 'Precision' );
var UNFL = dlamch( 'Safe Minimum' );


// MAIN //

/**
* Computes the generalized singular value decomposition (GSVD) of an M-by-N complex matrix A and a P-by-N complex matrix B.
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
* @param {Complex128Array} A - M-by-N matrix A (overwritten with triangular R)
* @param {integer} strideA1 - stride of first dimension of A (complex elements)
* @param {integer} strideA2 - stride of second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - P-by-N matrix B (overwritten)
* @param {integer} strideB1 - stride of first dimension of B (complex elements)
* @param {integer} strideB2 - stride of second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {Float64Array} ALPHA - output array for alpha values (length N)
* @param {integer} strideALPHA - stride for ALPHA
* @param {NonNegativeInteger} offsetALPHA - starting index for ALPHA
* @param {Float64Array} BETA - output array for beta values (length N)
* @param {integer} strideBETA - stride for BETA
* @param {NonNegativeInteger} offsetBETA - starting index for BETA
* @param {Complex128Array} U - M-by-M unitary matrix U
* @param {integer} strideU1 - stride of first dimension of U (complex elements)
* @param {integer} strideU2 - stride of second dimension of U (complex elements)
* @param {NonNegativeInteger} offsetU - starting index for U (complex elements)
* @param {Complex128Array} V - P-by-P unitary matrix V
* @param {integer} strideV1 - stride of first dimension of V (complex elements)
* @param {integer} strideV2 - stride of second dimension of V (complex elements)
* @param {NonNegativeInteger} offsetV - starting index for V (complex elements)
* @param {Complex128Array} Q - N-by-N unitary matrix Q
* @param {integer} strideQ1 - stride of first dimension of Q (complex elements)
* @param {integer} strideQ2 - stride of second dimension of Q (complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for Q (complex elements)
* @param {Complex128Array} WORK - complex workspace array of length at least max(1, lwork)
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
* @param {integer} lwork - workspace size; -1 for workspace query
* @param {Float64Array} RWORK - real workspace of length at least 2*N
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @param {Int32Array} IWORK - integer workspace of length N
* @param {integer} strideIWORK - stride for IWORK
* @param {NonNegativeInteger} offsetIWORK - starting index for IWORK
* @returns {integer} info - 0 for success, 1 if Jacobi procedure failed to converge
*/
function zggsvd3( jobu, jobv, jobq, M, N, p, K, l, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK, IWORK, strideIWORK, offsetIWORK ) {
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
	var oWi;
	var oWt;
	var Wv;
	var i;
	var j;

	// WORK is complex. zggsvp3 takes separate TAU (first N elements) and inner WORK (from N onward).
	oWt = offsetWORK;
	oWi = offsetWORK + ( N * strideWORK );

	// Reinterpret WORK as a Float64 view for reading/writing the optimal lwork scalar:
	Wv = reinterpret( WORK, 0 );

	// Workspace query: call zggsvp3 with lwork=-1.
	zggsvp3( jobu, jobv, jobq, M, p, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, 0, 0, K, l, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWORK, offsetIWORK, RWORK, strideRWORK, offsetRWORK, WORK, strideWORK, oWt, WORK, strideWORK, oWi, -1 );

	// After the query, zggsvp3 stores the optimal inner work size in the real part of WORK[0]:
	lwkopt = N + ( Wv[ offsetWORK * 2 ] | 0 );
	lwkopt = Math.max( 2 * N, lwkopt );
	lwkopt = Math.max( 1, lwkopt );
	Wv[ offsetWORK * 2 ] = lwkopt;
	Wv[ ( offsetWORK * 2 ) + 1 ] = 0.0;

	if ( lwork === -1 ) {
		return 0;
	}

	// Compute the Frobenius/one-norm of matrices A and B
	anorm = zlange( 'one-norm', M, N, A, strideA1, strideA2, offsetA, RWORK, strideRWORK, offsetRWORK );
	bnorm = zlange( 'one-norm', p, N, B, strideB1, strideB2, offsetB, RWORK, strideRWORK, offsetRWORK );

	// Get machine precision and set up threshold for determining the effective numerical rank of A and B.
	tola = Math.max( M, N ) * Math.max( anorm, UNFL ) * ULP;
	tolb = Math.max( p, N ) * Math.max( bnorm, UNFL ) * ULP;

	// Preprocessing
	zggsvp3( jobu, jobv, jobq, M, p, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, K, l, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWORK, offsetIWORK, RWORK, strideRWORK, offsetRWORK, WORK, strideWORK, oWt, WORK, strideWORK, oWi, lwork - N );

	kval = K[ 0 ];
	lval = l[ 0 ];

	// Compute the GSVD of the two upper "triangular" matrices
	ncycle = new Int32Array( 1 );
	info = ztgsja( jobu, jobv, jobq, M, p, N, kval, lval, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, WORK, strideWORK, offsetWORK, ncycle );

	// Sort the singular values and store the pivot indices in IWORK. Copy ALPHA to RWORK, then sort ALPHA in RWORK.
	dcopy( N, ALPHA, strideALPHA, offsetALPHA, RWORK, strideRWORK, offsetRWORK );
	ibnd = Math.min( lval, M - kval );
	for ( i = 0; i < ibnd; i++ ) {
		// Scan for the largest ALPHA(K+I)
		isub = i;
		smax = RWORK[ offsetRWORK + ( ( kval + i ) * strideRWORK ) ];
		for ( j = i + 1; j < ibnd; j++ ) {
			temp = RWORK[ offsetRWORK + ( ( kval + j ) * strideRWORK ) ];
			if ( temp > smax ) {
				isub = j;
				smax = temp;
			}
		}
		if ( isub === i ) {
			IWORK[ offsetIWORK + ( ( kval + i ) * strideIWORK ) ] = kval + i;
		} else {
			RWORK[ offsetRWORK + ( ( kval + isub ) * strideRWORK ) ] = RWORK[ offsetRWORK + ( ( kval + i ) * strideRWORK ) ];
			RWORK[ offsetRWORK + ( ( kval + i ) * strideRWORK ) ] = smax;
			IWORK[ offsetIWORK + ( ( kval + i ) * strideIWORK ) ] = kval + isub;
		}
	}

	Wv[ offsetWORK * 2 ] = lwkopt;
	Wv[ ( offsetWORK * 2 ) + 1 ] = 0.0;
	return info;
}


// EXPORTS //

export default zggsvd3;
