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
import dlatrs from '../../dlatrs/lib/base.js';
import drscl from '../../drscl/lib/base.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';


// VARIABLES //

var SMLNUM = 2.2250738585072014e-308; // DLAMCH('S')
var HUGEVAL = 1.7976931348623157e+308; // DLAMCH('Overflow')


// MAIN //

/**
* Estimates the reciprocal of the condition number of a general real matrix A.
* in either the 1-norm or the infinity-norm, using the LU factorization
* computed by dgetrf.
*
* An estimate is obtained for norm(inv(A)), and the reciprocal of the
* condition number is computed as RCOND = 1 / ( norm(A) * norm(inv(A)) ).
*
* @private
* @param {string} norm - `'one-norm'` or `'inf-norm'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - LU factorization from dgetrf, N-by-N
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {number} anorm - the 1-norm or infinity-norm of the original matrix
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Float64Array} WORK - workspace array of length 4*N
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @param {Int32Array} IWORK - workspace array of length N
* @param {integer} strideIWORK - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWORK - starting index for `IWORK`
* @returns {integer} info - 0 if successful
*/
function dgecon( norm, N, A, strideA1, strideA2, offsetA, anorm, rcond, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK ) {
	var normin;
	var onenrm;
	var ainvnm;
	var kase1;
	var scale;
	var ISAVE;
	var bail;
	var KASE;
	var EST;
	var sl;
	var su;
	var ix;
	var sw;

	sw = strideWORK;

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

	// Allocate state arrays for dlacn2
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

	// dlacn2 uses V = WORK[N..2N-1], X = WORK[0..N-1], ISGN = IWORK[0..N-1]

	// Dlatrs uses CNORM stored at WORK[2N..3N-1] and WORK[3N..4N-1] for lower/upper

	// Reverse-communication loop (Fortran labels 10/20)

	// bail is set to true when scale overflow would occur (GO TO 20 in Fortran),

	// Which skips the rcond computation entirely.
	bail = false;

	while ( true ) {
		dlacn2( N, WORK, sw, offsetWORK + (N * sw), // v
			WORK, sw, offsetWORK, // x
			IWORK, strideIWORK, offsetIWORK, // isgn
			EST, KASE, ISAVE, 1, 0);

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		if ( KASE[ 0 ] === kase1 ) {
			// Multiply by inv(L), then inv(U)
			dlatrs( 'lower', 'no-transpose', 'unit', normin, N, A, strideA1, strideA2, offsetA, WORK, sw, offsetWORK, scale, WORK, sw, offsetWORK + ((2 * N) * sw));
			sl = scale[ 0 ];

			dlatrs( 'upper', 'no-transpose', 'non-unit', normin, N, A, strideA1, strideA2, offsetA, WORK, sw, offsetWORK, scale, WORK, sw, offsetWORK + ((3 * N) * sw));
			su = scale[ 0 ];
		} else {
			// Multiply by inv(U^T), then inv(L^T)
			dlatrs( 'upper', 'transpose', 'non-unit', normin, N, A, strideA1, strideA2, offsetA, WORK, sw, offsetWORK, scale, WORK, sw, offsetWORK + ((3 * N) * sw));
			su = scale[ 0 ];

			dlatrs( 'lower', 'transpose', 'unit', normin, N, A, strideA1, strideA2, offsetA, WORK, sw, offsetWORK, scale, WORK, sw, offsetWORK + ((2 * N) * sw));
			sl = scale[ 0 ];
		}

		// Combine scaling: divide X by 1/(SL*SU) if doing so will not cause overflow
		scale[ 0 ] = sl * su;
		normin = 'yes';
		if ( scale[ 0 ] !== 1.0 ) {
			ix = idamax( N, WORK, sw, offsetWORK );
			if ( scale[ 0 ] < Math.abs( WORK[ offsetWORK + (ix * sw) ] ) * SMLNUM || scale[ 0 ] === 0.0 ) {
				// Estimate would overflow; bail out (GO TO 20)
				bail = true;
				break;
			}
			drscl( N, scale[ 0 ], WORK, sw, offsetWORK );
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

export default dgecon;
