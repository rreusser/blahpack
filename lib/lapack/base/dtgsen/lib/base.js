/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, no-mixed-operators */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtgexc from '../../dtgexc/lib/base.js';
import dtgsyl from '../../dtgsyl/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlassq from '../../dlassq/lib/base.js';
import dlag2 from '../../dlag2/lib/base.js';
import dlacn2 from '../../dlacn2/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var IDIFJB = 3;


// MAIN //

/**
* Reorders the generalized real Schur decomposition of a real matrix pair (A,B).
*
* ## Notes
*
* -   (A,B) must be in generalized real Schur canonical form.
* -   SELECT is a boolean array selecting which eigenvalues to reorder.
* -   `M[0]` on return is the dimension of the selected cluster.
*
* @private
* @param {integer} ijob - job selector (0-5)
* @param {boolean} wantq - whether to update the matrix Q
* @param {boolean} wantz - whether to update the matrix Z
* @param {Uint8Array|Array} SELECT - boolean selection array of length N
* @param {integer} strideSELECT - stride for SELECT
* @param {NonNegativeInteger} offsetSELECT - starting index for SELECT
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} A - N-by-N upper quasi-triangular matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - N-by-N upper triangular matrix
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} ALPHAR - output: real parts of generalized eigenvalues
* @param {integer} strideALPHAR - stride for ALPHAR
* @param {NonNegativeInteger} offsetALPHAR - starting index for ALPHAR
* @param {Float64Array} ALPHAI - output: imaginary parts of generalized eigenvalues
* @param {integer} strideALPHAI - stride for ALPHAI
* @param {NonNegativeInteger} offsetALPHAI - starting index for ALPHAI
* @param {Float64Array} BETA - output: denominators of generalized eigenvalues
* @param {integer} strideBETA - stride for BETA
* @param {NonNegativeInteger} offsetBETA - starting index for BETA
* @param {Float64Array} Q - N-by-N orthogonal matrix (updated if wantq)
* @param {integer} strideQ1 - stride of the first dimension of Q
* @param {integer} strideQ2 - stride of the second dimension of Q
* @param {NonNegativeInteger} offsetQ - starting index for Q
* @param {Float64Array} Z - N-by-N orthogonal matrix (updated if wantz)
* @param {integer} strideZ1 - stride of the first dimension of Z
* @param {integer} strideZ2 - stride of the second dimension of Z
* @param {NonNegativeInteger} offsetZ - starting index for Z
* @param {Int32Array} M - output: M[0] = dimension of selected cluster
* @param {Float64Array} pl - output: pl[0] = lower bound on PL
* @param {Float64Array} pr - output: pr[0] = lower bound on PR
* @param {Float64Array} DIF - output array of length 2
* @param {integer} strideDIF - stride for DIF
* @param {NonNegativeInteger} offsetDIF - starting index for DIF
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {integer} lwork - workspace size
* @param {Int32Array} IWORK - integer workspace array
* @param {integer} strideIWORK - stride for IWORK
* @param {NonNegativeInteger} offsetIWORK - starting index for IWORK
* @param {integer} liwork - integer workspace size
* @returns {integer} info (0 = success, 1 = dtgexc reordering failed)
*/
function dtgsen( ijob, wantq, wantz, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, M, pl, pr, DIF, strideDIF, offsetDIF, WORK, strideWORK, offsetWORK, lwork, IWORK, strideIWORK, offsetIWORK, liwork ) { // eslint-disable-line max-len, max-params
	var rdscal;
	var dscale;
	var smlnum;
	var wantd1;
	var wantd2;
	var lquery;
	var liwmin;
	var result;
	var lwmin;
	var wantd;
	var wantp;
	var isave;
	var dsum;
	var swap;
	var pair;
	var ierr;
	var info;
	var kase;
	var est;
	var eps;
	var mn2;
	var ijb;
	var n1;
	var n2;
	var ks;
	var kk;
	var sa;
	var sb;
	var k;
	var i;

	info = 0;
	lquery = ( lwork === -1 || liwork === -1 );

	if ( ijob < 0 || ijob > 5 ) {
		return -1;
	}
	if ( N < 0 ) {
		return -5;
	}

	eps = dlamch( 'precision' );
	smlnum = dlamch( 'safe minimum' ) / eps;
	ierr = 0;

	wantp = ( ijob === 1 || ijob >= 4 );
	wantd1 = ( ijob === 2 || ijob === 4 );
	wantd2 = ( ijob === 3 || ijob === 5 );
	wantd = wantd1 || wantd2;

	// Count selected eigenvalues
	M[ 0 ] = 0;
	pair = false;
	if ( !lquery || ijob !== 0 ) {
		for ( k = 0; k < N; k++ ) {
			if ( pair ) {
				pair = false;
			} else if ( k < N - 1 ) {
				if ( A[ offsetA + ( k + 1 ) * strideA1 + k * strideA2 ] === ZERO ) {
					if ( SELECT[ offsetSELECT + k * strideSELECT ] ) {
						M[ 0 ] += 1;
					}
				} else {
					pair = true;
					if ( SELECT[ offsetSELECT + k * strideSELECT ] || SELECT[ offsetSELECT + ( k + 1 ) * strideSELECT ] ) {
						M[ 0 ] += 2;
					}
				}
			} else if ( SELECT[ offsetSELECT + ( N - 1 ) * strideSELECT ] ) {
				M[ 0 ] += 1;
			}
		}
	}

	if ( ijob === 1 || ijob === 2 || ijob === 4 ) {
		lwmin = Math.max( 1, 4 * N + 16, 2 * M[ 0 ] * ( N - M[ 0 ] ) );
		liwmin = Math.max( 1, N + 6 );
	} else if ( ijob === 3 || ijob === 5 ) {
		lwmin = Math.max( 1, 4 * N + 16, 4 * M[ 0 ] * ( N - M[ 0 ] ) );
		liwmin = Math.max( 1, 2 * M[ 0 ] * ( N - M[ 0 ] ), N + 6 );
	} else {
		lwmin = Math.max( 1, 4 * N + 16 );
		liwmin = 1;
	}

	WORK[ offsetWORK ] = lwmin;
	IWORK[ offsetIWORK ] = liwmin;

	if ( lwork < lwmin && !lquery ) {
		return -22;
	}
	if ( liwork < liwmin && !lquery ) {
		return -24;
	}

	if ( lquery ) {
		return info;
	}

	// Quick return if M === N or M === 0
	if ( M[ 0 ] === N || M[ 0 ] === 0 ) {
		if ( wantp ) {
			pl[ 0 ] = ONE;
			pr[ 0 ] = ONE;
		}
		if ( wantd ) {
			dscale = ZERO;
			dsum = ONE;
			for ( i = 0; i < N; i++ ) {
				result = dlassq( N, A, strideA1, offsetA + i * strideA2, dscale, dsum );
				dscale = result.scl;
				dsum = result.sumsq;
				result = dlassq( N, B, strideB1, offsetB + i * strideB2, dscale, dsum );
				dscale = result.scl;
				dsum = result.sumsq;
			}
			DIF[ offsetDIF ] = dscale * Math.sqrt( dsum );
			DIF[ offsetDIF + strideDIF ] = DIF[ offsetDIF ];
		}
		computeEigenvalues( N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, wantq, smlnum * eps, WORK, offsetWORK );
		WORK[ offsetWORK ] = lwmin;
		IWORK[ offsetIWORK ] = liwmin;
		return info;
	}

	// Reorder eigenvalues
	ks = 0;
	pair = false;
	for ( k = 0; k < N; k++ ) {
		if ( pair ) {
			pair = false;
		} else {
			swap = !!SELECT[ offsetSELECT + k * strideSELECT ];
			if ( k < N - 1 ) {
				if ( A[ offsetA + ( k + 1 ) * strideA1 + k * strideA2 ] !== ZERO ) {
					pair = true;
					swap = swap || !!SELECT[ offsetSELECT + ( k + 1 ) * strideSELECT ];
				}
			}

			if ( swap ) {
				ks += 1;
				kk = k;
				if ( k !== ks - 1 ) {
					// Dtgexc uses 0-based ifst/ilst
					result = dtgexc( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, kk, ks - 1, WORK, strideWORK, offsetWORK, lwork );
					ierr = result.info;
				}

				if ( ierr > 0 ) {
					// Reordering failed
					info = 1;
					if ( wantp ) {
						pl[ 0 ] = ZERO;
						pr[ 0 ] = ZERO;
					}
					if ( wantd ) {
						DIF[ offsetDIF ] = ZERO;
						DIF[ offsetDIF + strideDIF ] = ZERO;
					}
					computeEigenvalues( N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, wantq, smlnum * eps, WORK, offsetWORK );
					WORK[ offsetWORK ] = lwmin;
					IWORK[ offsetIWORK ] = liwmin;
					return info;
				}

				if ( pair ) {
					ks += 1;
				}
			}
		}
	}

	if ( wantp ) {
		// Compute reciprocal condition numbers for the cluster
		n1 = M[ 0 ];
		n2 = N - M[ 0 ];
		i = n1;
		ijb = 0;

		// Copy upper-right block of A into WORK
		dlacpy( 'full', n1, n2, A, strideA1, strideA2, offsetA + i * strideA2, WORK, 1, n1, offsetWORK );

		// Copy upper-right block of B into WORK(n1*n2+1)
		dlacpy( 'full', n1, n2, B, strideB1, strideB2, offsetB + i * strideB2, WORK, 1, n1, offsetWORK + n1 * n2 );

		sa = new Float64Array( 1 );
		sb = new Float64Array( 1 );

		dtgsyl( 'no-transpose', ijb, n1, n2, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + i * strideA1 + i * strideA2, WORK, 1, n1, offsetWORK, B, strideB1, strideB2, offsetB, B, strideB1, strideB2, offsetB + i * strideB1 + i * strideB2, WORK, 1, n1, offsetWORK + n1 * n2, sa, sb, WORK, 1, offsetWORK + 2 * n1 * n2, lwork - 2 * n1 * n2, IWORK, strideIWORK, offsetIWORK );

		// Compute PL
		rdscal = ZERO;
		dsum = ONE;
		result = dlassq( n1 * n2, WORK, 1, offsetWORK, rdscal, dsum );
		rdscal = result.scl;
		dsum = result.sumsq;
		pl[ 0 ] = rdscal * Math.sqrt( dsum );
		if ( pl[ 0 ] === ZERO ) {
			pl[ 0 ] = ONE;
		} else {
			pl[ 0 ] = sa[ 0 ] / ( Math.sqrt( sa[ 0 ] * sa[ 0 ] / pl[ 0 ] + pl[ 0 ] ) * Math.sqrt( pl[ 0 ] ) );
		}

		// Compute PR
		rdscal = ZERO;
		dsum = ONE;
		result = dlassq( n1 * n2, WORK, 1, offsetWORK + n1 * n2, rdscal, dsum );
		rdscal = result.scl;
		dsum = result.sumsq;
		pr[ 0 ] = rdscal * Math.sqrt( dsum );
		if ( pr[ 0 ] === ZERO ) {
			pr[ 0 ] = ONE;
		} else {
			pr[ 0 ] = sa[ 0 ] / ( Math.sqrt( sa[ 0 ] * sa[ 0 ] / pr[ 0 ] + pr[ 0 ] ) * Math.sqrt( pr[ 0 ] ) );
		}
	}

	if ( wantd ) {
		n1 = M[ 0 ];
		n2 = N - M[ 0 ];
		i = n1;

		if ( wantd1 ) {
			// Compute DIF(1) and DIF(2) using Frobenius norm (IDIFJB)
			ijb = IDIFJB;
			sa = new Float64Array( 1 );
			sb = new Float64Array( 1 );

			// DIF(1): forward problem
			dtgsyl( 'no-transpose', ijb, n1, n2, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + i * strideA1 + i * strideA2, WORK, 1, n1, offsetWORK, B, strideB1, strideB2, offsetB, B, strideB1, strideB2, offsetB + i * strideB1 + i * strideB2, WORK, 1, n1, offsetWORK + n1 * n2, sa, sb, WORK, 1, offsetWORK + 2 * n1 * n2, lwork - 2 * n1 * n2, IWORK, strideIWORK, offsetIWORK );
			DIF[ offsetDIF ] = sb[ 0 ];

			// DIF(2): reversed problem
			dtgsyl( 'no-transpose', ijb, n2, n1, A, strideA1, strideA2, offsetA + i * strideA1 + i * strideA2, A, strideA1, strideA2, offsetA, WORK, 1, n2, offsetWORK, B, strideB1, strideB2, offsetB + i * strideB1 + i * strideB2, B, strideB1, strideB2, offsetB, WORK, 1, n2, offsetWORK + n1 * n2, sa, sb, WORK, 1, offsetWORK + 2 * n1 * n2, lwork - 2 * n1 * n2, IWORK, strideIWORK, offsetIWORK );
			DIF[ offsetDIF + strideDIF ] = sb[ 0 ];
		} else {
			// Compute DIF(1) and DIF(2) using one-norm estimation (dlacn2)
			ijb = 0;
			mn2 = 2 * n1 * n2;
			sa = new Float64Array( 1 );
			sb = new Float64Array( 1 );

			// Estimate DIF(1)
			kase = new Int32Array( 1 );
			kase[ 0 ] = 0;
			est = new Float64Array( 1 );
			est[ 0 ] = ZERO;
			isave = new Int32Array( 3 );

			while ( true ) { // eslint-disable-line no-constant-condition
				dlacn2( mn2, WORK, 1, offsetWORK + mn2, WORK, 1, offsetWORK, IWORK, strideIWORK, offsetIWORK, est, kase, isave, 1, 0 );
				if ( kase[ 0 ] === 0 ) {
					break;
				}
				if ( kase[ 0 ] === 1 ) {
					// Forward: solve (A11, B11) * X - X * (A22, B22) = WORK
					dtgsyl( 'no-transpose', ijb, n1, n2, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + i * strideA1 + i * strideA2, WORK, 1, n1, offsetWORK, B, strideB1, strideB2, offsetB, B, strideB1, strideB2, offsetB + i * strideB1 + i * strideB2, WORK, 1, n1, offsetWORK + n1 * n2, sa, sb, WORK, 1, offsetWORK + 2 * n1 * n2, lwork - 2 * n1 * n2, IWORK, strideIWORK, offsetIWORK );
				} else {
					// Transpose: solve (A11, B11)^T * X - X * (A22, B22)^T = WORK
					dtgsyl( 'transpose', ijb, n1, n2, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + i * strideA1 + i * strideA2, WORK, 1, n1, offsetWORK, B, strideB1, strideB2, offsetB, B, strideB1, strideB2, offsetB + i * strideB1 + i * strideB2, WORK, 1, n1, offsetWORK + n1 * n2, sa, sb, WORK, 1, offsetWORK + 2 * n1 * n2, lwork - 2 * n1 * n2, IWORK, strideIWORK, offsetIWORK );
				}
			}
			DIF[ offsetDIF ] = sa[ 0 ] / est[ 0 ];

			// Estimate DIF(2)
			kase[ 0 ] = 0;
			est[ 0 ] = ZERO;
			isave[ 0 ] = 0;
			isave[ 1 ] = 0;
			isave[ 2 ] = 0;

			while ( true ) { // eslint-disable-line no-constant-condition
				dlacn2( mn2, WORK, 1, offsetWORK + mn2, WORK, 1, offsetWORK, IWORK, strideIWORK, offsetIWORK, est, kase, isave, 1, 0 );
				if ( kase[ 0 ] === 0 ) {
					break;
				}
				if ( kase[ 0 ] === 1 ) {
					// Forward: solve (A22, B22) * X - X * (A11, B11) = WORK
					dtgsyl( 'no-transpose', ijb, n2, n1, A, strideA1, strideA2, offsetA + i * strideA1 + i * strideA2, A, strideA1, strideA2, offsetA, WORK, 1, n2, offsetWORK, B, strideB1, strideB2, offsetB + i * strideB1 + i * strideB2, B, strideB1, strideB2, offsetB, WORK, 1, n2, offsetWORK + n1 * n2, sa, sb, WORK, 1, offsetWORK + 2 * n1 * n2, lwork - 2 * n1 * n2, IWORK, strideIWORK, offsetIWORK );
				} else {
					// Transpose: solve (A22, B22)^T * X - X * (A11, B11)^T = WORK
					dtgsyl( 'transpose', ijb, n2, n1, A, strideA1, strideA2, offsetA + i * strideA1 + i * strideA2, A, strideA1, strideA2, offsetA, WORK, 1, n2, offsetWORK, B, strideB1, strideB2, offsetB + i * strideB1 + i * strideB2, B, strideB1, strideB2, offsetB, WORK, 1, n2, offsetWORK + n1 * n2, sa, sb, WORK, 1, offsetWORK + 2 * n1 * n2, lwork - 2 * n1 * n2, IWORK, strideIWORK, offsetIWORK );
				}
			}
			DIF[ offsetDIF + strideDIF ] = sa[ 0 ] / est[ 0 ];
		}
	}

	// Compute generalized eigenvalues
	computeEigenvalues( N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, wantq, smlnum * eps, WORK, offsetWORK );

	WORK[ offsetWORK ] = lwmin;
	IWORK[ offsetIWORK ] = liwmin;

	return info;
}

