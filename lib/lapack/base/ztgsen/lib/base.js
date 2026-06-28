/* eslint-disable max-len, max-params */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from './../../../../lapack/base/dlamch/lib/base.js';
import zlacpy from './../../../../lapack/base/zlacpy/lib/base.js';
import zlassq from './../../../../lapack/base/zlassq/lib/base.js';
import zlacn2 from './../../../../lapack/base/zlacn2/lib/base.js';
import ztgexc from './../../../../lapack/base/ztgexc/lib/base.js';
import ztgsyl from './../../../../lapack/base/ztgsyl/lib/base.js';
import zscal from './../../../../blas/base/zscal/lib/base.js';
import cmplx from './../../../../cmplx.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var IDIFJB = 3;


// MAIN //

/**
* Reorders the generalized Schur decomposition of a complex matrix pair (A,B).
*
* Moves a selected cluster of eigenvalues to the leading diagonal
* blocks of the upper triangular pair. Optionally computes the reciprocal
* condition numbers of the cluster and the deflating subspaces.
*
* ## Notes
*
* -   Complex version: A and B are upper triangular with only 1x1 blocks.
* -   SELECT is a boolean array (truthy/falsy values).
* -   ALPHA and BETA are Complex128Array outputs.
* -   Returns an object with output scalars: `{ info, m, pl, pr }`.
* -   WORK and IWORK are allocated internally; the caller-supplied arrays are unused.
*
* @private
* @param {integer} ijob - specifies whether condition numbers are required (0-5)
* @param {boolean} wantq - whether to update the left transformation matrix Q
* @param {boolean} wantz - whether to update the right transformation matrix Z
* @param {Uint8Array} SELECT - boolean selection array of length N
* @param {integer} strideSELECT - stride for SELECT
* @param {NonNegativeInteger} offsetSELECT - starting index for SELECT
* @param {NonNegativeInteger} N - order of the matrices A, B, Q, Z
* @param {Complex128Array} A - N-by-N upper triangular matrix (updated in place)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - N-by-N upper triangular matrix (updated in place)
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {Complex128Array} ALPHA - output array of length N for eigenvalue numerators
* @param {integer} strideALPHA - stride for ALPHA (complex elements)
* @param {NonNegativeInteger} offsetALPHA - starting index for ALPHA (complex elements)
* @param {Complex128Array} BETA - output array of length N for eigenvalue denominators
* @param {integer} strideBETA - stride for BETA (complex elements)
* @param {NonNegativeInteger} offsetBETA - starting index for BETA (complex elements)
* @param {Complex128Array} Q - N-by-N unitary matrix (updated if wantq)
* @param {integer} strideQ1 - stride of the first dimension of Q (complex elements)
* @param {integer} strideQ2 - stride of the second dimension of Q (complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for Q (complex elements)
* @param {Complex128Array} Z - N-by-N unitary matrix (updated if wantz)
* @param {integer} strideZ1 - stride of the first dimension of Z (complex elements)
* @param {integer} strideZ2 - stride of the second dimension of Z (complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for Z (complex elements)
* @param {NonNegativeInteger} M - (ignored on input; computed internally)
* @param {number} pl - (ignored on input; computed internally)
* @param {number} pr - (ignored on input; computed internally)
* @param {Float64Array} DIF - output array of length 2
* @param {integer} strideDIF - stride for DIF
* @param {NonNegativeInteger} offsetDIF - starting index for DIF
* @param {Complex128Array} WORK - workspace (ignored; allocated internally)
* @param {integer} strideWork - stride for WORK (ignored)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (ignored)
* @param {integer} lwork - workspace size (ignored; allocated internally)
* @param {Int32Array} IWORK - workspace (ignored; allocated internally)
* @param {integer} strideIWork - stride for IWORK (ignored)
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK (ignored)
* @param {integer} liwork - workspace size (ignored; allocated internally)
* @returns {Object} result object with `info`, `m`, `pl`, `pr`
*/
function ztgsen( ijob, wantq, wantz, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, M, pl, pr, DIF, strideDIF, offsetDIF, WORK, strideWork, offsetWork, lwork, IWORK, strideIWork, offsetIWork, liwork ) { // eslint-disable-line max-len, max-params, no-unused-vars
	var dscale;
	var rdscal;
	var safmin;
	var wantd1;
	var wantd2;
	var result;
	var ALPHAv;
	var wantp;
	var wantd;
	var SCALV;
	var KASEV;
	var ISAVE;
	var BETAv;
	var DIFV;
	var dsum;
	var kase;
	var ierr;
	var res;
	var mn2;
	var IWK;
	var ijb;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sq1;
	var sq2;
	var ia2;
	var ib2;
	var WK;
	var Av;
	var Bv;
	var Qv;
	var n1;
	var n2;
	var ks;
	var ia;
	var ib;
	var i;
	var k;

	pl = ONE;
	pr = ONE;
	M = 0;

	// Decode IJOB flags:
	wantp = ( ijob === 1 || ijob >= 4 );
	wantd1 = ( ijob === 2 || ijob === 4 );
	wantd2 = ( ijob === 3 || ijob === 5 );
	wantd = ( wantd1 || wantd2 );

	// Float64 strides for direct indexing into reinterpreted views:
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sq1 = strideQ1 * 2;
	sq2 = strideQ2 * 2;

	// Reinterpret complex arrays to Float64 views:
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	Qv = reinterpret( Q, 0 );
	ALPHAv = reinterpret( ALPHA, 0 );
	BETAv = reinterpret( BETA, 0 );

	// Count selected eigenvalues and extract ALPHA/BETA from diagonal:
	for ( k = 0; k < N; k++ ) {
		// ALPHA(k) = A(k,k):
		ia = ( offsetA * 2 ) + ( k * sa1 ) + ( k * sa2 );
		ia2 = ( offsetALPHA * 2 ) + ( k * strideALPHA * 2 );
		ALPHAv[ ia2 ] = Av[ ia ];
		ALPHAv[ ia2 + 1 ] = Av[ ia + 1 ];

		// BETA(k) = B(k,k):
		ib = ( offsetB * 2 ) + ( k * sb1 ) + ( k * sb2 );
		ib2 = ( offsetBETA * 2 ) + ( k * strideBETA * 2 );
		BETAv[ ib2 ] = Bv[ ib ];
		BETAv[ ib2 + 1 ] = Bv[ ib + 1 ];

		if ( SELECT[ offsetSELECT + ( k * strideSELECT ) ] ) {
			M += 1;
		}
	}

	// Quick return if all or none selected:
	if ( M === N || M === 0 ) {
		if ( wantp ) {
			pl = ONE;
			pr = ONE;
		}
		if ( wantd ) {
			dscale = ZERO;
			dsum = ONE;
			for ( i = 0; i < N; i++ ) {
				res = zlassq( N, A, strideA1, offsetA + ( i * strideA2 ), dscale, dsum );
				dscale = res.scl;
				dsum = res.sumsq;
				res = zlassq( N, B, strideB1, offsetB + ( i * strideB2 ), dscale, dsum );
				dscale = res.scl;
				dsum = res.sumsq;
			}
			DIF[ offsetDIF ] = dscale * Math.sqrt( dsum );
			DIF[ offsetDIF + strideDIF ] = DIF[ offsetDIF ];
		}
		return {
			'info': 0,
			'm': M,
			'pl': pl,
			'pr': pr
		};
	}

	safmin = dlamch( 'safe minimum' );

	// Reorder: move selected eigenvalues to the top-left:
	ks = 0;
	for ( k = 0; k < N; k++ ) {
		if ( SELECT[ offsetSELECT + ( k * strideSELECT ) ] ) {
			// Swap eigenvalue at position k to position ks (0-based):
			if ( k !== ks ) {
				result = ztgexc( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, k, ks );
				ierr = result.info;
				if ( ierr > 0 ) {
					// Reordering failed:
					if ( wantp ) {
						pl = ZERO;
						pr = ZERO;
					}
					if ( wantd ) {
						DIF[ offsetDIF ] = ZERO;
						DIF[ offsetDIF + strideDIF ] = ZERO;
					}
					// Jump to final normalization (Fortran GOTO 70):
					normalizeB( Av, Bv, Qv, ALPHAv, BETAv, sa1, sa2, sb1, sb2, sq1, sq2, strideALPHA, strideBETA, offsetA, offsetB, offsetQ, offsetALPHA, offsetBETA, N, safmin, wantq, A, B, Q, strideA1, strideA2, strideB1, strideB2, strideQ1, strideQ2 );
					return {
						'info': 1,
						'm': M,
						'pl': pl,
						'pr': pr
					};
				}
			}
			ks += 1;
		}
	}

	if ( wantp ) {
		// Compute reciprocal condition numbers of the eigenvalue cluster:
		n1 = M;
		n2 = N - M;

		// Allocate workspace for ztgsyl. Total: 2*n1*n2 for C,F + extra for ztgsyl
		WK = new Complex128Array( Math.max( 1, (4 * n1 * n2) + 1 ) );
		IWK = new Int32Array( Math.max( 1, n1 + n2 + 6 ) );
		SCALV = new Float64Array( 1 );
		DIFV = new Float64Array( 1 );

		// Copy A(0:n1, n1:N) into WK(0:n1*n2):
		zlacpy( 'full', n1, n2, A, strideA1, strideA2, offsetA + ( n1 * strideA2 ), WK, 1, n1, 0 );

		// Copy B(0:n1, n1:N) into WK(n1*n2:2*n1*n2):
		zlacpy( 'full', n1, n2, B, strideB1, strideB2, offsetB + ( n1 * strideB2 ), WK, 1, n1, n1 * n2 );

		// Solve: ztgsyl with ijb=0 solves A11*X - Y*A22 = scale*C, B11*X - Y*B22 = scale*F
		ijb = 0;
		ztgsyl('no-transpose', ijb, n1, n2, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( n1 * strideA1 ) + ( n1 * strideA2 ), WK, 1, n1, 0, B, strideB1, strideB2, offsetB, B, strideB1, strideB2, offsetB + ( n1 * strideB1 ) + ( n1 * strideB2 ), WK, 1, n1, n1 * n2, SCALV, DIFV, WK, 1, 2 * n1 * n2, -1, IWK, 1, 0);
		dscale = SCALV[ 0 ];

		// Compute PL from the solution X (first n1*n2 complex elements of WK):
		rdscal = ZERO;
		dsum = ONE;
		res = zlassq( n1 * n2, WK, 1, 0, rdscal, dsum );
		rdscal = res.scl;
		dsum = res.sumsq;
		pl = rdscal * Math.sqrt( dsum );
		if ( pl === ZERO ) {
			pl = ONE;
		} else {
			pl = dscale / ( Math.sqrt( ( ( dscale * dscale ) / pl ) + pl ) * Math.sqrt( pl ) );
		}

		// Compute PR from the solution Y (next n1*n2 complex elements of WK):
		rdscal = ZERO;
		dsum = ONE;
		res = zlassq( n1 * n2, WK, 1, n1 * n2, rdscal, dsum );
		rdscal = res.scl;
		dsum = res.sumsq;
		pr = rdscal * Math.sqrt( dsum );
		if ( pr === ZERO ) {
			pr = ONE;
		} else {
			pr = dscale / ( Math.sqrt( ( ( dscale * dscale ) / pr ) + pr ) * Math.sqrt( pr ) );
		}
	}

	if ( wantd ) {
		n1 = M;
		n2 = N - M;

		// Allocate workspace:
		WK = new Complex128Array( Math.max( 1, (4 * n1 * n2) + 1 ) );
		IWK = new Int32Array( Math.max( 1, 2 * n1 * n2, n1 + n2 + 6 ) );
		SCALV = new Float64Array( 1 );
		DIFV = new Float64Array( 1 );

		if ( wantd1 ) {
			// Direct computation of DIF(1) and DIF(2) using ztgsyl with ijb=IDIFJB:
			ijb = IDIFJB;

			ztgsyl('no-transpose', ijb, n1, n2, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( n1 * strideA1 ) + ( n1 * strideA2 ), WK, 1, n1, 0, B, strideB1, strideB2, offsetB, B, strideB1, strideB2, offsetB + ( n1 * strideB1 ) + ( n1 * strideB2 ), WK, 1, n1, n1 * n2, SCALV, DIFV, WK, 1, 2 * n1 * n2, -1, IWK, 1, 0);
			DIF[ offsetDIF ] = DIFV[ 0 ];

			ztgsyl('no-transpose', ijb, n2, n1, A, strideA1, strideA2, offsetA + ( n1 * strideA1 ) + ( n1 * strideA2 ), A, strideA1, strideA2, offsetA, WK, 1, n2, 0, B, strideB1, strideB2, offsetB + ( n1 * strideB1 ) + ( n1 * strideB2 ), B, strideB1, strideB2, offsetB, WK, 1, n2, n1 * n2, SCALV, DIFV, WK, 1, 2 * n1 * n2, -1, IWK, 1, 0);
			DIF[ offsetDIF + strideDIF ] = DIFV[ 0 ];
		} else {
			// Estimate DIF(1) and DIF(2) using reverse communication (zlacn2):
			mn2 = 2 * n1 * n2;
			ijb = 0;
			ISAVE = new Int32Array( 3 );
			KASEV = new Int32Array( 1 );

			// WK layout: [0..mn2-1] = X for zlacn2, [mn2..2*mn2-1] = V for zlacn2

			// Within X: [0..n1*n2-1] = C for ztgsyl, [n1*n2..mn2-1] = F for ztgsyl

			// Beyond: [mn2..] = workspace for ztgsyl

			// --- Estimate DIF(1) ---
			KASEV[ 0 ] = 0;
			DIFV[ 0 ] = ZERO;
			while ( true ) {
				zlacn2( mn2, WK, 1, mn2, WK, 1, 0, DIFV, KASEV, ISAVE, 1, 0 );
				kase = KASEV[ 0 ];
				if ( kase === 0 ) {
					break;
				}
				if ( kase === 1 ) {
					ztgsyl('no-transpose', ijb, n1, n2, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( n1 * strideA1 ) + ( n1 * strideA2 ), WK, 1, n1, 0, B, strideB1, strideB2, offsetB, B, strideB1, strideB2, offsetB + ( n1 * strideB1 ) + ( n1 * strideB2 ), WK, 1, n1, n1 * n2, SCALV, DIFV, WK, 1, 2 * n1 * n2, -1, IWK, 1, 0);
				} else {
					ztgsyl('conjugate-transpose', ijb, n1, n2, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( n1 * strideA1 ) + ( n1 * strideA2 ), WK, 1, n1, 0, B, strideB1, strideB2, offsetB, B, strideB1, strideB2, offsetB + ( n1 * strideB1 ) + ( n1 * strideB2 ), WK, 1, n1, n1 * n2, SCALV, DIFV, WK, 1, 2 * n1 * n2, -1, IWK, 1, 0);
				}
			}
			dscale = SCALV[ 0 ];
			DIF[ offsetDIF ] = dscale / DIFV[ 0 ];

			// --- Estimate DIF(2) ---
			KASEV[ 0 ] = 0;
			ISAVE[ 0 ] = 0;
			ISAVE[ 1 ] = 0;
			ISAVE[ 2 ] = 0;
			DIFV[ 0 ] = ZERO;
			while ( true ) {
				zlacn2( mn2, WK, 1, mn2, WK, 1, 0, DIFV, KASEV, ISAVE, 1, 0 );
				kase = KASEV[ 0 ];
				if ( kase === 0 ) {
					break;
				}
				if ( kase === 1 ) {
					ztgsyl('no-transpose', ijb, n2, n1, A, strideA1, strideA2, offsetA + ( n1 * strideA1 ) + ( n1 * strideA2 ), A, strideA1, strideA2, offsetA, WK, 1, n2, 0, B, strideB1, strideB2, offsetB + ( n1 * strideB1 ) + ( n1 * strideB2 ), B, strideB1, strideB2, offsetB, WK, 1, n2, n1 * n2, SCALV, DIFV, WK, 1, 2 * n1 * n2, -1, IWK, 1, 0);
				} else {
					ztgsyl('conjugate-transpose', ijb, n2, n1, A, strideA1, strideA2, offsetA + ( n1 * strideA1 ) + ( n1 * strideA2 ), A, strideA1, strideA2, offsetA, WK, 1, n2, 0, B, strideB1, strideB2, offsetB, B, strideB1, strideB2, offsetB + ( n1 * strideB1 ) + ( n1 * strideB2 ), WK, 1, n2, n1 * n2, SCALV, DIFV, WK, 1, 2 * n1 * n2, -1, IWK, 1, 0);
				}
			}
			dscale = SCALV[ 0 ];
			DIF[ offsetDIF + strideDIF ] = dscale / DIFV[ 0 ];
		}
	}

	// Normalize B to have real positive diagonal, update A and Q accordingly:
	normalizeB( Av, Bv, Qv, ALPHAv, BETAv, sa1, sa2, sb1, sb2, sq1, sq2, strideALPHA, strideBETA, offsetA, offsetB, offsetQ, offsetALPHA, offsetBETA, N, safmin, wantq, A, B, Q, strideA1, strideA2, strideB1, strideB2, strideQ1, strideQ2 );

	return {
		'info': 0,
		'm': M,
		'pl': pl,
		'pr': pr
	};
}

