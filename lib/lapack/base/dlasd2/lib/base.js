/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, max-lines, no-mixed-operators */

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

// MODULES //

import EPSILON from '@stdlib/constants/float64/eps/lib/index.js';
import abs from '@stdlib/math/base/special/abs/lib/index.js';
import max from '@stdlib/math/base/special/max/lib/index.js';
import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dlacpy from './../../../base/dlacpy/lib/base.js';
import dlamrg from './../../../base/dlamrg/lib/base.js';
import dlapy2 from './../../../base/dlapy2/lib/base.js';
import dlaset from './../../../base/dlaset/lib/base.js';
import drot from './../../../../blas/base/drot/lib/base.js';


// MAIN //

/**
* Merges the two sets of singular values together into a single sorted set, then tries to deflate the size of the problem.
*
* There are two ways deflation can occur: when two or more singular values are close together, or if there is a tiny entry in the Z vector. For each such occurrence the order of the related secular equation problem is reduced by one.
*
* ## Notes
*
* -   Uses 1-based internal indexing to match Fortran index arithmetic.
* -   `K` is an output array; `K[0]` is set to the dimension of the non-deflated matrix.
* -   IDXP, IDX, IDXC, IDXQ, COLTYP use 1-based values (Fortran convention) internally.
*
* @private
* @param {integer} nl - row dimension of the upper block (>= 1)
* @param {integer} nr - row dimension of the lower block (>= 1)
* @param {integer} sqre - 0 if lower block is square, 1 if rectangular
* @param {Int32Array} K - output array; `K[0]` set to dimension of non-deflated matrix
* @param {Float64Array} d - singular values array of dimension N
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} z - output updating row vector of dimension N
* @param {integer} strideZ - stride length for `z`
* @param {NonNegativeInteger} offsetZ - starting index for `z`
* @param {number} alpha - diagonal element associated with the added row
* @param {number} beta - off-diagonal element associated with the added row
* @param {Float64Array} U - left singular vector matrix (N x N)
* @param {integer} strideU1 - stride of the first dimension of `U`
* @param {integer} strideU2 - stride of the second dimension of `U`
* @param {NonNegativeInteger} offsetU - starting index for `U`
* @param {Float64Array} VT - right singular vector matrix (M x M)
* @param {integer} strideVT1 - stride of the first dimension of `VT`
* @param {integer} strideVT2 - stride of the second dimension of `VT`
* @param {NonNegativeInteger} offsetVT - starting index for `VT`
* @param {Float64Array} DSIGMA - output singular values for secular equation
* @param {integer} strideDSIGMA - stride length for `DSIGMA`
* @param {NonNegativeInteger} offsetDSIGMA - starting index for `DSIGMA`
* @param {Float64Array} U2 - output left singular vectors copy
* @param {integer} strideU21 - stride of the first dimension of `U2`
* @param {integer} strideU22 - stride of the second dimension of `U2`
* @param {NonNegativeInteger} offsetU2 - starting index for `U2`
* @param {Float64Array} VT2 - output right singular vectors copy
* @param {integer} strideVT21 - stride of the first dimension of `VT2`
* @param {integer} strideVT22 - stride of the second dimension of `VT2`
* @param {NonNegativeInteger} offsetVT2 - starting index for `VT2`
* @param {Int32Array} IDXP - output permutation array
* @param {integer} strideIDXP - stride length for `IDXP`
* @param {NonNegativeInteger} offsetIDXP - starting index for `IDXP`
* @param {Int32Array} IDX - output permutation for sorting
* @param {integer} strideIDX - stride length for `IDX`
* @param {NonNegativeInteger} offsetIDX - starting index for `IDX`
* @param {Int32Array} IDXC - output column type permutation
* @param {integer} strideIDXC - stride length for `IDXC`
* @param {NonNegativeInteger} offsetIDXC - starting index for `IDXC`
* @param {Int32Array} IDXQ - input/output sub-problem sorting permutation
* @param {integer} strideIDXQ - stride length for `IDXQ`
* @param {NonNegativeInteger} offsetIDXQ - starting index for `IDXQ`
* @param {Int32Array} COLTYP - output column type array (on exit, first 4 entries are type counts)
* @param {integer} strideCOLTYP - stride length for `COLTYP`
* @param {NonNegativeInteger} offsetCOLTYP - starting index for `COLTYP`
* @returns {integer} info - 0 on success, negative value on illegal argument
*/
function dlasd2( nl, nr, sqre, K, d, strideD, offsetD, z, strideZ, offsetZ, alpha, beta, U, strideU1, strideU2, offsetU, VT, strideVT1, strideVT2, offsetVT, DSIGMA, strideDSIGMA, offsetDSIGMA, U2, strideU21, strideU22, offsetU2, VT2, strideVT21, strideVT22, offsetVT2, IDXP, strideIDXP, offsetIDXP, IDX, strideIDX, offsetIDX, IDXC, strideIDXC, offsetIDXC, IDXQ, strideIDXQ, offsetIDXQ, COLTYP, strideCOLTYP, offsetCOLTYP ) {
	var hlftol;
	var idxjp;
	var jprev;
	var ctot;
	var idxj;
	var idxi;
	var nlp1;
	var nlp2;
	var tau;
	var tol;
	var psm;
	var eps;
	var ct;
	var jp;
	var z1;
	var k2;
	var kk;
	var n;
	var m;
	var c;
	var s;
	var i;
	var j;

	// Use 1-based internal indexing to match Fortran.

	// Helper: access 1-based arrays via offset + (I-1)*stride

	n = nl + nr + 1;
	m = n + sqre;

	nlp1 = nl + 1;
	nlp2 = nl + 2;

	// Generate the first part of the vector Z; and move the singular

	// Values in the first part of D one position backward.

	// Fortran: Z1 = ALPHA*VT(NLP1, NLP1) — 1-based row/col
	z1 = alpha * VT[ offsetVT + (nlp1 - 1) * strideVT1 + (nlp1 - 1) * strideVT2 ];
	z[ offsetZ ] = z1; // Z(1)

	for ( i = nl; i >= 1; i -= 1 ) {
		// Z(I+1) = ALPHA*VT(I, NLP1)
		z[ offsetZ + i * strideZ ] = alpha * VT[ offsetVT + (i - 1) * strideVT1 + (nlp1 - 1) * strideVT2 ];

		// D(I+1) = D(I)
		d[ offsetD + i * strideD ] = d[ offsetD + (i - 1) * strideD ];

		// IDXQ(I+1) = IDXQ(I) + 1
		IDXQ[ offsetIDXQ + i * strideIDXQ ] = IDXQ[ offsetIDXQ + (i - 1) * strideIDXQ ] + 1;
	}

	// Generate the second part of the vector Z.
	// Fortran: DO I = NLP2, M: Z(I) = BETA*VT(I, NLP2)
	for ( i = nlp2; i <= m; i += 1 ) {
		z[ offsetZ + (i - 1) * strideZ ] = beta * VT[ offsetVT + (i - 1) * strideVT1 + (nlp2 - 1) * strideVT2 ];
	}

	// Initialize reference arrays.
	// Fortran: DO I = 2, NLP1: COLTYP(I) = 1
	for ( i = 2; i <= nlp1; i += 1 ) {
		COLTYP[ offsetCOLTYP + (i - 1) * strideCOLTYP ] = 1;
	}
	// Fortran: DO I = NLP2, N: COLTYP(I) = 2
	for ( i = nlp2; i <= n; i += 1 ) {
		COLTYP[ offsetCOLTYP + (i - 1) * strideCOLTYP ] = 2;
	}

	// Sort the singular values into increasing order.
	// Fortran: DO I = NLP2, N: IDXQ(I) = IDXQ(I) + NLP1
	for ( i = nlp2; i <= n; i += 1 ) {
		IDXQ[ offsetIDXQ + (i - 1) * strideIDXQ ] += nlp1;
	}

	// DSIGMA, IDXC, and the first column of U2 are used as storage space.
	// Fortran: DO I = 2, N
	for ( i = 2; i <= n; i += 1 ) {
		// DSIGMA(I) = D(IDXQ(I))
		DSIGMA[ offsetDSIGMA + (i - 1) * strideDSIGMA ] = d[ offsetD + (IDXQ[ offsetIDXQ + (i - 1) * strideIDXQ ] - 1) * strideD ];

		// U2(I, 1) = Z(IDXQ(I))
		U2[ offsetU2 + (i - 1) * strideU21 ] = z[ offsetZ + (IDXQ[ offsetIDXQ + (i - 1) * strideIDXQ ] - 1) * strideZ ];

		// IDXC(I) = COLTYP(IDXQ(I))
		IDXC[ offsetIDXC + (i - 1) * strideIDXC ] = COLTYP[ offsetCOLTYP + (IDXQ[ offsetIDXQ + (i - 1) * strideIDXQ ] - 1) * strideCOLTYP ];
	}

	// CALL DLAMRG(NL, NR, DSIGMA(2), 1, 1, IDX(2))
	// dlamrg: output INDEX values are 1-based
	dlamrg( nl, nr, DSIGMA, strideDSIGMA, offsetDSIGMA + strideDSIGMA, 1, 1, IDX, strideIDX, offsetIDX + strideIDX );

	// Fortran: DO I = 2, N
	for ( i = 2; i <= n; i += 1 ) {
		// IDXI = 1 + IDX(I)
		idxi = 1 + IDX[ offsetIDX + (i - 1) * strideIDX ];

		// D(I) = DSIGMA(IDXI)
		d[ offsetD + (i - 1) * strideD ] = DSIGMA[ offsetDSIGMA + (idxi - 1) * strideDSIGMA ];

		// Z(I) = U2(IDXI, 1)
		z[ offsetZ + (i - 1) * strideZ ] = U2[ offsetU2 + (idxi - 1) * strideU21 ];

		// COLTYP(I) = IDXC(IDXI)
		COLTYP[ offsetCOLTYP + (i - 1) * strideCOLTYP ] = IDXC[ offsetIDXC + (idxi - 1) * strideIDXC ];
	}

	// Calculate the allowable deflation tolerance.
	eps = EPSILON;
	tol = max( abs( alpha ), abs( beta ) );
	tol = 8.0 * eps * max( abs( d[ offsetD + (n - 1) * strideD ] ), tol );

	// Deflation loop.

	// There are 2 kinds of deflation:

	// 1. Small z component

	// 2. Close singular values

	kk = 1;
	k2 = n + 1;

	// First pass: find first non-deflated entry (Fortran labels 80, 90).
	jprev = 0;
	for ( j = 2; j <= n; j += 1 ) {
		if ( abs( z[ offsetZ + (j - 1) * strideZ ] ) <= tol ) {
			// Deflate due to small z component.
			k2 -= 1;
			IDXP[ offsetIDXP + (k2 - 1) * strideIDXP ] = j;
			COLTYP[ offsetCOLTYP + (j - 1) * strideCOLTYP ] = 4;
			if ( j === n ) {
				// All remaining entries deflated; jump directly to label 120.
				// K stays at 1 — no non-deflated entry to record.
				jprev = -1; // sentinel: all deflated
				break;
			}
		} else {
			jprev = j;
			break;
		}
	}

	// Main deflation loop (Fortran labels 90-110).
	if ( jprev > 0 ) {
		j = jprev;
		while ( true ) {
			j += 1;
			if ( j > n ) {
				break;
			}
			if ( abs( z[ offsetZ + (j - 1) * strideZ ] ) <= tol ) {
				// Deflate due to small z component.
				k2 -= 1;
				IDXP[ offsetIDXP + (k2 - 1) * strideIDXP ] = j;
				COLTYP[ offsetCOLTYP + (j - 1) * strideCOLTYP ] = 4;
			} else if ( abs( d[ offsetD + (j - 1) * strideD ] - d[ offsetD + (jprev - 1) * strideD ] ) <= tol ) {
				// Check if singular values are close enough to allow deflation.
				// Deflation is possible.
				s = z[ offsetZ + (jprev - 1) * strideZ ];
				c = z[ offsetZ + (j - 1) * strideZ ];

				// Find sqrt(a^2 + b^2) without overflow.
				tau = dlapy2( c, s );
				c /= tau;
				s = -s / tau;
				z[ offsetZ + (j - 1) * strideZ ] = tau;
				z[ offsetZ + (jprev - 1) * strideZ ] = 0.0;

				// Apply the Givens rotation to U and VT.

				// Fortran: IDXJP = IDXQ(IDX(JPREV)+1)
				idxjp = IDXQ[ offsetIDXQ + IDX[ offsetIDX + (jprev - 1) * strideIDX ] * strideIDXQ ];

				// Fortran: IDXJ = IDXQ(IDX(J)+1)
				idxj = IDXQ[ offsetIDXQ + IDX[ offsetIDX + (j - 1) * strideIDX ] * strideIDXQ ];

				if ( idxjp <= nlp1 ) {
					idxjp -= 1;
				}
				if ( idxj <= nlp1 ) {
					idxj -= 1;
				}

				// CALL DROT(N, U(1,IDXJP), 1, U(1,IDXJ), 1, C, S)
				drot( n, U, strideU1, offsetU + (idxjp - 1) * strideU2, U, strideU1, offsetU + (idxj - 1) * strideU2, c, s );

				// CALL DROT(M, VT(IDXJP,1), LDVT, VT(IDXJ,1), LDVT, C, S)
				drot( m, VT, strideVT2, offsetVT + (idxjp - 1) * strideVT1, VT, strideVT2, offsetVT + (idxj - 1) * strideVT1, c, s );

				if ( COLTYP[ offsetCOLTYP + (j - 1) * strideCOLTYP ] !== COLTYP[ offsetCOLTYP + (jprev - 1) * strideCOLTYP ] ) {
					COLTYP[ offsetCOLTYP + (j - 1) * strideCOLTYP ] = 3;
				}
				COLTYP[ offsetCOLTYP + (jprev - 1) * strideCOLTYP ] = 4;
				k2 -= 1;
				IDXP[ offsetIDXP + (k2 - 1) * strideIDXP ] = jprev;
				jprev = j;
			} else {
				kk += 1;
				U2[ offsetU2 + (kk - 1) * strideU21 ] = z[ offsetZ + (jprev - 1) * strideZ ];
				DSIGMA[ offsetDSIGMA + (kk - 1) * strideDSIGMA ] = d[ offsetD + (jprev - 1) * strideD ];
				IDXP[ offsetIDXP + (kk - 1) * strideIDXP ] = jprev;
				jprev = j;
			}
		}

		// Record the last singular value (label 110).
		kk += 1;
		U2[ offsetU2 + (kk - 1) * strideU21 ] = z[ offsetZ + (jprev - 1) * strideZ ];
		DSIGMA[ offsetDSIGMA + (kk - 1) * strideDSIGMA ] = d[ offsetD + (jprev - 1) * strideD ];
		IDXP[ offsetIDXP + (kk - 1) * strideIDXP ] = jprev;
	}

	// Label 120: Count column types and form permutation.
	ctot = [ 0, 0, 0, 0 ];
	for ( j = 2; j <= n; j += 1 ) {
		ct = COLTYP[ offsetCOLTYP + (j - 1) * strideCOLTYP ];
		ctot[ ct - 1 ] += 1;
	}

	// PSM(*) = Position in SubMatrix (of types 1 through 4).
	psm = [ 2, 2 + ctot[ 0 ], 2 + ctot[ 0 ] + ctot[ 1 ], 2 + ctot[ 0 ] + ctot[ 1 ] + ctot[ 2 ] ];

	// Fill out the IDXC array.
	for ( j = 2; j <= n; j += 1 ) {
		jp = IDXP[ offsetIDXP + (j - 1) * strideIDXP ];
		ct = COLTYP[ offsetCOLTYP + (jp - 1) * strideCOLTYP ];
		IDXC[ offsetIDXC + (psm[ ct - 1 ] - 1) * strideIDXC ] = j;
		psm[ ct - 1 ] += 1;
	}

	// Sort singular values and vectors into DSIGMA, U2, and VT2.
	for ( j = 2; j <= n; j += 1 ) {
		jp = IDXP[ offsetIDXP + (j - 1) * strideIDXP ];
		DSIGMA[ offsetDSIGMA + (j - 1) * strideDSIGMA ] = d[ offsetD + (jp - 1) * strideD ];

		// IDXJ = IDXQ(IDX(IDXP(IDXC(J)))+1)
		idxj = IDXQ[ offsetIDXQ + IDX[ offsetIDX + (IDXP[ offsetIDXP + (IDXC[ offsetIDXC + (j - 1) * strideIDXC ] - 1) * strideIDXP ] - 1) * strideIDX ] * strideIDXQ ];
		if ( idxj <= nlp1 ) {
			idxj -= 1;
		}

		// CALL DCOPY(N, U(1,IDXJ), 1, U2(1,J), 1)
		dcopy( n, U, strideU1, offsetU + (idxj - 1) * strideU2, U2, strideU21, offsetU2 + (j - 1) * strideU22 );

		// CALL DCOPY(M, VT(IDXJ,1), LDVT, VT2(J,1), LDVT2)
		dcopy( m, VT, strideVT2, offsetVT + (idxj - 1) * strideVT1, VT2, strideVT22, offsetVT2 + (j - 1) * strideVT21 );
	}

	// Determine DSIGMA(1), DSIGMA(2), and Z(1).
	DSIGMA[ offsetDSIGMA ] = 0.0;
	hlftol = tol / 2.0;
	if ( abs( DSIGMA[ offsetDSIGMA + strideDSIGMA ] ) <= hlftol ) {
		DSIGMA[ offsetDSIGMA + strideDSIGMA ] = hlftol;
	}
	if ( m > n ) {
		z[ offsetZ ] = dlapy2( z1, z[ offsetZ + (m - 1) * strideZ ] );
		if ( z[ offsetZ ] <= tol ) {
			c = 1.0;
			s = 0.0;
			z[ offsetZ ] = tol;
		} else {
			c = z1 / z[ offsetZ ];
			s = z[ offsetZ + (m - 1) * strideZ ] / z[ offsetZ ];
		}
	} else if ( abs( z1 ) <= tol ) {
		z[ offsetZ ] = tol;
	} else {
		z[ offsetZ ] = z1;
	}

	// Move the rest of the updating row to Z.
	// CALL DCOPY(K-1, U2(2,1), 1, Z(2), 1)
	dcopy( kk - 1, U2, strideU21, offsetU2 + strideU21, z, strideZ, offsetZ + strideZ );

	// Determine the first column of U2, the first row of VT2, and the last row of VT.

	// CALL DLASET('A', N, 1, ZERO, ZERO, U2, LDU2)
	dlaset( 'full', n, 1, 0.0, 0.0, U2, strideU21, strideU22, offsetU2 );

	// U2(NLP1, 1) = ONE
	U2[ offsetU2 + (nlp1 - 1) * strideU21 ] = 1.0;

	if ( m > n ) {
		for ( i = 1; i <= nlp1; i += 1 ) {
			// VT(M, I) = -S*VT(NLP1, I)
			VT[ offsetVT + (m - 1) * strideVT1 + (i - 1) * strideVT2 ] = -s * VT[ offsetVT + (nlp1 - 1) * strideVT1 + (i - 1) * strideVT2 ];

			// VT2(1, I) = C*VT(NLP1, I)
			VT2[ offsetVT2 + (i - 1) * strideVT22 ] = c * VT[ offsetVT + (nlp1 - 1) * strideVT1 + (i - 1) * strideVT2 ];
		}
		for ( i = nlp2; i <= m; i += 1 ) {
			// VT2(1, I) = S*VT(M, I)
			VT2[ offsetVT2 + (i - 1) * strideVT22 ] = s * VT[ offsetVT + (m - 1) * strideVT1 + (i - 1) * strideVT2 ];

			// VT(M, I) = C*VT(M, I)
			VT[ offsetVT + (m - 1) * strideVT1 + (i - 1) * strideVT2 ] = c * VT[ offsetVT + (m - 1) * strideVT1 + (i - 1) * strideVT2 ];
		}
	} else {
		// CALL DCOPY(M, VT(NLP1,1), LDVT, VT2(1,1), LDVT2)
		dcopy( m, VT, strideVT2, offsetVT + (nlp1 - 1) * strideVT1, VT2, strideVT22, offsetVT2 );
	}
	if ( m > n ) {
		// CALL DCOPY(M, VT(M,1), LDVT, VT2(M,1), LDVT2)
		dcopy( m, VT, strideVT2, offsetVT + (m - 1) * strideVT1, VT2, strideVT22, offsetVT2 + (m - 1) * strideVT21 );
	}

	// Copy deflated singular values and vectors back.
	if ( n > kk ) {
		// CALL DCOPY(N-K, DSIGMA(K+1), 1, D(K+1), 1)
		dcopy( n - kk, DSIGMA, strideDSIGMA, offsetDSIGMA + kk * strideDSIGMA, d, strideD, offsetD + kk * strideD );

		// CALL DLACPY('A', N, N-K, U2(1,K+1), LDU2, U(1,K+1), LDU)
		dlacpy( 'full', n, n - kk, U2, strideU21, strideU22, offsetU2 + kk * strideU22, U, strideU1, strideU2, offsetU + kk * strideU2 );

		// CALL DLACPY('A', N-K, M, VT2(K+1,1), LDVT2, VT(K+1,1), LDVT)
		dlacpy( 'full', n - kk, m, VT2, strideVT21, strideVT22, offsetVT2 + kk * strideVT21, VT, strideVT1, strideVT2, offsetVT + kk * strideVT1 );
	}

	// Copy CTOT into COLTYP for referencing in DLASD3.
	COLTYP[ offsetCOLTYP ] = ctot[ 0 ];
	COLTYP[ offsetCOLTYP + strideCOLTYP ] = ctot[ 1 ];
	COLTYP[ offsetCOLTYP + 2 * strideCOLTYP ] = ctot[ 2 ];
	COLTYP[ offsetCOLTYP + 3 * strideCOLTYP ] = ctot[ 3 ];

	// Set output K.
	K[ 0 ] = kk;

	return 0;
}


// EXPORTS //

export default dlasd2;
