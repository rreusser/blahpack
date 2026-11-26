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

import zptts2 from '../../zptts2/lib/base.js';
import ilaenv from '../../ilaenv/lib/base.js';


// MAIN //

/**
* Solves a complex Hermitian positive definite tridiagonal system A_X = B.
_ using the L_D_L^H or U^H_D*U factorization of A computed by zpttrf.
*
* D is a diagonal matrix (real) specified in the vector D, U (or L) is a unit
* bidiagonal matrix whose superdiagonal (subdiagonal) is specified in the
* complex vector E, and X and B are N by NRHS complex matrices.
*
* @private
* @param {MatrixTriangle} uplo - `'upper'` for U^H*D*U factorization, `'lower'` for L*D*L^H factorization
* @param {NonNegativeInteger} N - order of the tridiagonal matrix A (N >= 0)
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Float64Array} d - diagonal elements of D (real), length N
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Complex128Array} e - off-diagonal elements of L or U, length N-1
* @param {integer} strideE - stride length for `e` (in complex elements)
* @param {NonNegativeInteger} offsetE - starting index for `e` (in complex elements)
* @param {Complex128Array} B - right hand side matrix (N x NRHS), overwritten with solution X
* @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @returns {integer} status code (0 = success)
*/
function zpttrs( uplo, N, nrhs, d, strideD, offsetD, e, strideE, offsetE, B, strideB1, strideB2, offsetB ) {
	let iuplo;
	let nb;
	let jb;
	let j;

	// Quick return if possible:
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	// Determine the number of right-hand sides to solve at a time:
	if ( nrhs === 1 ) {
		nb = 1;
	} else {
		nb = Math.max( 1, ilaenv( 1, 'ZPTTRS', uplo.charAt( 0 ).toUpperCase(), N, nrhs, -1, -1 ) );
	}

	// Decode UPLO:
	if ( uplo === 'upper' ) {
		iuplo = 1;
	} else {
		iuplo = 0;
	}

	if ( nb >= nrhs ) {
		zptts2( iuplo, N, nrhs, d, strideD, offsetD, e, strideE, offsetE, B, strideB1, strideB2, offsetB );
	} else {
		for ( j = 0; j < nrhs; j += nb ) {
			jb = Math.min( nrhs - j, nb );
			zptts2( iuplo, N, jb, d, strideD, offsetD, e, strideE, offsetE, B, strideB1, strideB2, offsetB + ( j * strideB2 ) );
		}
	}

	return 0;
}


// EXPORTS //

export default zpttrs;
