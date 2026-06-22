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

import abs from '@stdlib/math/base/special/abs/lib/index.js';
import max from '@stdlib/math/base/special/max/lib/index.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import drot from '../../../../blas/base/drot/lib/ndarray.js';
import dlamch from '../../dlamch/lib/base.js';
import dlamrg from '../../dlamrg/lib/base.js';
import dlapy2 from '../../dlapy2/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );


// MAIN //

/**
* Merges the two sets of singular values together into a single sorted set. Then it tries to deflate the size of the problem.
*
* ## Notes
*
* -   There are two ways in which deflation can occur: when two or more singular values are close together or if there is a tiny entry in the Z vector.
* -   For each such occurrence the order of the related secular equation problem is reduced by one.
* -   Called from dlasd6.
* -   Integer index arrays (IDX, IDXP, IDXQ, PERM, GIVCOL) use 1-based indexing internally, matching Fortran convention, as they are part of the divide-and-conquer SVD internal bookkeeping.
*
* @private
* @param {integer} icompq - specifies whether singular vectors are to be computed (0: singular values only, 1: compact form)
* @param {integer} nl - row dimension of the upper block (nl >= 1)
* @param {integer} nr - row dimension of the lower block (nr >= 1)
* @param {integer} sqre - 0: lower block is square; 1: lower block is rectangular
* @param {Float64Array} d - singular values array of dimension N = nl + nr + 1
* @param {integer} strideD - stride for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} z - updating row vector of dimension M = N + sqre
* @param {integer} strideZ - stride for `z`
* @param {NonNegativeInteger} offsetZ - starting index for `z`
* @param {Float64Array} ZW - workspace for z (dimension M)
* @param {integer} strideZW - stride for `ZW`
* @param {NonNegativeInteger} offsetZW - starting index for `ZW`
* @param {Float64Array} VF - first components of right singular vectors (dimension M)
* @param {integer} strideVF - stride for `VF`
* @param {NonNegativeInteger} offsetVF - starting index for `VF`
* @param {Float64Array} VFW - workspace for VF (dimension M)
* @param {integer} strideVFW - stride for `VFW`
* @param {NonNegativeInteger} offsetVFW - starting index for `VFW`
* @param {Float64Array} VL - last components of right singular vectors (dimension M)
* @param {integer} strideVL - stride for `VL`
* @param {NonNegativeInteger} offsetVL - starting index for `VL`
* @param {Float64Array} VLW - workspace for VL (dimension M)
* @param {integer} strideVLW - stride for `VLW`
* @param {NonNegativeInteger} offsetVLW - starting index for `VLW`
* @param {number} alpha - diagonal element associated with the added row
* @param {number} beta - off-diagonal element associated with the added row
* @param {Float64Array} DSIGMA - output array for singular values in secular equation (dimension N)
* @param {integer} strideDSIGMA - stride for `DSIGMA`
* @param {NonNegativeInteger} offsetDSIGMA - starting index for `DSIGMA`
* @param {Int32Array} IDX - permutation to sort D into ascending order (dimension N)
* @param {integer} strideIDX - stride for `IDX`
* @param {NonNegativeInteger} offsetIDX - starting index for `IDX`
* @param {Int32Array} IDXP - permutation to place deflated values at end (dimension N)
* @param {integer} strideIDXP - stride for `IDXP`
* @param {NonNegativeInteger} offsetIDXP - starting index for `IDXP`
* @param {Int32Array} IDXQ - permutation sorting each sub-problem (dimension N)
* @param {integer} strideIDXQ - stride for `IDXQ`
* @param {NonNegativeInteger} offsetIDXQ - starting index for `IDXQ`
* @param {Int32Array} PERM - permutations from deflation and sorting (dimension N, not referenced if icompq=0)
* @param {integer} stridePERM - stride for `PERM`
* @param {NonNegativeInteger} offsetPERM - starting index for `PERM`
* @param {Int32Array} GIVCOL - pairs of columns for Givens rotations (dimension (LDGCOL, 2), not referenced if icompq=0)
* @param {integer} strideGIVCOL1 - first dimension stride for `GIVCOL`
* @param {integer} strideGIVCOL2 - second dimension stride for `GIVCOL`
* @param {NonNegativeInteger} offsetGIVCOL - starting index for `GIVCOL`
* @param {Float64Array} GIVNUM - C and S values for Givens rotations (dimension (LDGNUM, 2), not referenced if icompq=0)
* @param {integer} strideGIVNUM1 - first dimension stride for `GIVNUM`
* @param {integer} strideGIVNUM2 - second dimension stride for `GIVNUM`
* @param {NonNegativeInteger} offsetGIVNUM - starting index for `GIVNUM`
* @returns {Object} object with fields: `info` (0 = success), `K` (dimension of non-deflated matrix), `givptr` (number of Givens rotations), `c` (cosine of Givens rotation for null space), `s` (sine of Givens rotation for null space)
*/
function dlasd7( icompq, nl, nr, sqre, d, strideD, offsetD, z, strideZ, offsetZ, ZW, strideZW, offsetZW, VF, strideVF, offsetVF, VFW, strideVFW, offsetVFW, VL, strideVL, offsetVL, VLW, strideVLW, offsetVLW, alpha, beta, DSIGMA, strideDSIGMA, offsetDSIGMA, IDX, strideIDX, offsetIDX, IDXP, strideIDXP, offsetIDXP, IDXQ, strideIDXQ, offsetIDXQ, PERM, stridePERM, offsetPERM, GIVCOL, strideGIVCOL1, strideGIVCOL2, offsetGIVCOL, GIVNUM, strideGIVNUM1, strideGIVNUM2, offsetGIVNUM ) {
	var givptr;
	var hlftol;
	var jprev;
	var idxjp;
	var idxj;
	var idxi;
	var nlp1;
	var nlp2;
	var tau;
	var tol;
	var K2;
	var z1;
	var jp;
	var K;
	var c;
	var i;
	var j;
	var M;
	var N;
	var s;

	N = nl + nr + 1;
	M = N + sqre;

	// Parameter validation...
	if ( icompq < 0 || icompq > 1 ) {
		return {
			'info': -1,
			'K': 0,
			'givptr': 0,
			'c': 0.0,
			's': 0.0
		};
	}
	if ( nl < 1 ) {
		return {
			'info': -2,
			'K': 0,
			'givptr': 0,
			'c': 0.0,
			's': 0.0
		};
	}
	if ( nr < 1 ) {
		return {
			'info': -3,
			'K': 0,
			'givptr': 0,
			'c': 0.0,
			's': 0.0
		};
	}
	if ( sqre < 0 || sqre > 1 ) {
		return {
			'info': -4,
			'K': 0,
			'givptr': 0,
			'c': 0.0,
			's': 0.0
		};
	}

	// Use 1-based indexing internally (Fortran convention for this divide-and-conquer routine)
	// Array access: arr[ offset + (I-1)*stride ] for 1-based index I

	nlp1 = nl + 1;
	nlp2 = nl + 2;

	givptr = 0;
	c = 0.0;
	s = 0.0;

	// Generate the first part of the vector Z and move the singular

	// Values in the first part of D one position backward.
	z1 = alpha * VL[ offsetVL + ( nlp1 - 1 ) * strideVL ];
	VL[ offsetVL + ( nlp1 - 1 ) * strideVL ] = 0.0;
	tau = VF[ offsetVF + ( nlp1 - 1 ) * strideVF ];

	for ( i = nl; i >= 1; i -= 1 ) {
		z[ offsetZ + i * strideZ ] = alpha * VL[ offsetVL + ( i - 1 ) * strideVL ];
		VL[ offsetVL + ( i - 1 ) * strideVL ] = 0.0;
		VF[ offsetVF + i * strideVF ] = VF[ offsetVF + ( i - 1 ) * strideVF ];
		d[ offsetD + i * strideD ] = d[ offsetD + ( i - 1 ) * strideD ];
		IDXQ[ offsetIDXQ + i * strideIDXQ ] = IDXQ[ offsetIDXQ + ( i - 1 ) * strideIDXQ ] + 1;
	}
	VF[ offsetVF ] = tau;

	// Generate the second part of the vector Z.
	for ( i = nlp2; i <= M; i += 1 ) {
		z[ offsetZ + ( i - 1 ) * strideZ ] = beta * VF[ offsetVF + ( i - 1 ) * strideVF ];
		VF[ offsetVF + ( i - 1 ) * strideVF ] = 0.0;
	}

	// Sort the singular values into increasing order.
	for ( i = nlp2; i <= N; i += 1 ) {
		IDXQ[ offsetIDXQ + ( i - 1 ) * strideIDXQ ] += nlp1;
	}

	// DSIGMA, ZW, VFW, VLW are used as storage space.
	for ( i = 2; i <= N; i += 1 ) {
		DSIGMA[ offsetDSIGMA + ( i - 1 ) * strideDSIGMA ] = d[ offsetD + ( IDXQ[ offsetIDXQ + ( i - 1 ) * strideIDXQ ] - 1 ) * strideD ];
		ZW[ offsetZW + ( i - 1 ) * strideZW ] = z[ offsetZ + ( IDXQ[ offsetIDXQ + ( i - 1 ) * strideIDXQ ] - 1 ) * strideZ ];
		VFW[ offsetVFW + ( i - 1 ) * strideVFW ] = VF[ offsetVF + ( IDXQ[ offsetIDXQ + ( i - 1 ) * strideIDXQ ] - 1 ) * strideVF ];
		VLW[ offsetVLW + ( i - 1 ) * strideVLW ] = VL[ offsetVL + ( IDXQ[ offsetIDXQ + ( i - 1 ) * strideIDXQ ] - 1 ) * strideVL ];
	}

	// Call dlamrg to merge the two sorted sublists.
	// Dlamrg uses 1-based indices for its output and operates on DSIGMA(2:N).
	dlamrg( nl, nr, DSIGMA, strideDSIGMA, offsetDSIGMA + strideDSIGMA, 1, 1, IDX, strideIDX, offsetIDX + strideIDX );

	// Permute into sorted order.
	for ( i = 2; i <= N; i += 1 ) {
		idxi = IDX[ offsetIDX + ( i - 1 ) * strideIDX ] + 1; // 1 + IDX(I) in Fortran: IDX values from dlamrg are 1-based offsets into DSIGMA(2:N), so adding 1 converts to absolute 1-based index
		d[ offsetD + ( i - 1 ) * strideD ] = DSIGMA[ offsetDSIGMA + ( idxi - 1 ) * strideDSIGMA ];
		z[ offsetZ + ( i - 1 ) * strideZ ] = ZW[ offsetZW + ( idxi - 1 ) * strideZW ];
		VF[ offsetVF + ( i - 1 ) * strideVF ] = VFW[ offsetVFW + ( idxi - 1 ) * strideVFW ];
		VL[ offsetVL + ( i - 1 ) * strideVL ] = VLW[ offsetVLW + ( idxi - 1 ) * strideVLW ];
	}

	// Calculate the allowable deflation tolerance.
	tol = max( abs( alpha ), abs( beta ) );
	tol = 8.0 * 8.0 * EPS * max( abs( d[ offsetD + ( N - 1 ) * strideD ] ), tol );

	// Deflation logic. There are 2 kinds:

	// 1) A value in the z-vector is small -> permute to end

	// 2) Two singular values are close -> Givens rotation to zero one z entry

	K = 1;
	K2 = N + 1;

	// First loop: scan from position 2 to N looking for the first non-deflatable entry
	jprev = 0;
	for ( j = 2; j <= N; j += 1 ) {
		if ( abs( z[ offsetZ + ( j - 1 ) * strideZ ] ) <= tol ) {
			// Deflate due to small z component
			K2 -= 1;
			IDXP[ offsetIDXP + ( K2 - 1 ) * strideIDXP ] = j;
			if ( j === N ) {
				// All remaining entries deflated, skip to final section
				jprev = -1; // signal: go directly to label 100
				break;
			}
		} else {
			jprev = j;
			break;
		}
	}

	// Main deflation loop (label 80 in Fortran)
	if ( jprev > 0 ) {
		j = jprev;
		while ( true ) {
			j += 1;
			if ( j > N ) {
				break;
			}
			if ( abs( z[ offsetZ + ( j - 1 ) * strideZ ] ) <= tol ) {
				// Deflate due to small z component
				K2 -= 1;
				IDXP[ offsetIDXP + ( K2 - 1 ) * strideIDXP ] = j;
			} else if ( abs( d[ offsetD + ( j - 1 ) * strideD ] - d[ offsetD + ( jprev - 1 ) * strideD ] ) <= tol ) {
				// Deflation is possible
				s = z[ offsetZ + ( jprev - 1 ) * strideZ ];
				c = z[ offsetZ + ( j - 1 ) * strideZ ];

				// Find sqrt(a**2+b**2) without overflow or destructive underflow
				tau = dlapy2( c, s );
				z[ offsetZ + ( j - 1 ) * strideZ ] = tau;
				z[ offsetZ + ( jprev - 1 ) * strideZ ] = 0.0;
				c /= tau;
				s = -s / tau;

				// Record the appropriate Givens rotation
				if ( icompq === 1 ) {
					givptr += 1;
					idxjp = IDXQ[ offsetIDXQ + ( IDX[ offsetIDX + ( jprev - 1 ) * strideIDX ] ) * strideIDXQ ]; // IDXQ( IDX(JPREV)+1 ) in Fortran
					idxj = IDXQ[ offsetIDXQ + ( IDX[ offsetIDX + ( j - 1 ) * strideIDX ] ) * strideIDXQ ]; // IDXQ( IDX(J)+1 ) in Fortran
					if ( idxjp <= nlp1 ) {
						idxjp -= 1;
					}
					if ( idxj <= nlp1 ) {
						idxj -= 1;
					}
					GIVCOL[ offsetGIVCOL + ( givptr - 1 ) * strideGIVCOL1 + strideGIVCOL2 ] = idxjp; // GIVCOL(GIVPTR, 2)
					GIVCOL[ offsetGIVCOL + ( givptr - 1 ) * strideGIVCOL1 ] = idxj; // GIVCOL(GIVPTR, 1)
					GIVNUM[ offsetGIVNUM + ( givptr - 1 ) * strideGIVNUM1 + strideGIVNUM2 ] = c; // GIVNUM(GIVPTR, 2)
					GIVNUM[ offsetGIVNUM + ( givptr - 1 ) * strideGIVNUM1 ] = s; // GIVNUM(GIVPTR, 1)
				}

				drot( 1, VF, strideVF, offsetVF + ( jprev - 1 ) * strideVF, VF, strideVF, offsetVF + ( j - 1 ) * strideVF, c, s );
				drot( 1, VL, strideVL, offsetVL + ( jprev - 1 ) * strideVL, VL, strideVL, offsetVL + ( j - 1 ) * strideVL, c, s );

				K2 -= 1;
				IDXP[ offsetIDXP + ( K2 - 1 ) * strideIDXP ] = jprev;
				jprev = j;
			} else {
				K += 1;
				ZW[ offsetZW + ( K - 1 ) * strideZW ] = z[ offsetZ + ( jprev - 1 ) * strideZ ];
				DSIGMA[ offsetDSIGMA + ( K - 1 ) * strideDSIGMA ] = d[ offsetD + ( jprev - 1 ) * strideD ];
				IDXP[ offsetIDXP + ( K - 1 ) * strideIDXP ] = jprev;
				jprev = j;
			}
		}

		// Record the last singular value (label 90)
		K += 1;
		ZW[ offsetZW + ( K - 1 ) * strideZW ] = z[ offsetZ + ( jprev - 1 ) * strideZ ];
		DSIGMA[ offsetDSIGMA + ( K - 1 ) * strideDSIGMA ] = d[ offsetD + ( jprev - 1 ) * strideD ];
		IDXP[ offsetIDXP + ( K - 1 ) * strideIDXP ] = jprev;
	}

	// Label 100: Sort the singular values into DSIGMA.
	for ( j = 2; j <= N; j += 1 ) {
		jp = IDXP[ offsetIDXP + ( j - 1 ) * strideIDXP ];
		DSIGMA[ offsetDSIGMA + ( j - 1 ) * strideDSIGMA ] = d[ offsetD + ( jp - 1 ) * strideD ];
		VFW[ offsetVFW + ( j - 1 ) * strideVFW ] = VF[ offsetVF + ( jp - 1 ) * strideVF ];
		VLW[ offsetVLW + ( j - 1 ) * strideVLW ] = VL[ offsetVL + ( jp - 1 ) * strideVL ];
	}

	if ( icompq === 1 ) {
		for ( j = 2; j <= N; j += 1 ) {
			jp = IDXP[ offsetIDXP + ( j - 1 ) * strideIDXP ];
			PERM[ offsetPERM + ( j - 1 ) * stridePERM ] = IDXQ[ offsetIDXQ + ( IDX[ offsetIDX + ( jp - 1 ) * strideIDX ] ) * strideIDXQ ]; // IDXQ( IDX(JP)+1 )
			if ( PERM[ offsetPERM + ( j - 1 ) * stridePERM ] <= nlp1 ) {
				PERM[ offsetPERM + ( j - 1 ) * stridePERM ] -= 1;
			}
		}
	}

	// The deflated singular values go back into the last N-K slots of D.
	if ( N - K > 0 ) {
		dcopy( N - K, DSIGMA, strideDSIGMA, offsetDSIGMA + K * strideDSIGMA, d, strideD, offsetD + K * strideD );
	}

	// Determine DSIGMA(1), DSIGMA(2), Z(1), VF(1), VL(1), VF(M), and VL(M).
	DSIGMA[ offsetDSIGMA ] = 0.0;
	hlftol = tol / 2.0;
	if ( abs( DSIGMA[ offsetDSIGMA + strideDSIGMA ] ) <= hlftol ) {
		DSIGMA[ offsetDSIGMA + strideDSIGMA ] = hlftol;
	}

	if ( M > N ) {
		z[ offsetZ ] = dlapy2( z1, z[ offsetZ + ( M - 1 ) * strideZ ] );
		if ( z[ offsetZ ] <= tol ) {
			c = 1.0;
			s = 0.0;
			z[ offsetZ ] = tol;
		} else {
			c = z1 / z[ offsetZ ];
			s = -z[ offsetZ + ( M - 1 ) * strideZ ] / z[ offsetZ ];
		}
		drot( 1, VF, strideVF, offsetVF + ( M - 1 ) * strideVF, VF, strideVF, offsetVF, c, s );
		drot( 1, VL, strideVL, offsetVL + ( M - 1 ) * strideVL, VL, strideVL, offsetVL, c, s );
	} else if ( abs( z1 ) <= tol ) {
		z[ offsetZ ] = tol;
	} else {
		z[ offsetZ ] = z1;
	}

	// Restore Z, VF, and VL.
	if ( K - 1 > 0 ) {
		dcopy( K - 1, ZW, strideZW, offsetZW + strideZW, z, strideZ, offsetZ + strideZ );
	}
	if ( N - 1 > 0 ) {
		dcopy( N - 1, VFW, strideVFW, offsetVFW + strideVFW, VF, strideVF, offsetVF + strideVF );
		dcopy( N - 1, VLW, strideVLW, offsetVLW + strideVLW, VL, strideVL, offsetVL + strideVL );
	}

	return {
		'info': 0,
		'K': K,
		'givptr': givptr,
		'c': c,
		's': s
	};
}


// EXPORTS //

export default dlasd7;
