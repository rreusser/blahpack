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

import dptts2 from '../../dptts2/lib/base.js';
import ilaenv from '../../ilaenv/lib/base.js';


// MAIN //

/**
* Solves a real symmetric positive definite tridiagonal system A_X = B.
_ using the L_D*L^T factorization of A computed by dpttrf.
*
* @private
* @param {NonNegativeInteger} N - order of the tridiagonal matrix A (N >= 0)
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Float64Array} d - diagonal elements of D, length N
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - subdiagonal elements of L, length N-1
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} B - right hand side matrix (N x NRHS), overwritten with solution X
* @param {integer} strideB1 - stride of the first dimension of `B` (row stride)
* @param {integer} strideB2 - stride of the second dimension of `B` (column stride)
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @returns {integer} status code (0 = success)
*/
function dpttrs( N, nrhs, d, strideD, offsetD, e, strideE, offsetE, B, strideB1, strideB2, offsetB ) {
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
		nb = Math.max( 1, ilaenv( 1, 'DPTTRS', ' ', N, nrhs, -1, -1 ) );
	}

	if ( nb >= nrhs ) {
		dptts2( N, nrhs, d, strideD, offsetD, e, strideE, offsetE, B, strideB1, strideB2, offsetB );
	} else {
		for ( j = 0; j < nrhs; j += nb ) {
			jb = Math.min( nrhs - j, nb );
			dptts2( N, jb, d, strideD, offsetD, e, strideE, offsetE, B, strideB1, strideB2, offsetB + ( j * strideB2 ) );
		}
	}

	return 0;
}


// EXPORTS //

export default dpttrs;
