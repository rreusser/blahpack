/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import dgeqp3 from '../../dgeqp3/lib/base.js';
import dgeqr2 from '../../dgeqr2/lib/base.js';
import dgerq2 from '../../dgerq2/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlapmt from '../../dlapmt/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';
import dorg2r from '../../dorg2r/lib/base.js';
import dorm2r from '../../dorm2r/lib/base.js';
import dormr2 from '../../dormr2/lib/base.js';


// VARIABLES //

const NB = 32; // dgeqp3 block size (ILAENV(1) stand-in)


// FUNCTIONS //

/**
* Returns the minimum WORK length that `dgeqp3` accepts for an `m`-by-`n` matrix: `3*n+1`, or 0 for an empty matrix.
*
* @private
* @param {NonNegativeInteger} m - number of rows
* @param {NonNegativeInteger} n - number of columns
* @returns {NonNegativeInteger} workspace length
*/
function geqp3Min( m, n ) {
	return ( Math.min( m, n ) === 0 ) ? 0 : ( 3 * n ) + 1;
}

/**
* Returns the optimal WORK length of `dgeqp3` for an `m`-by-`n` matrix (its LWKOPT): `2*n + (n+1)*NB`, or 1 for an empty matrix.
*
* @private
* @param {NonNegativeInteger} m - number of rows
* @param {NonNegativeInteger} n - number of columns
* @returns {NonNegativeInteger} workspace length
*/
function geqp3Opt( m, n ) {
	return ( Math.min( m, n ) === 0 ) ? 1 : ( 2 * n ) + ( ( n + 1 ) * NB );
}

/**
* Returns the minimum WORK length (from `offsetWork`) that `dggsvp3` needs.
*
* The reference checks only `LWORK >= 1`, but hands its WORK and LWORK to `DGEQP3` (of the P-by-N matrix B and of the M-by-(N-L) matrix A), which rejects less than `3*N+1` when the matrix is not empty. Its unblocked callees check nothing but use WORK up to their declared extents, which depend on the ranks L and K found from the data, so this takes the largest that any data can reach (every other use is at most N):
*
* -   `dorg2r( P, P, ... )` for V (`jobv = 'compute-V'`): P.
* -   `dormr2( 'right', ..., M, N, L, ... )` on A when `0 < L < N` (possible when `P > 0` and `N > 1`): M.
* -   `dorg2r( M, M, ... )` for U, and `dorm2r( 'right', ..., M, M-K, ... )` on U when `L > 0` (`jobu = 'compute-U'`): M.
*
* At the zero-data ranks (L = K = 0) no callee of the reference rejects an LWORK of `3*N+1`, but with data of full rank its unchecked callees write up to these extents.
*
* @private
* @param {string} jobu - `'compute-U'` or `'none'`
* @param {string} jobv - `'compute-V'` or `'none'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} p - number of rows of B
* @param {NonNegativeInteger} N - number of columns of A and B
* @returns {NonNegativeInteger} minimum workspace length
*/
function computeWorkSize( jobu, jobv, M, p, N ) {
	let w;
	if ( N === 0 ) {
		return 0;
	}
	w = Math.max( 1, geqp3Min( p, N ), geqp3Min( M, N ) );
	if ( jobv === 'compute-V' ) {
		// DORG2R( P, P, ... ) for V applies its reflectors to at most P-1 columns.
		w = Math.max( w, p - 1 );
	}
	// Worst case over the ranks K and L the data gives: DORMR2/DORM2R from the right on A (0 < L < N) and on U (L > 0) use M; with P = 0, L = 0 and only DORG2R for U is left, which uses M-1.
	if ( p > 0 && ( N > 1 || jobu === 'compute-U' ) ) {
		w = Math.max( w, M );
	} else if ( jobu === 'compute-U' ) {
		w = Math.max( w, M - 1 );
	}
	return w;
}

