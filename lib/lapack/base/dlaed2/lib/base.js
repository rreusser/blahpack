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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, max-lines, no-mixed-operators */

// MODULES //

import dscal from './../../../../blas/base/dscal/lib/base.js';
import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import drot from './../../../../blas/base/drot/lib/base.js';
import idamax from './../../../../blas/base/idamax/lib/base.js';
import dlacpy from './../../dlacpy/lib/base.js';
import dlamrg from './../../dlamrg/lib/base.js';
import dlapy2 from './../../dlapy2/lib/base.js';
import dlamch from './../../dlamch/lib/base.js';


// VARIABLES //

var EIGHT = 8.0;
var TWO = 2.0;
var ONE = 1.0;
var ZERO = 0.0;
var MONE = -1.0;
var EPS = dlamch( 'epsilon' );
var SQRT2INV = ONE / Math.sqrt( TWO );


// MAIN //

/**
* Merges the two sets of eigenvalues together into a single sorted set, then tries to deflate the size of the problem.
*
* Deflation occurs when two or more eigenvalues are close together or if there is a tiny entry in the Z vector. For each such occurrence the order of the related secular equation problem is reduced by one.
*
* ## Notes
*
* -   All index arrays (INDXQ, INDX, INDXC, INDXP) use 1-based values (Fortran convention) since they are internal to the divide-and-conquer eigensolver chain.
* -   COLTYP uses 1-based column types: 1=upper, 2=dense, 3=lower, 4=deflated.
* -   On exit, `COLTYP[0..3]` contains the counts of each column type.
*
* @private
* @param {NonNegativeInteger} N - dimension of the symmetric tridiagonal matrix
* @param {integer} n1 - location of the last eigenvalue in the leading sub-matrix
* @param {Float64Array} d - eigenvalues of the two submatrices (length N), on exit contains trailing N-K deflated eigenvalues sorted in increasing order
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} Q - eigenvectors of two submatrices (N-by-N), on exit trailing N-K columns contain deflated eigenvectors
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {Int32Array} INDXQ - permutation sorting each sub-problem (1-based values, length N)
* @param {integer} strideINDXQ - stride length for `INDXQ`
* @param {NonNegativeInteger} offsetINDXQ - starting index for `INDXQ`
* @param {number} rho - off-diagonal element associated with the rank-1 cut
* @param {Float64Array} z - updating vector (length N)
* @param {integer} strideZ - stride length for `z`
* @param {NonNegativeInteger} offsetZ - starting index for `z`
* @param {Float64Array} DLAMBDA - output: first K eigenvalues for the secular equation (length N)
* @param {integer} strideDLAMBDA - stride length for `DLAMBDA`
* @param {NonNegativeInteger} offsetDLAMBDA - starting index for `DLAMBDA`
* @param {Float64Array} w - output: first K values of the deflation-altered z-vector (length N)
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {Float64Array} Q2 - output: copy of eigenvectors for matrix multiply (length `N1^2 + (N-N1)^2`)
* @param {integer} strideQ21 - stride length for `Q2`
* @param {NonNegativeInteger} offsetQ2 - starting index for `Q2`
* @param {Int32Array} INDX - output: permutation sorting DLAMBDA (1-based, length N)
* @param {integer} strideINDX - stride length for `INDX`
* @param {NonNegativeInteger} offsetINDX - starting index for `INDX`
* @param {Int32Array} INDXC - output: permutation arranging Q columns by type (1-based, length N)
* @param {integer} strideINDXC - stride length for `INDXC`
* @param {NonNegativeInteger} offsetINDXC - starting index for `INDXC`
* @param {Int32Array} INDXP - output: permutation placing deflated values at end (1-based, length N)
* @param {integer} strideINDXP - stride length for `INDXP`
* @param {NonNegativeInteger} offsetINDXP - starting index for `INDXP`
* @param {Int32Array} COLTYP - output: column type labels, on exit `COLTYP[0..3]` = counts of each type (length N)
* @param {integer} strideCOLTYP - stride length for `COLTYP`
* @param {NonNegativeInteger} offsetCOLTYP - starting index for `COLTYP`
* @returns {Object} result object with `info` (0=success), `K` (number of non-deflated eigenvalues), and `rho` (modified rho value)
*/
function dlaed2( N, n1, d, strideD, offsetD, Q, strideQ1, strideQ2, offsetQ, INDXQ, strideINDXQ, offsetINDXQ, rho, z, strideZ, offsetZ, DLAMBDA, strideDLAMBDA, offsetDLAMBDA, w, strideW, offsetW, Q2, strideQ21, offsetQ2, INDX, strideINDX, offsetINDX, INDXC, strideINDXC, offsetINDXC, INDXP, strideINDXP, offsetINDXP, COLTYP, strideCOLTYP, offsetCOLTYP ) {
	var CTOT;
	var done;
	var imax;
	var jmax;
	var n1p1;
	var tol;
	var iq1;
	var iq2;
	var psm;
	var tau;
	var ct;
	var k2;
	var n2;
	var nj;
	var pj;
	var js;
	var K;
	var c;
	var i;
	var j;
	var s;
	var t;

	// Quick return if possible...
	if ( N === 0 ) {
		return {
			'info': 0,
			'K': 0,
			'rho': rho
		};
	}

	n2 = N - n1;
	n1p1 = n1 + 1;

	// If rho < 0, negate z in the second half...
	if ( rho < ZERO ) {
		dscal( n2, MONE, z, strideZ, offsetZ + ( n1 * strideZ ) );
	}

	// Normalize z so that norm(z) = 1 (since z is the concatenation of two normalized vectors, norm2(z) = sqrt(2))...
	dscal( N, SQRT2INV, z, strideZ, offsetZ );

	// RHO = ABS( norm(z)**2 * RHO )
	rho = Math.abs( TWO * rho );

	// Sort the eigenvalues into increasing order:

	// Add n1 to INDXQ values in the second half (converting to global indices)...
	for ( i = n1p1; i <= N; i += 1 ) {
		INDXQ[ offsetINDXQ + ( i - 1 ) * strideINDXQ ] += n1;
	}

	// Re-integrate the deflated parts from the last pass...
	for ( i = 1; i <= N; i += 1 ) {
		DLAMBDA[ offsetDLAMBDA + ( i - 1 ) * strideDLAMBDA ] = d[ offsetD + ( INDXQ[ offsetINDXQ + ( i - 1 ) * strideINDXQ ] - 1 ) * strideD ];
	}

	// Merge-sort: merge the two sorted halves into INDXC (dlamrg outputs 1-based indices)...
	dlamrg( n1, n2, DLAMBDA, strideDLAMBDA, offsetDLAMBDA, 1, 1, INDXC, strideINDXC, offsetINDXC );

	// Build the final sorted index: INDX(I) = INDXQ( INDXC(I) )...
	for ( i = 1; i <= N; i += 1 ) {
		INDX[ offsetINDX + ( i - 1 ) * strideINDX ] = INDXQ[ offsetINDXQ + ( INDXC[ offsetINDXC + ( i - 1 ) * strideINDXC ] - 1 ) * strideINDXQ ];
	}

	// Calculate the allowable deflation tolerance...
	imax = idamax( N, z, strideZ, offsetZ );
	jmax = idamax( N, d, strideD, offsetD );
	tol = EIGHT * EPS * Math.max( Math.abs( d[ offsetD + jmax * strideD ] ), Math.abs( z[ offsetZ + imax * strideZ ] ) );

	// If the rank-1 modifier is small enough, just reorganize Q so columns correspond with elements in D...
	if ( rho * Math.abs( z[ offsetZ + imax * strideZ ] ) <= tol ) {
		K = 0;
		iq2 = 0;
		for ( j = 1; j <= N; j += 1 ) {
			i = INDX[ offsetINDX + ( j - 1 ) * strideINDX ];

			// Copy column i of Q into Q2...
			dcopy( N, Q, strideQ1, offsetQ + ( i - 1 ) * strideQ2, Q2, strideQ21, offsetQ2 + iq2 );
			DLAMBDA[ offsetDLAMBDA + ( j - 1 ) * strideDLAMBDA ] = d[ offsetD + ( i - 1 ) * strideD ];
			iq2 += N * strideQ21;
		}

		// Copy Q2 back into Q...
		dlacpy( 'full', N, N, Q2, strideQ21, N * strideQ21, offsetQ2, Q, strideQ1, strideQ2, offsetQ );

		// Copy DLAMBDA into D...
		dcopy( N, DLAMBDA, strideDLAMBDA, offsetDLAMBDA, d, strideD, offsetD );

		return {
			'info': 0,
			'K': 0,
			'rho': rho
		};
	}

	// Initialize COLTYP: 1 for upper half, 3 for lower half...
	for ( i = 1; i <= n1; i += 1 ) {
		COLTYP[ offsetCOLTYP + ( i - 1 ) * strideCOLTYP ] = 1;
	}
	for ( i = n1p1; i <= N; i += 1 ) {
		COLTYP[ offsetCOLTYP + ( i - 1 ) * strideCOLTYP ] = 3;
	}

	// Main deflation loop:
	// First, scan through sorted eigenvalues to find the first non-deflated one...
	K = 0;
	k2 = N + 1;
	pj = -1;
	done = false;

	for ( j = 1; j <= N; j += 1 ) {
		nj = INDX[ offsetINDX + ( j - 1 ) * strideINDX ];
		if ( rho * Math.abs( z[ offsetZ + ( nj - 1 ) * strideZ ] ) <= tol ) {
			// Deflate due to small z component...
			k2 -= 1;
			COLTYP[ offsetCOLTYP + ( nj - 1 ) * strideCOLTYP ] = 4;
			INDXP[ offsetINDXP + ( k2 - 1 ) * strideINDXP ] = nj;
			if ( j === N ) {
				done = true;
			}
		} else {
			pj = nj;
			break;
		}
	}

	// If all eigenvalues were deflated in the initial scan, jump to recording the last eigenvalue...
	if ( !done && pj >= 0 ) {
		// Process remaining eigenvalues (the while loop replacing labels 80-100)...
		j += 1;
		while ( j <= N ) {
			nj = INDX[ offsetINDX + ( j - 1 ) * strideINDX ];
			if ( rho * Math.abs( z[ offsetZ + ( nj - 1 ) * strideZ ] ) <= tol ) {
				// Deflate due to small z component...
				k2 -= 1;
				COLTYP[ offsetCOLTYP + ( nj - 1 ) * strideCOLTYP ] = 4;
				INDXP[ offsetINDXP + ( k2 - 1 ) * strideINDXP ] = nj;
			} else {
				// Check if eigenvalues are close enough to allow deflation...
				s = z[ offsetZ + ( pj - 1 ) * strideZ ];
				c = z[ offsetZ + ( nj - 1 ) * strideZ ];

				// Find sqrt(a**2 + b**2) without overflow or destructive underflow...
				tau = dlapy2( c, s );
				t = d[ offsetD + ( nj - 1 ) * strideD ] - d[ offsetD + ( pj - 1 ) * strideD ];
				c /= tau;
				s = -s / tau;

				if ( Math.abs( t * c * s ) <= tol ) {
					// Deflation is possible...
					z[ offsetZ + ( nj - 1 ) * strideZ ] = tau;
					z[ offsetZ + ( pj - 1 ) * strideZ ] = ZERO;

					if ( COLTYP[ offsetCOLTYP + ( nj - 1 ) * strideCOLTYP ] !== COLTYP[ offsetCOLTYP + ( pj - 1 ) * strideCOLTYP ] ) {
						COLTYP[ offsetCOLTYP + ( nj - 1 ) * strideCOLTYP ] = 2;
					}
					COLTYP[ offsetCOLTYP + ( pj - 1 ) * strideCOLTYP ] = 4;

					// Apply rotation to columns pj and nj of Q...
					drot( N, Q, strideQ1, offsetQ + ( pj - 1 ) * strideQ2, Q, strideQ1, offsetQ + ( nj - 1 ) * strideQ2, c, s );

					// Update eigenvalues...
					t = d[ offsetD + ( pj - 1 ) * strideD ] * c * c + d[ offsetD + ( nj - 1 ) * strideD ] * s * s;
					d[ offsetD + ( nj - 1 ) * strideD ] = d[ offsetD + ( pj - 1 ) * strideD ] * s * s + d[ offsetD + ( nj - 1 ) * strideD ] * c * c;
					d[ offsetD + ( pj - 1 ) * strideD ] = t;

					// Insert pj into the sorted deflated portion (insertion sort)...
					k2 -= 1;
					i = 1;
					while ( k2 + i <= N ) {
						if ( d[ offsetD + ( pj - 1 ) * strideD ] < d[ offsetD + ( INDXP[ offsetINDXP + ( k2 + i - 1 ) * strideINDXP ] - 1 ) * strideD ] ) {
							INDXP[ offsetINDXP + ( k2 + i - 2 ) * strideINDXP ] = INDXP[ offsetINDXP + ( k2 + i - 1 ) * strideINDXP ];
							INDXP[ offsetINDXP + ( k2 + i - 1 ) * strideINDXP ] = pj;
							i += 1;
						} else {
							INDXP[ offsetINDXP + ( k2 + i - 2 ) * strideINDXP ] = pj;
							break;
						}
					}
					if ( k2 + i > N ) {
						INDXP[ offsetINDXP + ( k2 + i - 2 ) * strideINDXP ] = pj;
					}
					pj = nj;
				} else {
					// No deflation: record this eigenvalue...
					K += 1;
					DLAMBDA[ offsetDLAMBDA + ( K - 1 ) * strideDLAMBDA ] = d[ offsetD + ( pj - 1 ) * strideD ];
					w[ offsetW + ( K - 1 ) * strideW ] = z[ offsetZ + ( pj - 1 ) * strideZ ];
					INDXP[ offsetINDXP + ( K - 1 ) * strideINDXP ] = pj;
					pj = nj;
				}
			}
			j += 1;
		}

		// Record the last eigenvalue...
		K += 1;
		DLAMBDA[ offsetDLAMBDA + ( K - 1 ) * strideDLAMBDA ] = d[ offsetD + ( pj - 1 ) * strideD ];
		w[ offsetW + ( K - 1 ) * strideW ] = z[ offsetZ + ( pj - 1 ) * strideZ ];
		INDXP[ offsetINDXP + ( K - 1 ) * strideINDXP ] = pj;
	} else {
		// All eigenvalues were deflated in the initial scan (or no non-deflated eigenvalue was found)
		K = 0;
	}

	// Count column types...
	CTOT = [ 0, 0, 0, 0 ];
	for ( j = 1; j <= N; j += 1 ) {
		ct = COLTYP[ offsetCOLTYP + ( j - 1 ) * strideCOLTYP ];
		CTOT[ ct - 1 ] += 1;
	}

	// PSM = Position in SubMatrix (of types 1 through 4)...
	psm = [ 1, 1 + CTOT[ 0 ], 1 + CTOT[ 0 ] + CTOT[ 1 ], 1 + CTOT[ 0 ] + CTOT[ 1 ] + CTOT[ 2 ] ];

	// Recompute K from column type counts...
	K = N - CTOT[ 3 ];

	// Fill out the INDXC array so that the permutation places all type-1 first, type-2 next, type-3, then type-4...
	for ( j = 1; j <= N; j += 1 ) {
		js = INDXP[ offsetINDXP + ( j - 1 ) * strideINDXP ];
		ct = COLTYP[ offsetCOLTYP + ( js - 1 ) * strideCOLTYP ];
		INDX[ offsetINDX + ( psm[ ct - 1 ] - 1 ) * strideINDX ] = js;
		INDXC[ offsetINDXC + ( psm[ ct - 1 ] - 1 ) * strideINDXC ] = j;
		psm[ ct - 1 ] += 1;
	}

	// Sort eigenvalues and eigenvectors into DLAMBDA and Q2:
	// Type-1 columns (upper half only)...
	i = 1;
	iq1 = 0;
	iq2 = ( CTOT[ 0 ] + CTOT[ 1 ] ) * n1 * strideQ21;

	for ( j = 0; j < CTOT[ 0 ]; j += 1 ) {
		js = INDX[ offsetINDX + ( i - 1 ) * strideINDX ];
		dcopy( n1, Q, strideQ1, offsetQ + ( js - 1 ) * strideQ2, Q2, strideQ21, offsetQ2 + iq1 );
		z[ offsetZ + ( i - 1 ) * strideZ ] = d[ offsetD + ( js - 1 ) * strideD ];
		i += 1;
		iq1 += n1 * strideQ21;
	}

	// Type-2 columns (dense)...
	for ( j = 0; j < CTOT[ 1 ]; j += 1 ) {
		js = INDX[ offsetINDX + ( i - 1 ) * strideINDX ];
		dcopy( n1, Q, strideQ1, offsetQ + ( js - 1 ) * strideQ2, Q2, strideQ21, offsetQ2 + iq1 );
		dcopy( n2, Q, strideQ1, offsetQ + n1 * strideQ1 + ( js - 1 ) * strideQ2, Q2, strideQ21, offsetQ2 + iq2 );
		z[ offsetZ + ( i - 1 ) * strideZ ] = d[ offsetD + ( js - 1 ) * strideD ];
		i += 1;
		iq1 += n1 * strideQ21;
		iq2 += n2 * strideQ21;
	}

	// Type-3 columns (lower half only)...
	for ( j = 0; j < CTOT[ 2 ]; j += 1 ) {
		js = INDX[ offsetINDX + ( i - 1 ) * strideINDX ];
		dcopy( n2, Q, strideQ1, offsetQ + n1 * strideQ1 + ( js - 1 ) * strideQ2, Q2, strideQ21, offsetQ2 + iq2 );
		z[ offsetZ + ( i - 1 ) * strideZ ] = d[ offsetD + ( js - 1 ) * strideD ];
		i += 1;
		iq2 += n2 * strideQ21;
	}

	// Type-4 columns (deflated - full copy)...
	iq1 = iq2;
	for ( j = 0; j < CTOT[ 3 ]; j += 1 ) {
		js = INDX[ offsetINDX + ( i - 1 ) * strideINDX ];
		dcopy( N, Q, strideQ1, offsetQ + ( js - 1 ) * strideQ2, Q2, strideQ21, offsetQ2 + iq2 );
		iq2 += N * strideQ21;
		z[ offsetZ + ( i - 1 ) * strideZ ] = d[ offsetD + ( js - 1 ) * strideD ];
		i += 1;
	}

	// The deflated eigenvalues and their corresponding vectors go back into the last N-K slots of D and Q...
	if ( K < N ) {
		dlacpy( 'full', N, CTOT[ 3 ], Q2, strideQ21, N * strideQ21, offsetQ2 + iq1, Q, strideQ1, strideQ2, offsetQ + K * strideQ2 );
		dcopy( N - K, z, strideZ, offsetZ + K * strideZ, d, strideD, offsetD + K * strideD );
	}

	// Copy CTOT into COLTYP for referencing in dlaed3...
	for ( j = 0; j < 4; j += 1 ) {
		COLTYP[ offsetCOLTYP + j * strideCOLTYP ] = CTOT[ j ];
	}

	return {
		'info': 0,
		'K': K,
		'rho': rho
	};
}


// EXPORTS //

export default dlaed2;
