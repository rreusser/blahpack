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

import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlacn2 from '../../zlacn2/lib/base.js';
import zsptrs from '../../zsptrs/lib/base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number of a complex symmetric matrix in packed storage.
*
* The routine uses the factorization A = U_D_U^T or A = L_D_L^T computed by
* zsptrf. An estimate is obtained for norm(inv(A)), and the reciprocal of the
* condition number is computed as RCOND = 1 / (ANORM * norm(inv(A))).
*
* IPIV uses the same 0-based convention as zsptrf:
*
* -   `IPIV[k]` >= 0: 1x1 pivot, row k was interchanged with row `IPIV[k]`
* -   `IPIV[k]` < 0: 2x2 pivot, `IPIV[k]` = ~kp (bitwise NOT of 0-based index)
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} AP - factored packed matrix from zsptrf
* @param {integer} strideAP - stride for AP (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for AP (in complex elements)
* @param {Int32Array} IPIV - pivot indices from zsptrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {number} anorm - the 1-norm of the original matrix A
* @param {Float64Array} rcond - output array where rcond[0] is the reciprocal condition number
* @param {Complex128Array} WORK - workspace array of length at least 2*N (in complex elements)
* @param {integer} strideWORK - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
* @returns {integer} info - 0 if successful
*/
function zspcon( uplo, N, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWORK, offsetWORK ) {
	var ainvnm;
	var upper;
	var ISAVE;
	var KASE;
	var APv;
	var EST;
	var sap;
	var ow;
	var sw;
	var ip;
	var ia;
	var i;

	sw = strideWORK;
	sap = strideAP;
	ow = offsetWORK;
	upper = ( uplo === 'upper' );

	rcond[ 0 ] = 0.0;

	// Quick return if possible...
	if ( N === 0 ) {
		rcond[ 0 ] = 1.0;
		return 0;
	}
	if ( anorm <= 0.0 ) {
		return 0;
	}

	// Check that the diagonal matrix D is nonsingular. For 1x1 pivots (IPIV[i] >= 0), check if AP(ip) == 0+0i...
	APv = reinterpret( AP, 0 );
	if ( upper ) {
		// Upper packed: diagonal A(i,i) at packed position N*(N+1)/2 - 1 for i=N-1, decrementing by (i+1)
		ip = ( N * ( N + 1 ) / 2 ) - 1;
		for ( i = N - 1; i >= 0; i-- ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
				ia = ( offsetAP + ( ip * sap ) ) * 2;
				if ( APv[ ia ] === 0.0 && APv[ ia + 1 ] === 0.0 ) {
					return 0;
				}
			}
			ip -= ( i + 1 );
		}
	} else {
		// Lower packed: diagonal A(i,i) at packed position 0 for i=0, incrementing by (N-i)
		ip = 0;
		for ( i = 0; i < N; i++ ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
				ia = ( offsetAP + ( ip * sap ) ) * 2;
				if ( APv[ ia ] === 0.0 && APv[ ia + 1 ] === 0.0 ) {
					return 0;
				}
			}
			ip += N - i;
		}
	}

	// Estimate the 1-norm of the inverse using reverse communication. zlacn2 uses V = WORK[N..2N-1] and X = WORK[0..N-1] (complex elements)...
	ISAVE = new Int32Array( 3 );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );

	KASE[ 0 ] = 0;
	while ( true ) {
		zlacn2( N, WORK, sw, ow + ( N * sw ), WORK, sw, ow, EST, KASE, ISAVE, 1, 0 );

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		// Solve A*X = B where B is WORK[0..N-1] treated as N-by-1...
		zsptrs( uplo, N, 1, AP, sap, offsetAP, IPIV, strideIPIV, offsetIPIV, WORK, sw, N * sw, ow );
	}

	// Compute the estimate of the reciprocal condition number...
	ainvnm = EST[ 0 ];
	if ( ainvnm !== 0.0 ) {
		rcond[ 0 ] = ( 1.0 / ainvnm ) / anorm;
	}

	return 0;
}


// EXPORTS //

export default zspcon;
