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
import dlamch from '../../dlamch/lib/base.js';
import dlantp from '../../dlantp/lib/base.js';
import dlacn2 from '../../dlacn2/lib/base.js';
import dlatps from '../../dlatps/lib/base.js';
import drscl from '../../drscl/lib/base.js';
import idamax from './../../../../blas/base/idamax/lib/base.js';


// VARIABLES //

var SMLNUM = dlamch( 'safe-minimum' );


// MAIN //

/**
* Estimates the reciprocal of the condition number of a real triangular matrix in packed storage, in either the 1-norm or the infinity-norm.
*
* The norm of A is computed and an estimate is obtained for norm(inv(A)),
* then the reciprocal of the condition number is computed as
* RCOND = 1 / ( norm(A) * norm(inv(A)) ).
*
* @private
* @param {string} norm - norm type: 'one-norm' or 'inf-norm'
* @param {string} uplo - 'upper' or 'lower'
* @param {string} diag - 'unit' or 'non-unit'
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} AP - packed triangular matrix of length N*(N+1)/2
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} RCOND - output array of length 1; RCOND[0] receives the reciprocal condition number
* @param {Float64Array} WORK - workspace array of length at least 3*N
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - integer workspace array of length at least N
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @returns {integer} info - 0 if successful
*/
function dtpcon( norm, uplo, diag, N, AP, strideAP, offsetAP, RCOND, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) {
	var onenrm;
	var ainvnm;
	var normin;
	var smlnum;
	var xnorm;
	var anorm;
	var scale;
	var kase1;
	var ISAVE;
	var KASE;
	var EST;
	var ix;
	var sw;
	var ow;

	// Quick return if possible
	if ( N === 0 ) {
		RCOND[ 0 ] = 1.0;
		return 0;
	}

	RCOND[ 0 ] = 0.0;
	smlnum = SMLNUM * Math.max( 1, N );

	// Determine norm type
	onenrm = ( norm === 'one-norm' );

	// Compute the norm of the triangular matrix A (packed storage)
	anorm = dlantp( norm, uplo, diag, N, AP, strideAP, offsetAP, WORK, strideWork, offsetWork );

	// Continue only if anorm > 0
	if ( anorm > 0.0 ) {
		// Estimate the norm of the inverse of A using dlacn2 reverse communication.

		// WORK layout (using contiguous stride=1 workspace):
		//   WORK[ow .. ow + N-1]       = x (dlacn2 x vector, also dlatps RHS)
		//   WORK[ow + N .. ow + 2N-1]  = v (dlacn2 v/workspace)
		//   WORK[ow + 2N .. ow + 3N-1] = CNORM (dlatps column norms)

		// IWORK[offsetIWork .. offsetIWork + N-1] = ISGN (dlacn2 sign array)

		sw = strideWork;
		ow = offsetWork;

		ainvnm = 0.0;
		normin = 'no';
		if ( onenrm ) {
			kase1 = 1;
		} else {
			kase1 = 2;
		}

		// Allocate state arrays for dlacn2
		KASE = new Int32Array( 1 );
		EST = new Float64Array( 1 );
		ISAVE = new Int32Array( 3 );
		scale = new Float64Array( 1 );

		KASE[ 0 ] = 0;

		// Reverse communication loop
		while ( true ) {
			// dlacn2( N, v, strideV, offsetV, x, strideX, offsetX, ISGN, strideISGN, offsetISGN, EST, KASE, ISAVE, strideISAVE, offsetISAVE )
			dlacn2( N, WORK, sw, ow + (N * sw), WORK, sw, ow, IWORK, strideIWork, offsetIWork, EST, KASE, ISAVE, 1, 0 );

			if ( KASE[ 0 ] === 0 ) {
				break;
			}

			if ( KASE[ 0 ] === kase1 ) {
				// Multiply by inv(A)
				dlatps( uplo, 'no-transpose', diag, normin, N, AP, strideAP, offsetAP, WORK, sw, ow, scale, WORK, sw, ow + (2 * N * sw) );
			} else {
				// Multiply by inv(A^T)
				dlatps( uplo, 'transpose', diag, normin, N, AP, strideAP, offsetAP, WORK, sw, ow, scale, WORK, sw, ow + (2 * N * sw) );
			}
			normin = 'yes';

			// Multiply by 1/SCALE if doing so will not cause overflow
			if ( scale[ 0 ] !== 1.0 ) {
				ix = idamax( N, WORK, sw, ow );
				xnorm = Math.abs( WORK[ ow + (ix * sw) ] );
				if ( scale[ 0 ] < xnorm * smlnum || scale[ 0 ] === 0.0 ) {
					return 0;
				}
				drscl( N, scale[ 0 ], WORK, sw, ow );
			}
		}

		ainvnm = EST[ 0 ];

		// Compute the estimate of the reciprocal condition number
		if ( ainvnm !== 0.0 ) {
			RCOND[ 0 ] = ( 1.0 / anorm ) / ainvnm;
		}
	}

	return 0;
}


// EXPORTS //

export default dtpcon;
