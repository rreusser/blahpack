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

/* eslint-disable max-len, max-params */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dbdsqr from '../../dbdsqr/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';
import dpttrf from '../../dpttrf/lib/base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a real symmetric.
* positive definite tridiagonal matrix by first factoring the matrix using
* DPTTRF and then calling DBDSQR to compute the singular values of the
* bidiagonal factor.
*
* ## Notes
*
* -   COMPZ = 'none': compute eigenvalues only (Z is not referenced).
*
* -   COMPZ = 'update': compute eigenvalues and eigenvectors of the original
*     symmetric matrix. On entry, Z must contain the orthogonal matrix used
*     to reduce the original matrix to tridiagonal form.
*
* -   COMPZ = 'initialize': compute eigenvalues and eigenvectors of the
*     tridiagonal matrix. Z is initialized to the identity matrix.
*
* -   On exit, if INFO = 0, D contains the eigenvalues in descending order.
*
* -   INFO <= N: the Cholesky factorization could not be performed because
*     the leading principal minor of order INFO was not positive.
*
* -   INFO > N: the SVD algorithm failed to converge; if INFO = N+i,
*     i off-diagonal elements of the bidiagonal factor did not converge to zero.
*
* @private
* @param {string} compz - specifies whether eigenvectors are computed
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements of the tridiagonal matrix (length N)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - subdiagonal elements of the tridiagonal matrix (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} Z - orthogonal matrix Z (N-by-N)
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Float64Array} WORK - workspace array (length >= 4*N)
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {integer} INFO - 0 if successful
*/
function dpteqr( compz, N, d, strideD, offsetD, e, strideE, offsetE, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK ) {
	var icompz;
	var info;
	var nru;
	var VT;
	var C;
	var i;

	// Decode COMPZ:
	if ( compz === 'none' ) {
		icompz = 0;
	} else if ( compz === 'update' ) {
		icompz = 1;
	} else if ( compz === 'initialize' ) {
		icompz = 2;
	} else {
		return -1;
	}

	// Quick return if possible:
	if ( N === 0 ) {
		return 0;
	}

	if ( N === 1 ) {
		if ( icompz > 0 ) {
			Z[ offsetZ ] = 1.0;
		}
		return 0;
	}

	// Initialize Z to the identity matrix if COMPZ = 'initialize':
	if ( icompz === 2 ) {
		dlaset( 'full', N, N, 0.0, 1.0, Z, strideZ1, strideZ2, offsetZ );
	}

	// Call DPTTRF to factor the matrix:
	info = dpttrf( N, d, strideD, offsetD, e, strideE, offsetE );
	if ( info !== 0 ) {
		return info;
	}

	// Take square root of diagonal elements:
	for ( i = 0; i < N; i++ ) {
		d[ offsetD + ( i * strideD ) ] = Math.sqrt( d[ offsetD + ( i * strideD ) ] );
	}

	// Scale off-diagonal by corresponding diagonal:
	for ( i = 0; i < N - 1; i++ ) {
		e[ offsetE + ( i * strideE ) ] = e[ offsetE + ( i * strideE ) ] * d[ offsetD + ( i * strideD ) ];
	}

	// Call DBDSQR to compute singular values/vectors of the bidiagonal factor:
	if ( icompz > 0 ) {
		nru = N;
	} else {
		nru = 0;
	}

	// Allocate dummy 1x1 arrays for VT and C (not referenced since ncvt=0, ncc=0):
	VT = new Float64Array( 1 );
	C = new Float64Array( 1 );

	info = dbdsqr( 'lower', N, 0, nru, 0, d, strideD, offsetD, e, strideE, offsetE, VT, 1, 1, 0, Z, strideZ1, strideZ2, offsetZ, C, 1, 1, 0, WORK, strideWORK, offsetWORK );

	// Square the singular values to get eigenvalues:
	if ( info === 0 ) {
		for ( i = 0; i < N; i++ ) {
			d[ offsetD + ( i * strideD ) ] = d[ offsetD + ( i * strideD ) ] * d[ offsetD + ( i * strideD ) ];
		}
	} else {
		info = N + info;
	}

	return info;
}


// EXPORTS //

export default dpteqr;
