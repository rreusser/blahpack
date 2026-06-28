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

/* eslint-disable max-len, max-params, max-statements, max-depth, max-lines-per-function */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgemm from './../../../../blas/base/dgemm/lib/base.js';
import dscal from './../../../../blas/base/dscal/lib/base.js';
import dlange from '../../dlange/lib/base.js';
import dlarmm from '../../dlarmm/lib/base.js';
import dlatrs from '../../dlatrs/lib/base.js';


// VARIABLES //

// DLAMCH('S') / DLAMCH('O'): safe minimum and overflow threshold
var SMLNUM = 2.2250738585072014e-308;
var BIGNUM = 1.0 / SMLNUM;
var RMAX = 1.7976931348623157e+308; // DLAMCH('Overflow')

// Block sizing constants (Fortran NB = MAX(8, ILAENV(1,'DLATRS',...)) → 8 by default)
var NB = 8;
var NBRHS = 32;
var NRHSMIN = 2;


// MAIN //

/**
* Solves a triangular system of equations with the scale factors set to prevent overflow.
*
* Solves one of the triangular systems
*
* ```text
* A * X = B * diag(scale)  or  A**T * X = B * diag(scale)
* ```
*
* where A is an N-by-N upper or lower triangular matrix, X and B are N-by-NRHS
* matrices, and scale is an NRHS-element vector of scaling factors. This is
* a BLAS-3 (multi-right-hand-side) version of `dlatrs`.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {string} normin - `'yes'` if `CNORM` contains column norms on input, `'no'` to compute them
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} A - input N-by-N triangular matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} X - in/out N-by-NRHS right-hand side matrix, overwritten by solution
* @param {integer} strideX1 - stride of the first dimension of `X`
* @param {integer} strideX2 - stride of the second dimension of `X`
* @param {NonNegativeInteger} offsetX - starting index for `X`
* @param {Float64Array} SCALE - out: scale factor for each right-hand side
* @param {integer} strideSCALE - stride length for `SCALE`
* @param {NonNegativeInteger} offsetSCALE - starting index for `SCALE`
* @param {Float64Array} CNORM - in/out column-norm workspace of length `N`
* @param {integer} strideCNORM - stride length for `CNORM`
* @param {NonNegativeInteger} offsetCNORM - starting index for `CNORM`
* @param {Float64Array} work - workspace of length >= `nba*max(nba, min(nrhs, 32)) + nba*nba + 8 + 32` where `nba = ceil(N/8)` (Fortran's LSCALE + LANRM, plus 8 elements for the dlange scratch buffer and 32 elements for the per-RHS norm cache)
* @param {integer} strideWork - stride length for `work` (must be 1; included for API uniformity)
* @param {NonNegativeInteger} offsetWork - starting index for `work`
* @returns {integer} info - 0 if successful
*/
function dlatrs3( uplo, trans, diag, normin, N, nrhs, A, strideA1, strideA2, offsetA, X, strideX1, strideX2, offsetX, SCALE, strideSCALE, offsetSCALE, CNORM, strideCNORM, offsetCNORM, work, strideWork, offsetWork ) { // eslint-disable-line max-params, no-unused-vars
	var scaleBlock;
	var lscale;
	var scaloc;
	var scamin;
	var ifirst;
	var jfirst;
	var notran;
	var nrhsK;
	var oxnrm;
	var ilast;
	var jlast;
	var rscal;
	var upper;
	var anrm;
	var awrk;
	var bnrm;
	var iinc;
	var jinc;
	var tmax;
	var lds;
	var nba;
	var nbx;
	var rhs;
	var sa1;
	var sa2;
	var scl;
	var sx1;
	var sx2;
	var oW;
	var sc;
	var ss;
	var i1;
	var i2;
	var ii;
	var j1;
	var j2;
	var k1;
	var k2;
	var kk;
	var i;
	var j;
	var k;

	sa1 = strideA1;
	sa2 = strideA2;
	sx1 = strideX1;
	sx2 = strideX2;
	ss = strideSCALE;
	sc = strideCNORM;

	upper = ( uplo === 'upper' );
	notran = ( trans === 'no-transpose' );

	// Partition A and X into blocks
	nba = Math.max( 1, ( ( N + NB ) - 1 ) / NB | 0 );
	nbx = Math.max( 1, ( ( nrhs + NBRHS ) - 1 ) / NBRHS | 0 );

	// Partition the caller-provided WORK as follows (strideWork=1 assumed).

	// work[offsetWork + I + KK*LDS] (LDS=NBA): local scale factor for the

	// I-th block row and KK-th vector in the current block column.

	// work[offsetWork + AWRK + I + (J-1)*NBA]: upper-bound norm of A(I,J).

	// work[offsetWork + AWRK + NBA*NBA + i] (NB=8 elements): dlange scratch.

	// work[offsetWork + AWRK + NBA*NBA + NB + i] (NBRHS=32 elements):

	// per-RHS diagonal-block segment inf-norms (the Fortran XNRM stack array).
	lscale = nba * Math.max( nba, Math.min( nrhs, NBRHS ) );
	lds = nba;
	awrk = offsetWork + lscale;
	oW = awrk + ( nba * nba );      // dlange scratch (8 elements)
	oxnrm = oW + NB;                // XNRM cache (NBRHS elements)

	// Single-element scratch for dlatrs's scalar output (SCALOC).
	scaleBlock = new Float64Array( 1 );

	// Initialize scaling factors
	for ( kk = 0; kk < nrhs; kk++ ) {
		SCALE[ offsetSCALE + ( kk * ss ) ] = 1.0;
	}

	// Quick return if possible
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	// Use unblocked code for small problems (NRHS < NRHSMIN)
	if ( nrhs < NRHSMIN ) {
		// First RHS uses the requested normin so column norms get computed once.
		scaleBlock[ 0 ] = 1.0;
		dlatrs( uplo, trans, diag, normin, N, A, sa1, sa2, offsetA, X, sx1, offsetX, scaleBlock, CNORM, sc, offsetCNORM );
		SCALE[ offsetSCALE + ( 0 * ss ) ] = scaleBlock[ 0 ];

		// Remaining columns reuse the computed norms.
		for ( k = 1; k < nrhs; k++ ) {
			scaleBlock[ 0 ] = 1.0;
			dlatrs( uplo, trans, diag, 'yes', N, A, sa1, sa2, offsetA, X, sx1, offsetX + ( k * sx2 ), scaleBlock, CNORM, sc, offsetCNORM );
			SCALE[ offsetSCALE + ( k * ss ) ] = scaleBlock[ 0 ];
		}
		return 0;
	}

	// Compute upper bounds on norms of off-diagonal blocks A(I,J). For
	// TRANS='N' use the infinity-norm of A(I,J) so we can bound ||A*x||_oo;
	// For TRANS='T'/'C' use the 1-norm. Track the largest bound in TMAX.
	tmax = 0.0;
	for ( j = 1; j <= nba; j++ ) {
		j1 = ( j - 1 ) * NB;
		j2 = Math.min( j * NB, N );
		if ( upper ) {
			ifirst = 1;
			ilast = j - 1;
		} else {
			ifirst = j + 1;
			ilast = nba;
		}
		for ( i = ifirst; i <= ilast; i++ ) {
			i1 = ( i - 1 ) * NB;
			i2 = Math.min( i * NB, N );
			if ( notran ) {
				anrm = dlange( 'inf-norm', i2 - i1, j2 - j1, A, sa1, sa2, offsetA + ( i1 * sa1 ) + ( j1 * sa2 ), work, 1, oW );
				work[ awrk + ( ( i - 1 ) + ( ( j - 1 ) * nba ) ) ] = anrm;
			} else {
				anrm = dlange( 'one-norm', i2 - i1, j2 - j1, A, sa1, sa2, offsetA + ( i1 * sa1 ) + ( j1 * sa2 ), work, 1, oW );

				// Note: store at WORK( AWRK + J + (I-1)*NBA ) — Fortran's stored as A(J,I) for transpose
				work[ awrk + ( ( j - 1 ) + ( ( i - 1 ) * nba ) ) ] = anrm;
			}
			if ( anrm > tmax ) {
				tmax = anrm;
			}
		}
	}

	// If any norm overflowed (TMAX > overflow threshold or is NaN/Inf),
	// Fall back to dlatrs per RHS with NORMIN='no' to force a safe scaling.
	if ( !( tmax <= RMAX ) ) {
		for ( k = 0; k < nrhs; k++ ) {
			scaleBlock[ 0 ] = 1.0;
			dlatrs( uplo, trans, diag, 'no', N, A, sa1, sa2, offsetA, X, sx1, offsetX + ( k * sx2 ), scaleBlock, CNORM, sc, offsetCNORM );
			SCALE[ offsetSCALE + ( k * ss ) ] = scaleBlock[ 0 ];
		}
		return 0;
	}

	// Process X one block column at a time (chunk of width NBRHS).
	for ( k = 1; k <= nbx; k++ ) {
		k1 = ( k - 1 ) * NBRHS;
		k2 = Math.min( k * NBRHS, nrhs );
		nrhsK = k2 - k1;

		// Initialize local scaling factors of current block column X(:, K1:K2-1)
		for ( kk = 1; kk <= nrhsK; kk++ ) {
			for ( i = 1; i <= nba; i++ ) {
				work[ offsetWork + ( i - 1 ) + ( kk * lds ) ] = 1.0;
			}
		}

		if ( notran ) {
			// Solve A * X = B * diag(scale)
			if ( upper ) {
				jfirst = nba;
				jlast = 0;
				jinc = -1;
			} else {
				jfirst = 1;
				jlast = nba + 1;
				jinc = 1;
			}
		} else if ( upper ) {
			// Solve A^T * X = B * diag(scale)
			jfirst = 1;
			jlast = nba + 1;
			jinc = 1;
		} else {
			jfirst = nba;
			jlast = 0;
			jinc = -1;
		}

		for ( j = jfirst; j !== jlast; j += jinc ) {
			j1 = ( j - 1 ) * NB;
			j2 = Math.min( j * NB, N );

			// Solve op(A(J,J)) * X(J,RHS) = SCALOC * B(J,RHS)

			// For each RHS in the current block column.
			for ( kk = 1; kk <= nrhsK; kk++ ) {
				rhs = k1 + kk - 1;
				scaleBlock[ 0 ] = 1.0;
				if ( kk === 1 ) {
					dlatrs( uplo, trans, diag, 'no', j2 - j1, A, sa1, sa2, offsetA + ( j1 * sa1 ) + ( j1 * sa2 ), X, sx1, offsetX + ( j1 * sx1 ) + ( rhs * sx2 ), scaleBlock, CNORM, sc, offsetCNORM );
				} else {
					dlatrs( uplo, trans, diag, 'yes', j2 - j1, A, sa1, sa2, offsetA + ( j1 * sa1 ) + ( j1 * sa2 ), X, sx1, offsetX + ( j1 * sx1 ) + ( rhs * sx2 ), scaleBlock, CNORM, sc, offsetCNORM );
				}
				scaloc = scaleBlock[ 0 ];

				// Inf-norm of the solved block segment, used as worst-case

				// Growth bound for the subsequent linear updates.
				work[ oxnrm + ( kk - 1 ) ] = dlange( 'inf-norm', j2 - j1, 1, X, sx1, sx2, offsetX + ( j1 * sx1 ) + ( rhs * sx2 ), work, 1, oW );

				if ( scaloc === 0.0 ) {
					// Dlatrs found A singular (a diagonal A(j,j) was zero).
					// Reset the entire RHS column to a non-trivial null-vector
					// Of op(A): zero everywhere except the diagonal-block
					// Segment (which dlatrs already filled in).
					SCALE[ offsetSCALE + ( rhs * ss ) ] = 0.0;
					for ( ii = 0; ii < j1; ii++ ) {
						X[ offsetX + ( ii * sx1 ) + ( rhs * sx2 ) ] = 0.0;
					}
					for ( ii = j2; ii < N; ii++ ) {
						X[ offsetX + ( ii * sx1 ) + ( rhs * sx2 ) ] = 0.0;
					}
					// Discard the local scale factors.
					for ( ii = 1; ii <= nba; ii++ ) {
						work[ offsetWork + ( ii - 1 ) + ( kk * lds ) ] = 1.0;
					}
					scaloc = 1.0;
				} else if ( scaloc * work[ offsetWork + ( j - 1 ) + ( kk * lds ) ] === 0.0 ) {
					// NOTE: This combined-underflow branch is hard to reach in
					// A portable way (requires `SCALOC * WORK(J, KK)` to
					// Underflow to zero across the block-iteration sequence).
					// Behavior approximates the Fortran reference under deep
					// Overflow but is not fixture-tested. See LEARNINGS.md.

					// Dlatrs returned a valid scale factor, but combined with
					// The existing local scale it underflows to zero. Floor
					// The local scale at smlnum and amplify scaloc, then try
					// To rescale x to preserve a positive combined scale.
					scl = work[ offsetWork + ( j - 1 ) + ( kk * lds ) ] / SMLNUM;
					scaloc *= scl;
					work[ offsetWork + ( j - 1 ) + ( kk * lds ) ] = SMLNUM;
					rscal = 1.0 / scaloc;
					if ( work[ oxnrm + ( kk - 1 ) ] * rscal <= BIGNUM ) {
						work[ oxnrm + ( kk - 1 ) ] *= rscal;
						dscal( j2 - j1, rscal, X, sx1, offsetX + ( j1 * sx1 ) + ( rhs * sx2 ) );
						scaloc = 1.0;
					} else {
						// System is too badly scaled to represent the solution.
						// Set the entire column to zero and signal via SCALE=0.
						// (This deviates from dlatrs which returns a meaningless
						// non-zero vector.)
						SCALE[ offsetSCALE + ( rhs * ss ) ] = 0.0;
						for ( ii = 0; ii < N; ii++ ) {
							X[ offsetX + ( ii * sx1 ) + ( rhs * sx2 ) ] = 0.0;
						}
						for ( ii = 1; ii <= nba; ii++ ) {
							work[ offsetWork + ( ii - 1 ) + ( kk * lds ) ] = 1.0;
						}
						scaloc = 1.0;
					}
				}
				scaloc *= work[ offsetWork + ( j - 1 ) + ( kk * lds ) ];
				work[ offsetWork + ( j - 1 ) + ( kk * lds ) ] = scaloc;
			}

			// Linear block updates: B(I,K) := B(I,K) - op(A(I,J)) * X(J,K).
			if ( notran ) {
				if ( upper ) {
					ifirst = j - 1;
					ilast = 1;
					iinc = -1;
				} else {
					ifirst = j + 1;
					ilast = nba;
					iinc = 1;
				}
			} else if ( upper ) {
				ifirst = j + 1;
				ilast = nba;
				iinc = 1;
			} else {
				ifirst = j - 1;
				ilast = 1;
				iinc = -1;
			}

			// Iterate in IINC direction. The Fortran "do i = ifirst, ilast, iinc"
			// Is empty when iinc=+1 and ifirst > ilast, or iinc=-1 and ifirst < ilast.
			for ( i = ifirst; ( iinc > 0 ) ? ( i <= ilast ) : ( i >= ilast ); i += iinc ) {
				i1 = ( i - 1 ) * NB;
				i2 = Math.min( i * NB, N );

				// For each RHS in the chunk: bring both block segments to a

				// Consistent scaling and rescale them by an overflow-safe

				// Factor before calling GEMM, then update the local scales.
				for ( kk = 1; kk <= nrhsK; kk++ ) {
					rhs = k1 + kk - 1;
					scamin = Math.min( work[ offsetWork + ( i - 1 ) + ( kk * lds ) ], work[ offsetWork + ( j - 1 ) + ( kk * lds ) ] );

					// Inf-norm of B(I,RHS) used for the overflow estimate.
					bnrm = dlange( 'inf-norm', i2 - i1, 1, X, sx1, sx2, offsetX + ( i1 * sx1 ) + ( rhs * sx2 ), work, 1, oW );
					bnrm *= ( scamin / work[ offsetWork + ( i - 1 ) + ( kk * lds ) ] );
					work[ oxnrm + ( kk - 1 ) ] = work[ oxnrm + ( kk - 1 ) ] * ( scamin / work[ offsetWork + ( j - 1 ) + ( kk * lds ) ] );
					anrm = work[ awrk + ( ( i - 1 ) + ( ( j - 1 ) * nba ) ) ];
					scaloc = dlarmm( anrm, work[ oxnrm + ( kk - 1 ) ], bnrm );

					// Apply the robust update factor + consistency scaling to

					// Both block segments. We update WORK only when SCL!=1

					// To leave the existing scale unchanged otherwise.
					scl = ( scamin / work[ offsetWork + ( i - 1 ) + ( kk * lds ) ] ) * scaloc;
					if ( scl !== 1.0 ) {
						dscal( i2 - i1, scl, X, sx1, offsetX + ( i1 * sx1 ) + ( rhs * sx2 ) );
						work[ offsetWork + ( i - 1 ) + ( kk * lds ) ] = scamin * scaloc;
					}
					scl = ( scamin / work[ offsetWork + ( j - 1 ) + ( kk * lds ) ] ) * scaloc;
					if ( scl !== 1.0 ) {
						dscal( j2 - j1, scl, X, sx1, offsetX + ( j1 * sx1 ) + ( rhs * sx2 ) );
						work[ offsetWork + ( j - 1 ) + ( kk * lds ) ] = scamin * scaloc;
					}
				}

				if ( notran ) {
					// B(I, K) := B(I, K) - A(I, J) * X(J, K)
					dgemm( 'no-transpose', 'no-transpose', i2 - i1, nrhsK, j2 - j1, -1.0, A, sa1, sa2, offsetA + ( i1 * sa1 ) + ( j1 * sa2 ), X, sx1, sx2, offsetX + ( j1 * sx1 ) + ( k1 * sx2 ), 1.0, X, sx1, sx2, offsetX + ( i1 * sx1 ) + ( k1 * sx2 ) );
				} else {
					// B(I, K) := B(I, K) - A(J, I)**T * X(J, K)
					dgemm( 'transpose', 'no-transpose', i2 - i1, nrhsK, j2 - j1, -1.0, A, sa1, sa2, offsetA + ( j1 * sa1 ) + ( i1 * sa2 ), X, sx1, sx2, offsetX + ( j1 * sx1 ) + ( k1 * sx2 ), 1.0, X, sx1, sx2, offsetX + ( i1 * sx1 ) + ( k1 * sx2 ) );
				}
			}
		}

		// Reduce local scaling factors: SCALE(RHS) is the smallest local
		// Scale across all block rows for that RHS.
		for ( kk = 1; kk <= nrhsK; kk++ ) {
			rhs = k1 + kk - 1;
			for ( i = 1; i <= nba; i++ ) {
				if ( work[ offsetWork + ( i - 1 ) + ( kk * lds ) ] < SCALE[ offsetSCALE + ( rhs * ss ) ] ) {
					SCALE[ offsetSCALE + ( rhs * ss ) ] = work[ offsetWork + ( i - 1 ) + ( kk * lds ) ];
				}
			}
		}

		// Realize consistent scaling: rescale each block segment so that the
		// per-column scaling matches the global SCALE(RHS) chosen above.
		for ( kk = 1; kk <= nrhsK; kk++ ) {
			rhs = k1 + kk - 1;
			if ( SCALE[ offsetSCALE + ( rhs * ss ) ] !== 1.0 && SCALE[ offsetSCALE + ( rhs * ss ) ] !== 0.0 ) {
				for ( i = 1; i <= nba; i++ ) {
					i1 = ( i - 1 ) * NB;
					i2 = Math.min( i * NB, N );
					scl = SCALE[ offsetSCALE + ( rhs * ss ) ] / work[ offsetWork + ( i - 1 ) + ( kk * lds ) ];
					if ( scl !== 1.0 ) {
						dscal( i2 - i1, scl, X, sx1, offsetX + ( i1 * sx1 ) + ( rhs * sx2 ) );
					}
				}
			}
		}
	}

	return 0;
}


// EXPORTS //

export default dlatrs3;
