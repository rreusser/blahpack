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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgbtf2 from '../../zgbtf2/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import zgeru from '../../../../blas/base/zgeru/lib/base.js';
import zlaswp from '../../zlaswp/lib/base.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

var NB = 32; // Block size (Fortran uses ILAENV)
var NBMAX = 64;
var LDWORK = NBMAX + 1;
var TEMP = new Float64Array( 2 );
var CONE = new Complex128( 1.0, 0.0 );
var CNEG_ONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Computes an LU factorization of a complex M-by-N band matrix A.
*
* Uses partial pivoting with row interchanges (blocked algorithm).
*
* This is the blocked version calling Level 3 BLAS. For small bandwidth
* (NB <= 1 or NB > KL), it falls through to the unblocked zgbtf2.
*
* IPIV stores 0-based pivot indices: row i was interchanged with row `IPIV[i]`.
*
* @private
* @param {NonNegativeInteger} M - number of rows of matrix A
* @param {NonNegativeInteger} N - number of columns of matrix A
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {Complex128Array} AB - band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of AB (in complex elements)
* @param {integer} strideAB2 - stride of the second dimension of AB (in complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for AB (in complex elements)
* @param {Int32Array} IPIV - pivot index output array, length min(M,N)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @returns {integer} info - 0 if successful, k if U(k-1,k-1) is exactly zero (1-based)
*/
function zgbtrf( M, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV ) {
	var ONE_NEG;
	var WORK13;
	var WORK31;
	var minMN;
	var W13v;
	var W31v;
	var info;
	var ABv;
	var sa1;
	var sa2;
	var idx;
	var id2;
	var kv;
	var km;
	var jp;
	var jb;
	var jm;
	var ju;
	var i2;
	var i3;
	var j2;
	var j3;
	var k2;
	var nw;
	var ip;
	var ii;
	var jj;
	var tr;
	var ti;
	var i;
	var j;

	sa1 = strideAB1;
	sa2 = strideAB2;

	kv = ku + kl;
	info = 0;

	if ( M === 0 || N === 0 ) {
		return 0;
	}

	// Use unblocked code when block size is ineffective for banded case
	if ( NB <= 1 || NB > kl ) {
		return zgbtf2( M, N, kl, ku, AB, sa1, sa2, offsetAB, IPIV, strideIPIV, offsetIPIV );
	}

	minMN = Math.min( M, N );

	ABv = reinterpret( AB, 0 );

	// Allocate complex workspace arrays

	// WORK13(LDWORK, NBMAX) - stores portion of L that wraps around

	// WORK31(LDWORK, NBMAX) - stores portion of L below the band
	WORK13 = new Complex128Array( LDWORK * NBMAX );
	WORK31 = new Complex128Array( LDWORK * NBMAX );
	W13v = reinterpret( WORK13, 0 );
	W31v = reinterpret( WORK31, 0 );

	// Initialize WORK13 upper triangle to zero
	for ( j = 0; j < NB; j++ ) {
		for ( i = 0; i < j; i++ ) {
			idx = ( i + (j * LDWORK) ) * 2;
			W13v[ idx ] = 0.0;
			W13v[ idx + 1 ] = 0.0;
		}
	}

	// Initialize WORK31 lower triangle to zero
	for ( j = 0; j < NB; j++ ) {
		for ( i = j + 1; i < NB; i++ ) {
			idx = ( i + (j * LDWORK) ) * 2;
			W31v[ idx ] = 0.0;
			W31v[ idx + 1 ] = 0.0;
		}
	}

	// Zero out the fill-in region
	for ( j = ku + 1; j < Math.min( kv, N ); j++ ) {
		for ( i = kv - j; i < kl; i++ ) {
			idx = ( offsetAB + (i * sa1) + (j * sa2) ) * 2;
			ABv[ idx ] = 0.0;
			ABv[ idx + 1 ] = 0.0;
		}
	}

	ju = 0;

	for ( j = 0; j < minMN; j += NB ) {
		jb = Math.min( NB, minMN - j );

		// Active region sizes below the JB panel:

		// i2 = rows j+jb to j+kl-1 (still within the band)

		// i3 = rows j+kl to j+jb+kl-1 (wrap into WORK31)
		i2 = Math.min( kl - jb, M - j - jb );
		if ( i2 < 0 ) {
			i2 = 0;
		}
		i3 = Math.min( jb, M - j - kl );
		if ( i3 < 0 ) {
			i3 = 0;
		}

		// Factor the JB-wide panel
		for ( jj = j; jj < j + jb; jj++ ) {
			// Zero fill-in column
			if ( jj + kv < N ) {
				for ( i = 0; i < kl; i++ ) {
					idx = ( offsetAB + (i * sa1) + (( jj + kv ) * sa2) ) * 2;
					ABv[ idx ] = 0.0;
					ABv[ idx + 1 ] = 0.0;
				}
			}

			// Find pivot in column jj
			km = Math.min( kl, M - jj - 1 );
			jp = izamax( km + 1, AB, sa1, offsetAB + (kv * sa1) + (jj * sa2) );
			IPIV[ offsetIPIV + (jj * strideIPIV) ] = jp + jj - j;

			// Check if pivot element is nonzero (both real and imag parts)
			idx = ( offsetAB + (( kv + jp ) * sa1) + (jj * sa2) ) * 2;
			if ( ABv[ idx ] !== 0.0 || ABv[ idx + 1 ] !== 0.0 ) {
				ju = Math.max( ju, Math.min( jj + ku + jp, N - 1 ) );

				// Swap rows
				if ( jp !== 0 ) {
					if ( jp + jj < j + kl ) {
						// Both rows are within the band
						zswap( jb, AB, sa2 - sa1, offsetAB + (( kv + jj - j ) * sa1) + (j * sa2), AB, sa2 - sa1, offsetAB + (( kv + jp + jj - j ) * sa1) + (j * sa2) );
					} else {
						// jp row extends into WORK31
						zswap( jj - j, AB, sa2 - sa1, offsetAB + (( kv + jj - j ) * sa1) + (j * sa2), WORK31, LDWORK, ( jp + jj - j - kl ) * 1 );
						zswap( j + jb - jj, AB, sa2 - sa1, offsetAB + (kv * sa1) + (jj * sa2), AB, sa2 - sa1, offsetAB + (( kv + jp ) * sa1) + (jj * sa2) );
					}
				}

				// Scale multipliers: compute 1/AB(kv, jj) using cmplx.divAt
				idx = ( offsetAB + (kv * sa1) + (jj * sa2) ) * 2;
				TEMP[ 0 ] = 1.0;
				TEMP[ 1 ] = 0.0;
				cmplx.divAt( TEMP, 0, TEMP, 0, ABv, idx );
				ONE_NEG = new Complex128( TEMP[ 0 ], TEMP[ 1 ] );
				zscal( km, ONE_NEG, AB, sa1, offsetAB + (( kv + 1 ) * sa1) + (jj * sa2) );

				// Rank-1 update within the panel
				jm = Math.min( ju, j + jb - 1 );
				if ( jm > jj ) {
					zgeru( km, jm - jj, CNEG_ONE, AB, sa1, offsetAB + (( kv + 1 ) * sa1) + (jj * sa2), AB, sa2 - sa1, offsetAB + (( kv - 1 ) * sa1) + (( jj + 1 ) * sa2), AB, sa1, sa2 - sa1, offsetAB + (kv * sa1) + (( jj + 1 ) * sa2) );
				}
			} else if ( info === 0 ) {
				info = jj + 1; // 1-based
			}

			// Copy column of L that wraps below the band into WORK31
			nw = Math.min( jj - j + 1, i3 );
			if ( nw > 0 ) {
				zcopy( nw, AB, sa1, offsetAB + (( kv + kl - jj + j ) * sa1) + (jj * sa2), WORK31, 1, (( jj - j ) * LDWORK) );
			}
		}

		if ( j + jb < N ) {
			// Apply interchanges and updates to trailing matrix
			j2 = Math.min( ju - j, kv ) - jb;
			if ( j2 < 0 ) {
				j2 = 0;
			}
			j3 = Math.max( 0, ju - j - kv );

			// Apply row interchanges to columns j+jb..j+jb+j2-1 within the band (zlaswp)
			zlaswp( j2, AB, sa1, sa2 - sa1, offsetAB + (( kv - jb ) * sa1) + (( j + jb ) * sa2), 0, jb - 1, IPIV, strideIPIV, offsetIPIV + (j * strideIPIV), 1 );

			// Adjust IPIV to global indices (add j)
			for ( i = j; i < j + jb; i++ ) {
				IPIV[ offsetIPIV + (i * strideIPIV) ] += j;
			}

			// Apply row interchanges to columns beyond the band (j3 columns)
			k2 = j + jb + j2;
			for ( i = 0; i < j3; i++ ) {
				jj = k2 + i;
				for ( ii = j + i; ii < j + jb; ii++ ) {
					ip = IPIV[ offsetIPIV + (ii * strideIPIV) ];
					if ( ip !== ii ) {
						// Swap complex elements: AB(kv+ii-jj, jj) <-> AB(kv+ip-jj, jj)
						idx = ( offsetAB + (( kv + ii - jj ) * sa1) + (jj * sa2) ) * 2;
						id2 = ( offsetAB + (( kv + ip - jj ) * sa1) + (jj * sa2) ) * 2;
						tr = ABv[ idx ];
						ti = ABv[ idx + 1 ];
						ABv[ idx ] = ABv[ id2 ];
						ABv[ idx + 1 ] = ABv[ id2 + 1 ];
						ABv[ id2 ] = tr;
						ABv[ id2 + 1 ] = ti;
					}
				}
			}

			// Solve L * U_12 = A_12 for the portion within the band
			if ( j2 > 0 ) {
				// ztrsm: solve L11 * U12 = AB(..., j+jb)
				ztrsm( 'left', 'lower', 'no-transpose', 'unit', jb, j2, CONE, AB, sa1, sa2 - sa1, offsetAB + (kv * sa1) + (j * sa2), AB, sa1, sa2 - sa1, offsetAB + (( kv - jb ) * sa1) + (( j + jb ) * sa2) );

				if ( i2 > 0 ) {
					// ZGEMM: update A22 within band
					zgemm( 'no-transpose', 'no-transpose', i2, j2, jb, CNEG_ONE, AB, sa1, sa2 - sa1, offsetAB + (( kv + jb ) * sa1) + (j * sa2), AB, sa1, sa2 - sa1, offsetAB + (( kv - jb ) * sa1) + (( j + jb ) * sa2), CONE, AB, sa1, sa2 - sa1, offsetAB + (kv * sa1) + (( j + jb ) * sa2) );
				}

				if ( i3 > 0 ) {
					// ZGEMM: update A32 from WORK31
					zgemm( 'no-transpose', 'no-transpose', i3, j2, jb, CNEG_ONE, WORK31, 1, LDWORK, 0, AB, sa1, sa2 - sa1, offsetAB + (( kv - jb ) * sa1) + (( j + jb ) * sa2), CONE, AB, sa1, sa2 - sa1, offsetAB + (( kv + kl - jb ) * sa1) + (( j + jb ) * sa2) );
				}
			}

			if ( j3 > 0 ) {
				// Copy portion from AB into WORK13 for beyond-band columns
				for ( jj = 0; jj < j3; jj++ ) {
					for ( ii = jj; ii < jb; ii++ ) {
						idx = ( ii + (jj * LDWORK) ) * 2;
						id2 = ( offsetAB + (( ii - jj ) * sa1) + (( jj + j + kv ) * sa2) ) * 2;
						W13v[ idx ] = ABv[ id2 ];
						W13v[ idx + 1 ] = ABv[ id2 + 1 ];
					}
				}

				// Solve L * W13 = WORK13
				ztrsm( 'left', 'lower', 'no-transpose', 'unit', jb, j3, CONE, AB, sa1, sa2 - sa1, offsetAB + (kv * sa1) + (j * sa2), WORK13, 1, LDWORK, 0 );

				if ( i2 > 0 ) {
					zgemm( 'no-transpose', 'no-transpose', i2, j3, jb, CNEG_ONE, AB, sa1, sa2 - sa1, offsetAB + (( kv + jb ) * sa1) + (j * sa2), WORK13, 1, LDWORK, 0, CONE, AB, sa1, sa2 - sa1, offsetAB + (( jb ) * sa1) + (( j + kv ) * sa2) );
				}

				if ( i3 > 0 ) {
					zgemm( 'no-transpose', 'no-transpose', i3, j3, jb, CNEG_ONE, WORK31, 1, LDWORK, 0, WORK13, 1, LDWORK, 0, CONE, AB, sa1, sa2 - sa1, offsetAB + (( kl ) * sa1) + (( j + kv ) * sa2) );
				}

				// Copy WORK13 back to AB
				for ( jj = 0; jj < j3; jj++ ) {
					for ( ii = jj; ii < jb; ii++ ) {
						idx = ( ii + (jj * LDWORK) ) * 2;
						id2 = ( offsetAB + (( ii - jj ) * sa1) + (( jj + j + kv ) * sa2) ) * 2;
						ABv[ id2 ] = W13v[ idx ];
						ABv[ id2 + 1 ] = W13v[ idx + 1 ];
					}
				}
			}
		} else {
			// Last panel: just adjust IPIV
			for ( i = j; i < j + jb; i++ ) {
				IPIV[ offsetIPIV + (i * strideIPIV) ] += j;
			}
		}

		// Undo the panel-local swaps and copy WORK31 back into AB
		for ( jj = j + jb - 1; jj >= j; jj-- ) {
			jp = IPIV[ offsetIPIV + (jj * strideIPIV) ] - jj;
			if ( jp !== 0 ) {
				if ( jp + jj < j + kl ) {
					// Swap within band
					zswap( jj - j, AB, sa2 - sa1, offsetAB + (( kv + jj - j ) * sa1) + (j * sa2), AB, sa2 - sa1, offsetAB + (( kv + jp + jj - j ) * sa1) + (j * sa2) );
				} else {
					// Swap with WORK31
					zswap( jj - j, AB, sa2 - sa1, offsetAB + (( kv + jj - j ) * sa1) + (j * sa2), WORK31, LDWORK, ( jp + jj - j - kl ) * 1 );
				}
			}

			// Copy WORK31 column back into AB
			nw = Math.min( i3, jj - j + 1 );
			if ( nw > 0 ) {
				zcopy( nw, WORK31, 1, (( jj - j ) * LDWORK), AB, sa1, offsetAB + (( kv + kl - jj + j ) * sa1) + (jj * sa2) );
			}
		}
	}

	return info;
}


// EXPORTS //

export default zgbtrf;
