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

import idamax from '../../../../blas/base/idamax/lib/base.js';


// MAIN //

/**
* Computes the reciprocal of the condition number (in the 1-norm) of a real.
* symmetric positive definite tridiagonal matrix using the factorization
* A = L_D_L^T computed by dpttrf.
*
* The norm of inv(A) is computed by a direct method, and the reciprocal of
* the condition number is computed as RCOND = 1 / (ANORM * norm(inv(A))).
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements of D from dpttrf (length N)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - subdiagonal elements of L from dpttrf (length N-1)
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {number} anorm - the 1-norm of the original matrix A
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Float64Array} WORK - workspace array of length at least N
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info - 0 if successful
*/
function dptcon( N, d, strideD, offsetD, e, strideE, offsetE, anorm, rcond, WORK, strideWork, offsetWork ) {
	var ainvnm;
	var sw;
	var sd;
	var se;
	var ix;
	var pw;
	var pd;
	var pe;
	var i;

	sw = strideWork;
	sd = strideD;
	se = strideE;

	rcond[ 0 ] = 0.0;

	// Quick return if possible
	if ( N === 0 ) {
		rcond[ 0 ] = 1.0;
		return 0;
	}
	if ( anorm === 0.0 ) {
		return 0;
	}

	// Check that all eigenvalues are positive
	pd = offsetD;
	for ( i = 0; i < N; i++ ) {
		if ( d[ pd ] <= 0.0 ) {
			return 0;
		}
		pd += sd;
	}

	// Compute the 1-norm of inv(A) using the factored form:
	//   inv(A) = (L^T)^{-1} * D^{-1} * L^{-1}

	// The algorithm computes the max column sum of |inv(A)|.
	// For the tridiagonal case this simplifies to:
	//   WORK(i) = sum_{j >= i} product_{k=i..j-1} |E(k)| / D(j) ... (forward pass)
	// Then pick the max.

	// Forward pass: WORK(i) = 1 + WORK(i-1) * |E(i-1)|
	pw = offsetWork;
	WORK[ pw ] = 1.0;
	pw += sw;
	pe = offsetE;
	for ( i = 1; i < N; i++ ) {
		WORK[ pw ] = 1.0 + WORK[ pw - sw ] * Math.abs( e[ pe ] );
		pw += sw;
		pe += se;
	}

	// Backward pass: WORK(i) = WORK(i)/D(i) + WORK(i+1)*|E(i)|
	pd = offsetD + ( N - 1 ) * sd;
	pw = offsetWork + ( N - 1 ) * sw;
	WORK[ pw ] = WORK[ pw ] / d[ pd ];
	pd -= sd;
	pe = offsetE + ( N - 2 ) * se;
	for ( i = N - 2; i >= 0; i-- ) {
		WORK[ pw - sw ] = WORK[ pw - sw ] / d[ pd ] + WORK[ pw ] * Math.abs( e[ pe ] );
		pw -= sw;
		pd -= sd;
		pe -= se;
	}

	// Find the maximum element of WORK
	ix = idamax( N, WORK, sw, offsetWork );
	ainvnm = Math.abs( WORK[ offsetWork + ( ix * sw ) ] );

	// Compute the reciprocal condition number
	if ( ainvnm !== 0.0 ) {
		rcond[ 0 ] = ( 1.0 / ainvnm ) / anorm;
	}

	return 0;
}


// EXPORTS //

export default dptcon;
