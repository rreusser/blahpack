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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlacn2 from './../../zlacn2/lib/base.js';
import zhetrs3 from './../../zhetrs_3/lib/base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number (in the 1-norm) of a complex Hermitian matrix `A` using the factorization `A = P*U*D*U^H*P^T` or `A = P*L*D*L^H*P^T` computed by `zhetrf_rk`.
*
* An estimate is obtained for `norm(inv(A))`, and the reciprocal of the condition number is computed as `RCOND = 1 / (ANORM * norm(inv(A)))`.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - factored matrix from `zhetrf_rk` (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} e - super- or sub-diagonal entries of the block diagonal matrix `D`
* @param {integer} strideE - stride length for `e` (in complex elements)
* @param {NonNegativeInteger} offsetE - starting index for `e` (in complex elements)
* @param {Int32Array} IPIV - pivot indices from `zhetrf_rk`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {number} anorm - the 1-norm of the original matrix `A`
* @param {Float64Array} rcond - output: `rcond[0]` is the reciprocal condition number
* @param {Complex128Array} WORK - workspace array of length at least `2*N`
* @param {integer} strideWORK - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (in complex elements)
* @returns {integer} status code (0 = success)
*/
function zhecon3( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWORK, offsetWORK ) {
	var ainvnm;
	var upper;
	var ISAVE;
	var KASE;
	var EST;
	var sa1;
	var sa2;
	var Av;
	var sw;
	var p1;
	var i;

	sw = strideWORK;
	upper = ( uplo === 'upper' );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	Av = reinterpret( A, 0 );

	rcond[ 0 ] = 0.0;

	// Quick return if possible.
	if ( N === 0 ) {
		rcond[ 0 ] = 1.0;
		return 0;
	}
	if ( anorm <= 0.0 ) {
		return 0;
	}

	// Check that the diagonal matrix `D` is nonsingular. For Hermitian, the diagonal is real, so checking the real part is sufficient.
	if ( upper ) {
		for ( i = N - 1; i >= 0; i -= 1 ) {
			p1 = ( offsetA * 2 ) + ( i * sa1 ) + ( i * sa2 );
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 && Av[ p1 ] === 0.0 ) {
				return 0;
			}
		}
	} else {
		for ( i = 0; i < N; i += 1 ) {
			p1 = ( offsetA * 2 ) + ( i * sa1 ) + ( i * sa2 );
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 && Av[ p1 ] === 0.0 ) {
				return 0;
			}
		}
	}

	// Estimate the 1-norm of the inverse via Higham's `zlacn2` reverse-communication algorithm.
	ISAVE = new Int32Array( 3 );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );

	KASE[ 0 ] = 0;

	// `zlacn2` reverse-communication loop: `V = WORK[N..2N-1]` (scratch), `X = WORK[0..N-1]` (input/output vector).
	while ( true ) {
		zlacn2( N, WORK, sw, offsetWORK + ( N * sw ), WORK, sw, offsetWORK, EST, KASE, ISAVE, 1, 0 );

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		// Multiply by `inv(A)`: solve `A*X = WORK[0..N-1]` using `zhetrs_3`.
		zhetrs3( uplo, N, 1, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, WORK, sw, N * sw, offsetWORK );
	}

	// Compute the estimate of the reciprocal condition number.
	ainvnm = EST[ 0 ];
	if ( ainvnm !== 0.0 ) {
		rcond[ 0 ] = ( 1.0 / ainvnm ) / anorm;
	}

	return 0;
}


// EXPORTS //

export default zhecon3;
