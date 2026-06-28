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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlacn2 from './../../dlacn2/lib/base.js';
import dsytrs3 from './../../dsytrs_3/lib/base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number (in the 1-norm) of a real symmetric matrix `A` using the factorization `A = P*U*D*U^T*P^T` or `A = P*L*D*L^T*P^T` computed by `dsytrf_rk`.
*
* An estimate is obtained for `norm(inv(A))`, and the reciprocal of the condition number is computed as `RCOND = 1 / (ANORM * norm(inv(A)))`.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - factored matrix from `dsytrf_rk` (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} e - super- or sub-diagonal entries of the block diagonal matrix `D`
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Int32Array} IPIV - pivot indices from `dsytrf_rk`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {number} anorm - the 1-norm of the original matrix `A`
* @param {Float64Array} rcond - output: `rcond[0]` is the reciprocal condition number
* @param {Float64Array} WORK - workspace array of length at least `2*N`
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - workspace array of length at least `N`
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @returns {integer} status code (0 = success)
*/
function dsycon3( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) {
	var ainvnm;
	var upper;
	var ISAVE;
	var KASE;
	var EST;
	var sw;
	var i;

	sw = strideWork;
	upper = ( uplo === 'upper' );

	rcond[ 0 ] = 0.0;

	// Quick return if possible.
	if ( N === 0 ) {
		rcond[ 0 ] = 1.0;
		return 0;
	}
	if ( anorm <= 0.0 ) {
		return 0;
	}

	// Check that the diagonal matrix `D` is nonsingular.
	if ( upper ) {
		// Upper triangular storage: examine `D` from bottom to top.
		for ( i = N - 1; i >= 0; i -= 1 ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 && A[ offsetA + ( i * strideA1 ) + ( i * strideA2 ) ] === 0.0 ) {
				return 0;
			}
		}
	} else {
		// Lower triangular storage: examine `D` from top to bottom.
		for ( i = 0; i < N; i += 1 ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 && A[ offsetA + ( i * strideA1 ) + ( i * strideA2 ) ] === 0.0 ) {
				return 0;
			}
		}
	}

	// Estimate the 1-norm of the inverse.
	ISAVE = new Int32Array( 3 );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );

	KASE[ 0 ] = 0;

	// `dlacn2` reverse-communication loop:

	//   `V = WORK[N..2N-1]` (scratch for norm estimation)

	//   `X = WORK[0..N-1]`  (input/output vector)

	//   `ISGN = IWORK[0..N-1]`
	while ( true ) {
		dlacn2( N, WORK, sw, offsetWork + ( N * sw ), WORK, sw, offsetWork, IWORK, strideIWork, offsetIWork, EST, KASE, ISAVE, 1, 0 );

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		// Multiply by `inv(L*D*L^T)` or `inv(U*D*U^T)` using the `dsytrf_rk` factorization.
		// `dsytrs_3` solves `A*X = B`; here `B` is `WORK[0..N-1]` treated as `N`-by-`1`.
		dsytrs3( uplo, N, 1, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, WORK, sw, N * sw, offsetWork );
	}

	// Compute the estimate of the reciprocal condition number.
	ainvnm = EST[ 0 ];
	if ( ainvnm !== 0.0 ) {
		rcond[ 0 ] = ( 1.0 / ainvnm ) / anorm;
	}

	return 0;
}


// EXPORTS //

export default dsycon3;
