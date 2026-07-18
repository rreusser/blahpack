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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import ddot from '../../../../blas/base/ddot/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import daxpy from '../../../../blas/base/daxpy/lib/base.js';
import dasum from '../../../../blas/base/dasum/lib/base.js';
import dgecon from '../../dgecon/lib/base.js';
import dgesc2 from '../../dgesc2/lib/base.js';
import dlassq from '../../dlassq/lib/base.js';


// VARIABLES //

const MAXDIM = 8;
const ZERO = 0.0;
const ONE = 1.0;


// MAIN //

/**
* Uses the LU factorization of the n-by-n matrix Z computed by dgetc2.
* and computes a contribution to the reciprocal Dif-estimate.
*
* The factorization of Z returned by dgetc2 has the form Z = P_L_U*Q,
* where P and Q are permutation matrices.
*
* IPIV and JPIV are 0-based pivot indices from dgetc2.
*
* @private
* @param {integer} ijob - method flag: 2 uses dgecon approximation; otherwise local look-ahead
* @param {NonNegativeInteger} N - order of the matrix Z
* @param {Float64Array} Z - LU-factored N-by-N matrix from dgetc2
* @param {integer} strideZ1 - stride of the first dimension of Z
* @param {integer} strideZ2 - stride of the second dimension of Z
* @param {NonNegativeInteger} offsetZ - starting index for Z
* @param {Float64Array} RHS - right-hand side vector (overwritten with solution)
* @param {integer} strideRHS - stride for RHS
* @param {NonNegativeInteger} offsetRHS - starting index for RHS
* @param {number} rdsum - input sum of squares contribution
* @param {number} rdscal - input scaling factor
* @param {Int32Array} IPIV - row pivot indices from dgetc2, 0-based
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Int32Array} JPIV - column pivot indices from dgetc2, 0-based
* @param {integer} strideJPIV - stride for JPIV
* @param {NonNegativeInteger} offsetJPIV - starting index for JPIV
* @returns {Object} object with rdsum and rdscal properties
*/
function dlatdf( ijob, N, Z, strideZ1, strideZ2, offsetZ, RHS, strideRHS, offsetRHS, rdsum, rdscal, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV ) {
	let pmone, sminu, splus, temp, res, idx, tmp, bp, bm, i, j, k;

	const xp = new Float64Array( MAXDIM );
	const xm = new Float64Array( MAXDIM );
	const work = new Float64Array( 4 * MAXDIM );
	const iwork = new Int32Array( MAXDIM );
	const rcond = new Float64Array( 1 );
	const scale = new Float64Array( 1 );

	if ( ijob !== 2 ) {
		// Apply permutations IPIV to RHS (forward: i=0..N-2)
		for ( i = 0; i < N - 1; i++ ) {
			idx = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			if ( idx !== i ) {
				tmp = RHS[ offsetRHS + ( i * strideRHS ) ];
				RHS[ offsetRHS + ( i * strideRHS ) ] = RHS[ offsetRHS + ( idx * strideRHS ) ];
				RHS[ offsetRHS + ( idx * strideRHS ) ] = tmp;
			}
		}

		// Solve for L-part choosing RHS either to +1 or -1.
		pmone = -ONE;

		for ( j = 0; j < N - 1; j++ ) {
			bp = RHS[ offsetRHS + ( j * strideRHS ) ] + ONE;
			bm = RHS[ offsetRHS + ( j * strideRHS ) ] - ONE;
			splus = ONE;

			// Look-ahead for L-part RHS(0:N-2) = + or -1

			// SPLUS = SPLUS + DOT(Z(j+1:N-1,j), Z(j+1:N-1,j))
			splus += ddot( N - j - 1, Z, strideZ1, offsetZ + ( ( j + 1 ) * strideZ1 ) + ( j * strideZ2 ), Z, strideZ1, offsetZ + ( ( j + 1 ) * strideZ1 ) + ( j * strideZ2 ));

			// SMINU = DOT(Z(j+1:N-1,j), RHS(j+1:N-1))
			sminu = ddot( N - j - 1, Z, strideZ1, offsetZ + ( ( j + 1 ) * strideZ1 ) + ( j * strideZ2 ), RHS, strideRHS, offsetRHS + ( ( j + 1 ) * strideRHS ));
			splus *= RHS[ offsetRHS + ( j * strideRHS ) ];

			if ( splus > sminu ) {
				RHS[ offsetRHS + ( j * strideRHS ) ] = bp;
			} else if ( sminu > splus ) {
				RHS[ offsetRHS + ( j * strideRHS ) ] = bm;
			} else {
				// Updating sums are equal; choose -1 first time, then +1
				RHS[ offsetRHS + ( j * strideRHS ) ] = RHS[ offsetRHS + ( j * strideRHS ) ] + pmone;
				pmone = ONE;
			}

			// Compute the remaining r.h.s.
			temp = -RHS[ offsetRHS + ( j * strideRHS ) ];
			daxpy( N - j - 1, temp, Z, strideZ1, offsetZ + ( ( j + 1 ) * strideZ1 ) + ( j * strideZ2 ), RHS, strideRHS, offsetRHS + ( ( j + 1 ) * strideRHS ));
		}

		// Solve for U-part, look-ahead for RHS(N-1) = +-1.
		// Copy RHS(0:N-2) to XP(0:N-2)
		for ( i = 0; i < N - 1; i++ ) {
			xp[ i ] = RHS[ offsetRHS + ( i * strideRHS ) ];
		}
		xp[ N - 1 ] = RHS[ offsetRHS + ( ( N - 1 ) * strideRHS ) ] + ONE;
		RHS[ offsetRHS + ( ( N - 1 ) * strideRHS ) ] = RHS[ offsetRHS + ( ( N - 1 ) * strideRHS ) ] - ONE;

		splus = ZERO;
		sminu = ZERO;
		for ( i = N - 1; i >= 0; i-- ) {
			temp = ONE / Z[ offsetZ + ( i * strideZ1 ) + ( i * strideZ2 ) ];
			xp[ i ] = xp[ i ] * temp;
			RHS[ offsetRHS + ( i * strideRHS ) ] = RHS[ offsetRHS + ( i * strideRHS ) ] * temp;
			for ( k = i + 1; k < N; k++ ) {
				xp[ i ] = xp[ i ] - xp[ k ] * ( Z[ offsetZ + ( i * strideZ1 ) + ( k * strideZ2 ) ] * temp );
				RHS[ offsetRHS + ( i * strideRHS ) ] = RHS[ offsetRHS + ( i * strideRHS ) ] - RHS[ offsetRHS + ( k * strideRHS ) ] * ( Z[ offsetZ + ( i * strideZ1 ) + ( k * strideZ2 ) ] * temp );
			}
			splus += Math.abs( xp[ i ] );
			sminu += Math.abs( RHS[ offsetRHS + ( i * strideRHS ) ] );
		}
		if ( splus > sminu ) {
			// Copy XP to RHS
			for ( i = 0; i < N; i++ ) {
				RHS[ offsetRHS + ( i * strideRHS ) ] = xp[ i ];
			}
		}

		// Apply the permutations JPIV to the computed solution (RHS) in reverse
		for ( i = N - 2; i >= 0; i-- ) {
			idx = JPIV[ offsetJPIV + ( i * strideJPIV ) ];
			if ( idx !== i ) {
				tmp = RHS[ offsetRHS + ( i * strideRHS ) ];
				RHS[ offsetRHS + ( i * strideRHS ) ] = RHS[ offsetRHS + ( idx * strideRHS ) ];
				RHS[ offsetRHS + ( idx * strideRHS ) ] = tmp;
			}
		}

		// Compute the sum of squares
		res = dlassq( N, RHS, strideRHS, offsetRHS, rdscal, rdsum );
		rdscal = res.scl;
		rdsum = res.sumsq;
	} else {
		// IJOB = 2: Compute approximate nullvector XM of Z
		dgecon( 'inf-norm', N, Z, strideZ1, strideZ2, offsetZ, ONE, rcond, work, 1, 0, iwork, 1, 0 );

		// Copy WORK(N:2N-1) to XM
		for ( i = 0; i < N; i++ ) {
			xm[ i ] = work[ N + i ];
		}

		// Apply inverse permutations IPIV to XM (reverse direction)
		// Fortran: DLASWP(1, XM, LDZ, 1, N-1, IPIV, -1)
		// This applies IPIV in reverse order to XM
		for ( i = N - 2; i >= 0; i-- ) {
			idx = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			if ( idx !== i ) {
				tmp = xm[ i ];
				xm[ i ] = xm[ idx ];
				xm[ idx ] = tmp;
			}
		}

		temp = ONE / Math.sqrt( ddot( N, xm, 1, 0, xm, 1, 0 ) );
		dscal( N, temp, xm, 1, 0 );

		// Copy XM to XP, then XP = XP + RHS, RHS = RHS - XM
		for ( i = 0; i < N; i++ ) {
			xp[ i ] = xm[ i ];
		}
		daxpy( N, ONE, RHS, strideRHS, offsetRHS, xp, 1, 0 );
		daxpy( N, -ONE, xm, 1, 0, RHS, strideRHS, offsetRHS );

		dgesc2( N, Z, strideZ1, strideZ2, offsetZ, RHS, strideRHS, offsetRHS, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV, scale );
		dgesc2( N, Z, strideZ1, strideZ2, offsetZ, xp, 1, 0, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV, scale );

		if ( dasum( N, xp, 1, 0 ) > dasum( N, RHS, strideRHS, offsetRHS ) ) {
			// Copy XP to RHS
			for ( i = 0; i < N; i++ ) {
				RHS[ offsetRHS + ( i * strideRHS ) ] = xp[ i ];
			}
		}

		// Compute the sum of squares
		res = dlassq( N, RHS, strideRHS, offsetRHS, rdscal, rdsum );
		rdscal = res.scl;
		rdsum = res.sumsq;
	}

	return {
		'rdsum': rdsum,
		'rdscal': rdscal
	};
}


// EXPORTS //

export default dlatdf;