/**
* Normalizes B to have real positive diagonal, scaling A and Q, and extracts ALPHA/BETA.
*
* @private
* @param {Float64Array} Av - reinterpreted A
* @param {Float64Array} Bv - reinterpreted B
* @param {Float64Array} Qv - reinterpreted Q
* @param {Float64Array} ALPHAv - reinterpreted ALPHA
* @param {Float64Array} BETAv - reinterpreted BETA
* @param {integer} sa1 - Float64 stride for A dim1
* @param {integer} sa2 - Float64 stride for A dim2
* @param {integer} sb1 - Float64 stride for B dim1
* @param {integer} sb2 - Float64 stride for B dim2
* @param {integer} sq1 - Float64 stride for Q dim1
* @param {integer} sq2 - Float64 stride for Q dim2
* @param {integer} strideALPHA - complex stride for ALPHA
* @param {integer} strideBETA - complex stride for BETA
* @param {integer} offsetA - complex offset for A
* @param {integer} offsetB - complex offset for B
* @param {integer} offsetQ - complex offset for Q
* @param {integer} offsetALPHA - complex offset for ALPHA
* @param {integer} offsetBETA - complex offset for BETA
* @param {integer} N - matrix order
* @param {number} safmin - safe minimum
* @param {boolean} wantq - whether to update Q
* @param {Complex128Array} A - original complex A
* @param {Complex128Array} B - original complex B
* @param {Complex128Array} Q - original complex Q
* @param {integer} csA1 - complex stride for A dim1
* @param {integer} csA2 - complex stride for A dim2
* @param {integer} csB1 - complex stride for B dim1
* @param {integer} csB2 - complex stride for B dim2
* @param {integer} csQ1 - complex stride for Q dim1
* @param {integer} csQ2 - complex stride for Q dim2
*/
function normalizeB( Av, Bv, Qv, ALPHAv, BETAv, sa1, sa2, sb1, sb2, sq1, sq2, strideALPHA, strideBETA, offsetA, offsetB, offsetQ, offsetALPHA, offsetBETA, N, safmin, wantq, A, B, Q, csA1, csA2, csB1, csB2, csQ1, csQ2 ) { // eslint-disable-line max-len, max-params, no-unused-vars
	var temp1;
	var temp2;
	var bkkR;
	var bkkI;
	var ia2;
	var ib2;
	var ia;
	var ib;
	var d;
	var k;

	for ( k = 0; k < N; k++ ) {
		ib = ( offsetB * 2 ) + ( k * sb1 ) + ( k * sb2 );
		bkkR = Bv[ ib ];
		bkkI = Bv[ ib + 1 ];
		d = cmplx.absAt( Bv, ib );

		if ( d > safmin ) {
			// temp1 = conj(B(k,k)) / |B(k,k)|:
			temp1 = new Complex128( bkkR / d, -bkkI / d );

			// temp2 = B(k,k) / |B(k,k)|:
			temp2 = new Complex128( bkkR / d, bkkI / d );

			// B(k,k) = |B(k,k)|:
			Bv[ ib ] = d;
			Bv[ ib + 1 ] = ZERO;

			// Scale row k of B from column k+1..N-1: B(k,k+1:N) *= temp1
			if ( k < N - 1 ) {
				zscal( N - k - 1, temp1, B, csB2, offsetB + ( k * csB1 ) + ( ( k + 1 ) * csB2 ) );
			}

			// Scale row k of A from column k..N-1: A(k,k:N) *= temp1
			zscal( N - k, temp1, A, csA2, offsetA + ( k * csA1 ) + ( k * csA2 ) );

			// Scale column k of Q: Q(:,k) *= temp2
			if ( wantq ) {
				zscal( N, temp2, Q, csQ1, offsetQ + ( k * csQ2 ) );
			}
		} else {
			Bv[ ib ] = ZERO;
			Bv[ ib + 1 ] = ZERO;
		}

		// Update ALPHA(k) = A(k,k), BETA(k) = B(k,k):
		ia = ( offsetA * 2 ) + ( k * sa1 ) + ( k * sa2 );
		ia2 = ( offsetALPHA * 2 ) + ( k * strideALPHA * 2 );
		ib2 = ( offsetBETA * 2 ) + ( k * strideBETA * 2 );
		ALPHAv[ ia2 ] = Av[ ia ];
		ALPHAv[ ia2 + 1 ] = Av[ ia + 1 ];
		BETAv[ ib2 ] = Bv[ ib ];
		BETAv[ ib2 + 1 ] = Bv[ ib + 1 ];
	}
}


// EXPORTS //

export default ztgsen;
