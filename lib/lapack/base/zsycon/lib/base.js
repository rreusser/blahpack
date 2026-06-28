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

import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlacn2 from '../../zlacn2/lib/base.js';
import zsytrs from '../../zsytrs/lib/base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number (in the 1-norm) of a complex.
* symmetric matrix A using the factorization A = U_D_U^T or A = L_D_L^T
* computed by zsytrf.
*
* An estimate is obtained for norm(inv(A)), and the reciprocal of the
* condition number is computed as RCOND = 1 / (ANORM * norm(inv(A))).
*
* IPIV uses the same 0-based convention as zsytf2/zsytrf:
*
* -   `IPIV[k]` >= 0: 1x1 pivot, row k was interchanged with row `IPIV[k]`
* -   `IPIV[k]` < 0: 2x2 pivot, `IPIV[k]` = ~kp (bitwise NOT of 0-based index)
*
* @private
* @param {string} uplo - 'upper' or 'lower', must match the factorization
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - factored matrix from zsytrf (column-major)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Int32Array} IPIV - pivot indices from zsytrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {number} anorm - the 1-norm of the original matrix A
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Complex128Array} WORK - workspace array of length at least 2*N (in complex elements)
* @param {integer} strideWork - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @returns {integer} info - 0 if successful
*/
function zsycon( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWork, offsetWork ) {
	var ainvnm;
	var upper;
	var ISAVE;
	var KASE;
	var EST;
	var Av;
	var ia;
	var sw;
	var i;

	sw = strideWork;
	upper = ( uplo === 'upper' );

	rcond[ 0 ] = 0.0;

	// Quick return if possible
	if ( N === 0 ) {
		rcond[ 0 ] = 1.0;
		return 0;
	}
	if ( anorm <= 0.0 ) {
		return 0;
	}

	// Check that the diagonal matrix D is nonsingular.
	// For 1x1 pivots (IPIV[i] >= 0), check if A(i,i) == 0+0i.
	Av = reinterpret( A, 0 );
	if ( upper ) {
		for ( i = N - 1; i >= 0; i-- ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
				ia = ( offsetA + ( i * strideA1 ) + ( i * strideA2 ) ) * 2;
				if ( Av[ ia ] === 0.0 && Av[ ia + 1 ] === 0.0 ) {
					return 0;
				}
			}
		}
	} else {
		for ( i = 0; i < N; i++ ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
				ia = ( offsetA + ( i * strideA1 ) + ( i * strideA2 ) ) * 2;
				if ( Av[ ia ] === 0.0 && Av[ ia + 1 ] === 0.0 ) {
					return 0;
				}
			}
		}
	}

	// Estimate the 1-norm of the inverse using reverse communication
	ISAVE = new Int32Array( 3 );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );

	KASE[ 0 ] = 0;

	// zlacn2 uses:

	//   V = WORK[N..2N-1] (complex elements)

	//   X = WORK[0..N-1]  (complex elements)
	while ( true ) {
		zlacn2( N,
			WORK, sw, offsetWork + ( N * sw ),  // V
			WORK, sw, offsetWork,                // X
			EST, KASE, ISAVE, 1, 0
		);

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		// Multiply by inv(L*D*L^T) or inv(U*D*U^T).
		// Zsytrs solves A*X = B; here B is WORK[0..N-1] treated as N-by-1.
		// B strides: strideB1=sw (row stride), strideB2=N*sw (col stride), offsetB
		zsytrs( uplo, N, 1, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV,
			WORK, sw, N * sw, offsetWork );
	}

	// Compute the estimate of the reciprocal condition number.
	ainvnm = EST[ 0 ];
	if ( ainvnm !== 0.0 ) {
		rcond[ 0 ] = ( 1.0 / ainvnm ) / anorm;
	}

	return 0;
}


// EXPORTS //

export default zsycon;
