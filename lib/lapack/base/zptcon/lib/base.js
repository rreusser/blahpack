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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';


// MAIN //

/**
* Computes the reciprocal of the condition number (in the 1-norm) of a complex.
* Hermitian positive definite tridiagonal matrix using the factorization
* A = L_D_L^H computed by zpttrf.
*
* The norm of inv(A) is computed by a direct method, and the reciprocal of
* the condition number is computed as RCOND = 1 / (ANORM * norm(inv(A))).
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements of D from zpttrf (length N, real)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Complex128Array} e - subdiagonal elements of L from zpttrf (length N-1, complex)
* @param {integer} strideE - stride for e (in complex elements)
* @param {NonNegativeInteger} offsetE - starting index for e (in complex elements)
* @param {number} anorm - the 1-norm of the original matrix A
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Float64Array} RWORK - workspace array of length at least N
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @returns {integer} info - 0 if successful
*/
function zptcon( N, d, strideD, offsetD, e, strideE, offsetE, anorm, rcond, RWORK, strideRWORK, offsetRWORK ) {
	var ainvnm;
	var absEi;
	var ev;
	var sr;
	var sd;
	var se;
	var ix;
	var pr;
	var pd;
	var ie;
	var er;
	var ei;
	var i;

	sr = strideRWORK;
	sd = strideD;
	se = strideE * 2; // complex stride → double stride

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

	// Compute the 1-norm of inv(A) using the factored form.
	// Same algorithm as dptcon, but E is complex so we use |E(i)| = cabs(E(i)).
	ev = reinterpret( e, 0 );

	// Forward pass: RWORK(i) = 1 + RWORK(i-1) * |E(i-1)|
	pr = offsetRWORK;
	RWORK[ pr ] = 1.0;
	pr += sr;
	ie = offsetE * 2;
	for ( i = 1; i < N; i++ ) {
		er = ev[ ie ];
		ei = ev[ ie + 1 ];
		absEi = Math.sqrt( er * er + ei * ei ); // |E(i-1)|
		RWORK[ pr ] = 1.0 + RWORK[ pr - sr ] * absEi;
		pr += sr;
		ie += se;
	}

	// Backward pass: RWORK(i) = RWORK(i)/D(i) + RWORK(i+1)*|E(i)|
	pd = offsetD + ( N - 1 ) * sd;
	pr = offsetRWORK + ( N - 1 ) * sr;
	RWORK[ pr ] = RWORK[ pr ] / d[ pd ];
	pd -= sd;
	ie = ( offsetE + ( N - 2 ) * strideE ) * 2;
	for ( i = N - 2; i >= 0; i-- ) {
		er = ev[ ie ];
		ei = ev[ ie + 1 ];
		absEi = Math.sqrt( er * er + ei * ei ); // |E(i)|
		RWORK[ pr - sr ] = RWORK[ pr - sr ] / d[ pd ] + RWORK[ pr ] * absEi;
		pr -= sr;
		pd -= sd;
		ie -= se;
	}

	// Find the maximum element of RWORK
	ix = idamax( N, RWORK, sr, offsetRWORK );
	ainvnm = Math.abs( RWORK[ offsetRWORK + ( ix * sr ) ] );

	// Compute the reciprocal condition number
	if ( ainvnm !== 0.0 ) {
		rcond[ 0 ] = ( 1.0 / ainvnm ) / anorm;
	}

	return 0;
}


// EXPORTS //

export default zptcon;