/**
* Returns the optimal WORK length for `dggsvp3`: the reference's LWKOPT, with the `dgeqp3` optimum `2*N + (N+1)*NB` (`NB = 32`).
*
* @private
* @param {string} jobv - `'compute-V'` or `'none'`
* @param {string} jobq - `'compute-Q'` or `'none'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} p - number of rows of B
* @param {NonNegativeInteger} N - number of columns of A and B
* @returns {NonNegativeInteger} optimal workspace length
*/
function computeOptimalWorkSize( jobv, jobq, M, p, N ) {
	let lwkopt = geqp3Opt( p, N );
	if ( jobv === 'compute-V' ) {
		lwkopt = Math.max( lwkopt, p );
	}
	lwkopt = Math.max( lwkopt, Math.min( N, p ), M );
	if ( jobq === 'compute-Q' ) {
		lwkopt = Math.max( lwkopt, N );
	}
	lwkopt = Math.max( lwkopt, geqp3Opt( M, N ) );
	return Math.max( 1, lwkopt, computeWorkSize( 'compute-U', jobv, M, p, N ) );
}


// MAIN //

/**
* Computes orthogonal matrices U, V, and Q that reduce a matrix pair to triangular form for the generalized SVD.
*
*                  N-K-L  K    L
*   U^T_A_Q =   K ( 0    A12  A13 )  if M-K-L >= 0;
*               L ( 0     0   A23 )
*           M-K-L ( 0     0    0  )
*
*                N-K-L  K    L
*       =     K ( 0    A12  A13 )  if M-K-L < 0;
*           M-K ( 0     0   A23 )
*
*                N-K-L  K    L
*   V^T_B_Q = L ( 0     0   B13 )
*           P-L ( 0     0    0  )
*
* This is the preprocessing step for computing the Generalized
* Singular Value Decomposition (GSVD).
*
* @private
* @param {('compute-U'|'none')} jobu - `'compute-U'` or `'none'`
* @param {('compute-V'|'none')} jobv - `'compute-V'` or `'none'`
* @param {('compute-Q'|'none')} jobq - `'compute-Q'` or `'none'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} p - number of rows of B
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {Float64Array} A - M-by-N matrix A (overwritten on exit)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - P-by-N matrix B (overwritten on exit)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {number} tola - tolerance for A
* @param {number} tolb - tolerance for B
* @param {Int32Array} K - output array; K[0] set to the numerical rank dimension
* @param {Int32Array} l - output array; l[0] set to the numerical rank dimension
* @param {Float64Array} U - M-by-M orthogonal matrix (if jobu=`'compute-U'`)
* @param {integer} strideU1 - stride of the first dimension of U
* @param {integer} strideU2 - stride of the second dimension of U
* @param {NonNegativeInteger} offsetU - starting index for U
* @param {Float64Array} V - P-by-P orthogonal matrix (if jobv=`'compute-V'`)
* @param {integer} strideV1 - stride of the first dimension of V
* @param {integer} strideV2 - stride of the second dimension of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {Float64Array} Q - N-by-N orthogonal matrix (if jobq=`'compute-Q'`)
* @param {integer} strideQ1 - stride of the first dimension of Q
* @param {integer} strideQ2 - stride of the second dimension of Q
* @param {NonNegativeInteger} offsetQ - starting index for Q
* @param {Int32Array} IWORK - workspace array of length N
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @param {Float64Array} TAU - workspace array of length N
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} WORK - workspace of length at least `max(1, 3*N+1, P if jobv = 'compute-V', M if jobu = 'compute-U' or (P > 0 and N > 1))` when `N > 0` and `M + P > 0`, 1 when `M = P = 0`, 0 when `N = 0` (the reference checks only `LWORK >= 1`; `DGEQP3` rejects less than `3*N+1`, and the unblocked orthogonal-factor callees write up to M or P for data of full rank); for optimum performance the reference's LWKOPT, `max(2*N + (N+1)*NB, M, min(N,P), P if jobv = 'compute-V', N if jobq = 'compute-Q')` (`NB = 32`), which enables `dgeqp3`'s blocked path
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info - 0 if successful
*/
function dggsvp3( jobu, jobv, jobq, M, p, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, K, l, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWork, offsetIWork, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len
	let kval, lval, i, j;

	// Caller owns the workspace; derive the available length from the provided array.
	const lwork = Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) );

	const wantu = ( jobu === 'compute-U' );
	const wantv = ( jobv === 'compute-V' );
	const wantq = ( jobq === 'compute-Q' );
	const forwrd = true;

	// Workspace query: as the reference, return LWKOPT and do no work (otherwise the query would run the preprocessing destructively on A/B/U/V/Q).
	if ( lwork === -1 ) {
		WORK[ offsetWork ] = computeOptimalWorkSize( jobv, jobq, M, p, N );
		return 0;
	}

	// Initialize IWORK to zeros (means all columns are "free" for dgeqp3)
	const oIW = offsetIWork;
	for ( i = 0; i < N; i++ ) {
		IWORK[ oIW + (i * strideIWork) ] = 0;
	}

	// QR with column pivoting of B: B*P = V*( S11 S12 )
	//                                       (  0   0  )
	dgeqp3( p, N, B, strideB1, strideB2, offsetB, IWORK, strideIWork, offsetIWork, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );

	// Convert IWORK from 1-based (dgeqp3 output) to 0-based (dlapmt input)
	for ( i = 0; i < N; i++ ) {
		IWORK[ oIW + (i * strideIWork) ] -= 1;
	}

	// Apply column permutation to A: A := A*P
	dlapmt( forwrd, M, N, A, strideA1, strideA2, offsetA, IWORK, strideIWork, offsetIWork );

	// Determine the effective numerical rank of the matrix B: L
	lval = 0;
	for ( i = 0; i < Math.min( p, N ); i++ ) {
		if ( Math.abs( B[ offsetB + (i * strideB1) + (i * strideB2) ] ) > tolb ) {
			lval += 1;
		}
	}

	if ( wantv ) {
		// Copy the lower triangular part of B into V and generate V
		dlaset( 'all', p, p, 0.0, 0.0, V, strideV1, strideV2, offsetV );
		if ( p > 1 ) {
			dlacpy( 'lower', p - 1, N, B, strideB1, strideB2, offsetB + strideB1, V, strideV1, strideV2, offsetV + strideV1 );
		}
		dorg2r( p, p, Math.min( p, N ), V, strideV1, strideV2, offsetV, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
	}

	// Clean up B: zero out below diagonal in first L columns
	for ( j = 0; j < lval - 1; j++ ) {
		for ( i = j + 1; i < lval; i++ ) {
			B[ offsetB + (i * strideB1) + (j * strideB2) ] = 0.0;
		}
	}
	if ( p > lval ) {
		dlaset( 'all', p - lval, N, 0.0, 0.0, B, strideB1, strideB2, offsetB + (lval * strideB1) );
	}

	if ( wantq ) {
		// Initialize Q to identity and apply column permutation
		dlaset( 'all', N, N, 0.0, 1.0, Q, strideQ1, strideQ2, offsetQ );
		dlapmt( forwrd, N, N, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWork, offsetIWork );
	}

	if ( p >= lval && N !== lval ) {
		// RQ factorization of ( S11 S12 ): ( S11 S12 ) = ( 0 S12 )*Z
		dgerq2( lval, N, B, strideB1, strideB2, offsetB, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );

		// Update A = A*Z^T
		dormr2( 'right', 'transpose', M, N, lval, B, strideB1, strideB2, offsetB, TAU, strideTAU, offsetTAU, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork );

		if ( wantq ) {
			// Update Q = Q*Z^T
			dormr2( 'right', 'transpose', N, N, lval, B, strideB1, strideB2, offsetB, TAU, strideTAU, offsetTAU, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork );
		}

		// Clean up B
		dlaset( 'all', lval, N - lval, 0.0, 0.0, B, strideB1, strideB2, offsetB );
		for ( j = N - lval; j < N; j++ ) {
			for ( i = j - N + lval + 1; i < lval; i++ ) {
				B[ offsetB + (i * strideB1) + (j * strideB2) ] = 0.0;
			}
		}
	}

	// Second QR with column pivoting: A( :, 1:N-L ) = U*( D11 D12 )
	//                                                    (  0  D22 )
	// Initialize IWORK for second dgeqp3
	for ( i = 0; i < N - lval; i++ ) {
		IWORK[ oIW + (i * strideIWork) ] = 0;
	}
	dgeqp3( M, N - lval, A, strideA1, strideA2, offsetA, IWORK, strideIWork, offsetIWork, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );

	// Convert IWORK from 1-based to 0-based again
	for ( i = 0; i < N - lval; i++ ) {
		IWORK[ oIW + (i * strideIWork) ] -= 1;
	}

	// Determine the effective numerical rank of A(:,1:N-L): K
	kval = 0;
	for ( i = 0; i < Math.min( M, N - lval ); i++ ) {
		if ( Math.abs( A[ offsetA + (i * strideA1) + (i * strideA2) ] ) > tola ) {
			kval += 1;
		}
	}

	// Update A(:,N-L+1:N) by Q^T from left
	dorm2r( 'left', 'transpose', M, lval, Math.min( M, N - lval ), A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, A, strideA1, strideA2, offsetA + ((N - lval) * strideA2), WORK, strideWork, offsetWork );

	if ( wantu ) {
		// Copy lower triangular part of A into U and generate U
		dlaset( 'all', M, M, 0.0, 0.0, U, strideU1, strideU2, offsetU );
		if ( M > 1 ) {
			dlacpy( 'lower', M - 1, N - lval, A, strideA1, strideA2, offsetA + strideA1, U, strideU1, strideU2, offsetU + strideU1 );
		}
		dorg2r( M, M, Math.min( M, N - lval ), U, strideU1, strideU2, offsetU, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
	}

	if ( wantq ) {
		// Update Q: apply column permutation to first N-L columns
		dlapmt( forwrd, N, N - lval, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWork, offsetIWork );
	}

	// Clean up A: zero out below diagonal in first K columns and below K+L rows
	for ( j = 0; j < kval - 1; j++ ) {
		for ( i = j + 1; i < kval; i++ ) {
			A[ offsetA + (i * strideA1) + (j * strideA2) ] = 0.0;
		}
	}
	if ( M > kval ) {
		dlaset( 'all', M - kval, N - lval, 0.0, 0.0, A, strideA1, strideA2, offsetA + (kval * strideA1) );
	}

	if ( N - lval > kval ) {
		// RQ factorization of A( 1:K, 1:N-L )
		dgerq2( kval, N - lval, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );

		if ( wantq ) {
			// Update Q: Q = Q * Z^T
			dormr2( 'right', 'transpose', N, N - lval, kval, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, Q, strideQ1, strideQ2, offsetQ, WORK, strideWork, offsetWork );
		}

		// Clean up A
		dlaset( 'all', kval, N - lval - kval, 0.0, 0.0, A, strideA1, strideA2, offsetA );
		for ( j = N - lval - kval; j < N - lval; j++ ) {
			for ( i = j - N + lval + kval + 1; i < kval; i++ ) {
				A[ offsetA + (i * strideA1) + (j * strideA2) ] = 0.0;
			}
		}
	}

	if ( M > kval ) {
		// QR factorization of A( K+1:M, N-L+1:N )
		dgeqr2( M - kval, lval, A, strideA1, strideA2, offsetA + (kval * strideA1) + ((N - lval) * strideA2), TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );

		if ( wantu ) {
			// U = U * Q
			dorm2r( 'right', 'no-transpose', M, M - kval, Math.min( M - kval, lval ), A, strideA1, strideA2, offsetA + (kval * strideA1) + ((N - lval) * strideA2), TAU, strideTAU, offsetTAU, U, strideU1, strideU2, offsetU + (kval * strideU2), WORK, strideWork, offsetWork );
		}

		// Clean up A below the (K+L) superdiagonal
		for ( j = N - lval; j < N; j++ ) {
			for ( i = j - N + kval + lval + 1; i < M; i++ ) {
				A[ offsetA + (i * strideA1) + (j * strideA2) ] = 0.0;
			}
		}
	}

	// Set output values
	K[ 0 ] = kval;
	l[ 0 ] = lval;

	return 0;
}


// EXPORTS //

export default dggsvp3;
export { computeWorkSize, computeOptimalWorkSize };
