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
import dlacn2 from '../../dlacn2/lib/base.js';
import dgttrs from '../../dgttrs/lib/base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number of a real general tridiagonal.
* matrix A, in either the 1-norm or the infinity-norm, using the LU
* factorization computed by dgttrf.
*
* An estimate is obtained for norm(inv(A)), and the reciprocal of the
* condition number is computed as RCOND = 1 / (ANORM * norm(inv(A))).
*
* @private
* @param {string} norm - 'one-norm' for 1-norm, 'inf-norm' for infinity-norm
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} DL - multipliers from dgttrf (length N-1)
* @param {integer} strideDL - stride for DL
* @param {NonNegativeInteger} offsetDL - starting index for DL
* @param {Float64Array} d - diagonal of U from dgttrf (length N)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} DU - first superdiagonal of U from dgttrf (length N-1)
* @param {integer} strideDU - stride for DU
* @param {NonNegativeInteger} offsetDU - starting index for DU
* @param {Float64Array} DU2 - second superdiagonal of U from dgttrf (length N-2)
* @param {integer} strideDU2 - stride for DU2
* @param {NonNegativeInteger} offsetDU2 - starting index for DU2
* @param {Int32Array} IPIV - pivot indices from dgttrf (0-based, length N)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {number} anorm - the 1-norm or infinity-norm of the original matrix
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Float64Array} WORK - workspace array of length at least 2*N
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {Int32Array} IWORK - workspace array of length at least N
* @param {integer} strideIWORK - stride for IWORK
* @param {NonNegativeInteger} offsetIWORK - starting index for IWORK
* @returns {integer} info - 0 if successful
*/
function dgtcon( norm, N, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK ) {
	var ainvnm;
	var onenrm;
	var kase1;
	var ISAVE;
	var KASE;
	var EST;
	var sd;
	var sw;
	var pd;
	var i;

	sw = strideWORK;
	sd = strideD;

	onenrm = ( norm === 'one-norm' );

	rcond[ 0 ] = 0.0;

	// Quick return if possible
	if ( N === 0 ) {
		rcond[ 0 ] = 1.0;
		return 0;
	}
	if ( anorm === 0.0 ) {
		return 0;
	}

	// Check that none of the diagonal elements of U are zero
	pd = offsetD;
	for ( i = 0; i < N; i++ ) {
		if ( d[ pd ] === 0.0 ) {
			return 0;
		}
		pd += sd;
	}

	ainvnm = 0.0;
	if ( onenrm ) {
		kase1 = 1;
	} else {
		kase1 = 2;
	}

	// Allocate state arrays for dlacn2
	ISAVE = new Int32Array( 3 );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );

	KASE[ 0 ] = 0;

	// Reverse-communication loop

	// dlacn2 uses V = WORK[N..2N-1], X = WORK[0..N-1], ISGN = IWORK[0..N-1]
	while ( true ) {
		dlacn2( N, WORK, sw, offsetWORK + ( N * sw ),   // V
			WORK, sw, offsetWORK,                 // X
			IWORK, strideIWORK, offsetIWORK,      // ISGN
			EST, KASE, ISAVE, 1, 0);

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		if ( KASE[ 0 ] === kase1 ) {
			// Multiply by inv(A): solve A*x = b (no transpose)
			dgttrs( 'no-transpose', N, 1, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, WORK, sw, N * sw, offsetWORK );
		} else {
			// Multiply by inv(A^T): solve A^T*x = b (transpose)
			dgttrs( 'transpose', N, 1, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, WORK, sw, N * sw, offsetWORK );
		}
	}

	// Compute the estimate of the reciprocal condition number.
	ainvnm = EST[ 0 ];
	if ( ainvnm !== 0.0 ) {
		rcond[ 0 ] = ( 1.0 / ainvnm ) / anorm;
	}

	return 0;
}


// EXPORTS //

export default dgtcon;
