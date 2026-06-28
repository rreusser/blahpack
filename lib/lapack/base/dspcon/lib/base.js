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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlacn2 from '../../dlacn2/lib/base.js';
import dsptrs from '../../dsptrs/lib/base.js';


// MAIN //

/**
* Estimates the reciprocal condition number of a real symmetric packed matrix.
*
* Uses the factorization A = U_D_U^T or A = L_D_L^T computed by dsptrf.
*
* An estimate is obtained for norm(inv(A)), and the reciprocal of the
* condition number is computed as RCOND = 1 / (ANORM * norm(inv(A))).
*
* IPIV uses the same 0-based convention as dsptrf:
*
* -   `IPIV[k]` >= 0: 1x1 pivot, row k was interchanged with row `IPIV[k]`
* -   `IPIV[k]` < 0: 2x2 pivot, `IPIV[k]` = ~kp (bitwise NOT of 0-based index)
*
* @private
* @param {string} uplo - 'upper' or 'lower', must match the factorization
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} AP - factored packed matrix from dsptrf, length N*(N+1)/2
* @param {integer} strideAP - stride length for AP
* @param {NonNegativeInteger} offsetAP - starting index for AP
* @param {Int32Array} IPIV - pivot indices from dsptrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {number} anorm - the 1-norm of the original matrix A
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Float64Array} WORK - workspace array of length at least 2*N
* @param {integer} strideWork - stride length for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {Int32Array} IWORK - workspace array of length at least N
* @param {integer} strideIWork - stride length for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @returns {integer} info - 0 if successful
*/
function dspcon( uplo, N, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) {
	var ainvnm;
	var upper;
	var ISAVE;
	var KASE;
	var EST;
	var sw;
	var ip;
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

	// Check that the diagonal matrix D is nonsingular...
	if ( upper ) {
		// Upper packed: scan from bottom to top...
		ip = ( ( N * ( N + 1 ) ) / 2 ) - 1;
		for ( i = N - 1; i >= 0; i-- ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 && AP[ offsetAP + ( ip * strideAP ) ] === 0.0 ) {
				return 0;
			}
			// Previous diagonal is (i+1) positions back...
			ip -= ( i + 1 );
		}
	} else {
		// Lower packed: scan from top to bottom...
		ip = 0;
		for ( i = 0; i < N; i++ ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 && AP[ offsetAP + ( ip * strideAP ) ] === 0.0 ) {
				return 0;
			}
			// Next diagonal is (N - i) positions forward...
			ip += ( N - i );
		}
	}

	// Estimate the 1-norm of the inverse
	ISAVE = new Int32Array( 3 );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );

	KASE[ 0 ] = 0;

	// Reverse-communication loop for 1-norm estimation via dlacn2...
	while ( true ) {
		dlacn2( N, WORK, sw, offsetWork + ( N * sw ), WORK, sw, offsetWork, IWORK, strideIWork, offsetIWork, EST, KASE, ISAVE, 1, 0 ); // eslint-disable-line max-len

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		// Solve A*X = B where B is WORK[0..N-1] treated as N-by-1...
		dsptrs( uplo, N, 1, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV, WORK, sw, N * sw, offsetWork );
	}

	// Compute the estimate of the reciprocal condition number.
	ainvnm = EST[ 0 ];
	if ( ainvnm !== 0.0 ) {
		rcond[ 0 ] = ( 1.0 / ainvnm ) / anorm;
	}

	return 0;
}


// EXPORTS //

export default dspcon;