/**
* Computes generalized eigenvalues from the diagonal blocks of the.
* generalized Schur form (A, B).
*
* For 2-by-2 diagonal blocks, uses dlag2 to extract the eigenvalues.
* For 1-by-1 blocks, flips the sign of the row in A, B, and Q if
* the corresponding diagonal entry of B is negative.
*
* @private
* @param {NonNegativeInteger} N - matrix order
* @param {Float64Array} A - upper quasi-triangular matrix
* @param {integer} strideA1 - row stride for A
* @param {integer} strideA2 - column stride for A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - upper triangular matrix
* @param {integer} strideB1 - row stride for B
* @param {integer} strideB2 - column stride for B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} Q - orthogonal matrix
* @param {integer} strideQ1 - row stride for Q
* @param {integer} strideQ2 - column stride for Q
* @param {NonNegativeInteger} offsetQ - starting index for Q
* @param {Float64Array} ALPHAR - output: real parts
* @param {integer} strideALPHAR - stride for ALPHAR
* @param {NonNegativeInteger} offsetALPHAR - starting index for ALPHAR
* @param {Float64Array} ALPHAI - output: imaginary parts
* @param {integer} strideALPHAI - stride for ALPHAI
* @param {NonNegativeInteger} offsetALPHAI - starting index for ALPHAI
* @param {Float64Array} BETA - output: denominators
* @param {integer} strideBETA - stride for BETA
* @param {NonNegativeInteger} offsetBETA - starting index for BETA
* @param {boolean} wantq - whether Q is being maintained
* @param {number} safmin - safe minimum times machine epsilon
* @param {Float64Array} WORK - workspace (at least 8 elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
*/
function computeEigenvalues( N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, wantq, safmin, WORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	var result;
	var pair;
	var k;
	var j;

	pair = false;
	for ( k = 0; k < N; k++ ) {
		if ( pair ) {
			pair = false;
		} else if ( k < N - 1 && A[ offsetA + ( k + 1 ) * strideA1 + k * strideA2 ] !== ZERO ) {
			pair = true;

			// 2-by-2 block: extract into WORK as 2-by-2 column-major then call dlag2
			WORK[ offsetWORK ] = A[ offsetA + k * strideA1 + k * strideA2 ];
			WORK[ offsetWORK + 1 ] = A[ offsetA + ( k + 1 ) * strideA1 + k * strideA2 ];
			WORK[ offsetWORK + 2 ] = A[ offsetA + k * strideA1 + ( k + 1 ) * strideA2 ];
			WORK[ offsetWORK + 3 ] = A[ offsetA + ( k + 1 ) * strideA1 + ( k + 1 ) * strideA2 ];
			WORK[ offsetWORK + 4 ] = B[ offsetB + k * strideB1 + k * strideB2 ];
			WORK[ offsetWORK + 5 ] = B[ offsetB + ( k + 1 ) * strideB1 + k * strideB2 ];
			WORK[ offsetWORK + 6 ] = B[ offsetB + k * strideB1 + ( k + 1 ) * strideB2 ];
			WORK[ offsetWORK + 7 ] = B[ offsetB + ( k + 1 ) * strideB1 + ( k + 1 ) * strideB2 ];

			// dlag2( A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, safmin )

			// Using column-major 2x2 layout: stride1=1, stride2=2
			result = dlag2( WORK, 1, 2, offsetWORK, WORK, 1, 2, offsetWORK + 4, safmin );

			BETA[ offsetBETA + k * strideBETA ] = result.scale1;
			BETA[ offsetBETA + ( k + 1 ) * strideBETA ] = result.scale2;
			ALPHAR[ offsetALPHAR + k * strideALPHAR ] = result.wr1;
			ALPHAR[ offsetALPHAR + ( k + 1 ) * strideALPHAR ] = result.wr2;
			ALPHAI[ offsetALPHAI + k * strideALPHAI ] = result.wi;
			ALPHAI[ offsetALPHAI + ( k + 1 ) * strideALPHAI ] = -result.wi;
		} else {
			// 1-by-1 block
			if ( B[ offsetB + k * strideB1 + k * strideB2 ] < ZERO ) {
				// Flip sign of row k in A, B, and optionally Q
				for ( j = 0; j < N; j++ ) {
					A[ offsetA + k * strideA1 + j * strideA2 ] = -A[ offsetA + k * strideA1 + j * strideA2 ];
					B[ offsetB + k * strideB1 + j * strideB2 ] = -B[ offsetB + k * strideB1 + j * strideB2 ];
					if ( wantq ) {
						Q[ offsetQ + j * strideQ1 + k * strideQ2 ] = -Q[ offsetQ + j * strideQ1 + k * strideQ2 ];
					}
				}
			}

			ALPHAR[ offsetALPHAR + k * strideALPHAR ] = A[ offsetA + k * strideA1 + k * strideA2 ];
			ALPHAI[ offsetALPHAI + k * strideALPHAI ] = ZERO;
			BETA[ offsetBETA + k * strideBETA ] = B[ offsetB + k * strideB1 + k * strideB2 ];
		}
	}
}


// EXPORTS //

export default dtgsen;
