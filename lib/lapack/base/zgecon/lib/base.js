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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlacn2 from '../../zlacn2/lib/base.js';
import zlatrs from '../../zlatrs/lib/base.js';
import zdrscl from '../../zdrscl/lib/base.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';


// VARIABLES //

var SMLNUM = 2.2250738585072014e-308; // DLAMCH('S')
var HUGEVAL = 1.7976931348623157e+308; // DLAMCH('Overflow')


// FUNCTIONS //

/**
* CABS1: |re(z)| + |im(z)|.
*
* @private
* @param {Float64Array} v - Float64 view of complex array
* @param {integer} idx - index of real part
* @returns {number} CABS1 value
*/
function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Estimates the reciprocal of the condition number of a general complex matrix A.
* in either the 1-norm or the infinity-norm, using the LU factorization
* computed by zgetrf.
*
* An estimate is obtained for norm(inv(A)), and the reciprocal of the
* condition number is computed as RCOND = 1 / ( norm(A) * norm(inv(A)) ).
*
* @private
* @param {string} norm - 'one-norm' for 1-norm, 'inf-norm' for infinity-norm
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - LU factorization from zgetrf, N-by-N
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
* @param {number} anorm - the 1-norm or infinity-norm of the original matrix
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Complex128Array} WORK - workspace array of length 2*N
* @param {integer} strideWork - stride for `WORK` (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (complex elements)
* @param {Float64Array} RWORK - workspace array of length 2*N
* @param {integer} strideRWork - stride for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @returns {integer} info - 0 if successful
*/
function zgecon( norm, N, A, strideA1, strideA2, offsetA, anorm, rcond, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	var normin;
	var onenrm;
	var ainvnm;
	var kase1;
	var scale;
	var ISAVE;
	var bail;
	var KASE;
	var EST;
	var xv;
	var sw;
	var sl;
	var su;
	var ix;

	sw = strideWork;

	// Determine norm type
	onenrm = ( norm === 'one-norm' );

	rcond[ 0 ] = 0.0;

	if ( N === 0 ) {
		rcond[ 0 ] = 1.0;
		return 0;
	}
	if ( anorm === 0.0 ) {
		return 0;
	}
	if ( anorm !== anorm ) { // NaN check (DISNAN)
		rcond[ 0 ] = anorm;
		return -5;
	}
	if ( anorm > HUGEVAL ) {
		return -5;
	}

	// Allocate state arrays for zlacn2
	ISAVE = new Int32Array( 3 );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );
	scale = new Float64Array( 1 );

	ainvnm = 0.0;
	normin = 'no';
	if ( onenrm ) {
		kase1 = 1;
	} else {
		kase1 = 2;
	}

	KASE[ 0 ] = 0;

	// zlacn2 uses V = WORK[N..2N-1], X = WORK[0..N-1] (complex elements)

	// Zlatrs uses CNORM stored at RWORK[0..N-1] and RWORK[N..2N-1] for lower/upper

	// Reverse-communication loop
	bail = false;

	xv = reinterpret( WORK, 0 );

	while ( true ) {
		zlacn2( N, WORK, sw, offsetWork + ( N * sw ), // v
			WORK, sw, offsetWork, // x
			EST, KASE, ISAVE, 1, 0);

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		if ( KASE[ 0 ] === kase1 ) {
			// Multiply by inv(L), then inv(U)
			zlatrs( 'lower', 'no-transpose', 'unit', normin, N, A, strideA1, strideA2, offsetA, WORK, sw, offsetWork, scale, RWORK, strideRWork, offsetRWork);
			sl = scale[ 0 ];

			zlatrs( 'upper', 'no-transpose', 'non-unit', normin, N, A, strideA1, strideA2, offsetA, WORK, sw, offsetWork, scale, RWORK, strideRWork, offsetRWork + ( N * strideRWork ));
			su = scale[ 0 ];
		} else {
			// Multiply by inv(U^H), then inv(L^H)
			zlatrs( 'upper', 'conjugate-transpose', 'non-unit', normin, N, A, strideA1, strideA2, offsetA, WORK, sw, offsetWork, scale, RWORK, strideRWork, offsetRWork + ( N * strideRWork ));
			su = scale[ 0 ];

			zlatrs( 'lower', 'conjugate-transpose', 'unit', normin, N, A, strideA1, strideA2, offsetA, WORK, sw, offsetWork, scale, RWORK, strideRWork, offsetRWork);
			sl = scale[ 0 ];
		}

		// Combine scaling: divide X by 1/(SL*SU) if doing so will not cause overflow
		scale[ 0 ] = sl * su;
		normin = 'yes';
		if ( scale[ 0 ] !== 1.0 ) {
			ix = izamax( N, WORK, sw, offsetWork );
			if ( scale[ 0 ] < cabs1( xv, ( offsetWork + ( ix * sw ) ) * 2 ) * SMLNUM || scale[ 0 ] === 0.0 ) {
				// Estimate would overflow; bail out
				bail = true;
				break;
			}
			zdrscl( N, scale[ 0 ], WORK, sw, offsetWork );
		}
	}

	if ( !bail ) {
		// Compute the estimate of the reciprocal condition number
		ainvnm = EST[ 0 ];
		if ( ainvnm !== 0.0 ) {
			rcond[ 0 ] = ( 1.0 / ainvnm ) / anorm;
		} else {
			return 1;
		}

		// Check for NaN or overflow in rcond
		if ( rcond[ 0 ] !== rcond[ 0 ] || rcond[ 0 ] > HUGEVAL ) {
			return 1;
		}
	}

	return 0;
}


// EXPORTS //

export default zgecon;
