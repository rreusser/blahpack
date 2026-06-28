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
import zgttrs from '../../zgttrs/lib/base.js';


// MAIN //

/**
* Estimates the reciprocal of the condition number of a complex general.
* tridiagonal matrix A, in either the 1-norm or the infinity-norm, using
* the LU factorization computed by zgttrf.
*
* An estimate is obtained for norm(inv(A)), and the reciprocal of the
* condition number is computed as RCOND = 1 / (ANORM * norm(inv(A))).
*
* @private
* @param {string} norm - 'one-norm' for 1-norm, 'inf-norm' for infinity-norm
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} DL - multipliers from zgttrf (length N-1)
* @param {integer} strideDL - stride for DL (complex elements)
* @param {NonNegativeInteger} offsetDL - starting index for DL (complex elements)
* @param {Complex128Array} d - diagonal of U from zgttrf (length N)
* @param {integer} strideD - stride for d (complex elements)
* @param {NonNegativeInteger} offsetD - starting index for d (complex elements)
* @param {Complex128Array} DU - first superdiagonal of U from zgttrf (length N-1)
* @param {integer} strideDU - stride for DU (complex elements)
* @param {NonNegativeInteger} offsetDU - starting index for DU (complex elements)
* @param {Complex128Array} DU2 - second superdiagonal of U from zgttrf (length N-2)
* @param {integer} strideDU2 - stride for DU2 (complex elements)
* @param {NonNegativeInteger} offsetDU2 - starting index for DU2 (complex elements)
* @param {Int32Array} IPIV - pivot indices from zgttrf (0-based, length N)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {number} anorm - the 1-norm or infinity-norm of the original matrix
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Complex128Array} WORK - workspace array of length at least 2*N
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @returns {integer} info - 0 if successful
*/
function zgtcon( norm, N, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWork, offsetWork ) {
	var ainvnm;
	var onenrm;
	var kase1;
	var ISAVE;
	var KASE;
	var EST;
	var dv;
	var sd;
	var pd;
	var sw;
	var i;

	sw = strideWork;
	sd = strideD * 2;

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
	dv = reinterpret( d, 0 );
	pd = offsetD * 2;
	for ( i = 0; i < N; i++ ) {
		if ( dv[ pd ] === 0.0 && dv[ pd + 1 ] === 0.0 ) {
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

	// Allocate state arrays for zlacn2
	ISAVE = new Int32Array( 3 );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );

	KASE[ 0 ] = 0;

	// Reverse-communication loop

	// zlacn2 uses V = WORK[N..2N-1], X = WORK[0..N-1] (complex element offsets)
	while ( true ) {
		zlacn2( N, WORK, sw, offsetWork + ( N * sw ),  // V
			WORK, sw, offsetWork,                // X
			EST, KASE, ISAVE, 1, 0);

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		if ( KASE[ 0 ] === kase1 ) {
			// Multiply by inv(A): solve A*x = b (no transpose)
			zgttrs( 'no-transpose', N, 1, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, WORK, sw * 2, N * sw * 2, offsetWork * 2 );
		} else {
			// Multiply by inv(A^H): solve A^H*x = b (conjugate transpose)
			zgttrs( 'conjugate-transpose', N, 1, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, WORK, sw * 2, N * sw * 2, offsetWork * 2 );
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

export default zgtcon;
