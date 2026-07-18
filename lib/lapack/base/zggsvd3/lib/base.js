/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import Int32Array from '@stdlib/array/int32/lib/index.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import zlange from '../../zlange/lib/base.js';
import zggsvp3 from '../../zggsvp3/lib/base.js';
import ztgsja from '../../ztgsja/lib/base.js';


// VARIABLES //

const ULP = dlamch( 'Precision' );
const UNFL = dlamch( 'Safe Minimum' );


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
* @param {Complex128Array} WORK - caller-owned complex workspace (see the ndarray wrapper's WORK-size assertion for the required length)
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace of length at least 2*N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @param {Int32Array} IWORK - integer workspace of length N
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @returns {integer} info - 0 for success, 1 if Jacobi procedure failed to converge
*/
function zggsvd3( jobu, jobv, jobq, M, N, p, K, l, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, IWORK, strideIWork, offsetIWork ) {
	let isub, smax, temp, i, j;

	// WORK is complex. zggsvp3 takes separate TAU (first N elements) and inner WORK (from N onward).
	const oWt = offsetWork;
	const oWi = offsetWork + ( N * strideWork );


	// Compute the Frobenius/one-norm of matrices A and B
	const anorm = zlange( 'one-norm', M, N, A, strideA1, strideA2, offsetA, RWORK, strideRWork, offsetRWork );
	const bnorm = zlange( 'one-norm', p, N, B, strideB1, strideB2, offsetB, RWORK, strideRWork, offsetRWork );

	// Get machine precision and set up threshold for determining the effective numerical rank of A and B.
	const tola = Math.max( M, N ) * Math.max( anorm, UNFL ) * ULP;
	const tolb = Math.max( p, N ) * Math.max( bnorm, UNFL ) * ULP;

	// Preprocessing
	zggsvp3( jobu, jobv, jobq, M, p, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, K, l, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWork, offsetIWork, RWORK, strideRWork, offsetRWork, WORK, strideWork, oWt, WORK, strideWork, oWi );

	const kval = K[ 0 ];
	const lval = l[ 0 ];

	// Compute the GSVD of the two upper "triangular" matrices
	const ncycle = new Int32Array( 1 );
	const info = ztgsja( jobu, jobv, jobq, M, p, N, kval, lval, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork, ncycle );

	// Sort the singular values and store the pivot indices in IWORK. Copy ALPHA to RWORK, then sort ALPHA in RWORK.
	dcopy( N, ALPHA, strideALPHA, offsetALPHA, RWORK, strideRWork, offsetRWork );
	const ibnd = Math.min( lval, M - kval );
	for ( i = 0; i < ibnd; i++ ) {
		// Scan for the largest ALPHA(K+I)
		isub = i;
		smax = RWORK[ offsetRWork + ( ( kval + i ) * strideRWork ) ];
		for ( j = i + 1; j < ibnd; j++ ) {
			temp = RWORK[ offsetRWork + ( ( kval + j ) * strideRWork ) ];
			if ( temp > smax ) {
				isub = j;
				smax = temp;
			}
		}
		if ( isub === i ) {
			IWORK[ offsetIWork + ( ( kval + i ) * strideIWork ) ] = kval + i;
		} else {
			RWORK[ offsetRWork + ( ( kval + isub ) * strideRWork ) ] = RWORK[ offsetRWork + ( ( kval + i ) * strideRWork ) ];
			RWORK[ offsetRWork + ( ( kval + i ) * strideRWork ) ] = smax;
			IWORK[ offsetIWork + ( ( kval + i ) * strideIWork ) ] = kval + isub;
		}
	}

	return info;
}


// EXPORTS //

export default zggsvd3;
