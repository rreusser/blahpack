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


// MAIN //

/**
* Estimates the reciprocal of the condition number of a symmetric positive.
* definite matrix A using the Cholesky factorization `A = U^T*U` or
* A = L*L^T computed by dpotrf.
*
* An estimate is obtained for norm(inv(A)), and the reciprocal of the
* condition number is computed as RCOND = 1 / ( norm(A) * norm(inv(A)) ).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - Cholesky factorization from dpotrf, N-by-N
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {number} anorm - the 1-norm (or infinity-norm) of the original matrix
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Float64Array} WORK - workspace array of length 3*N
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @param {Int32Array} IWORK - workspace array of length N
* @param {integer} strideIWORK - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWORK - starting index for `IWORK`
* @returns {integer} info - 0 if successful
*/
function dpocon( uplo, N, A, strideA1, strideA2, offsetA, anorm, rcond, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK ) {
	var normin;
	var ainvnm;
	var scalel;
	var scaleu;
	var upper;
	var scale;
	var ISAVE;
	var KASE;
	var EST;
	var ix;
	var sw;

	sw = strideWORK;
	upper = ( uplo === 'upper' );

	rcond[ 0 ] = 0.0;

	if ( N === 0 ) {
		rcond[ 0 ] = 1.0;
		return 0;
	}
	if ( anorm === 0.0 ) {
		return 0;
	}

	// Allocate state arrays for dlacn2
	ISAVE = new Int32Array( 3 );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );
	scale = new Float64Array( 1 );

	normin = 'no';
	KASE[ 0 ] = 0;

	// Estimate norm(inv(A)) using reverse communication with dlacn2
	while ( true ) {
		dlacn2( N, WORK, sw, offsetWORK + (N * sw), // v
			WORK, sw, offsetWORK, // x
			IWORK, strideIWORK, offsetIWORK, // isgn
			EST, KASE, ISAVE, 1, 0);

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		if ( upper ) {
			// A = U^T * U: solve U^T * y = x, then U * x = y
			dlatrs( 'upper', 'transpose', 'non-unit', normin, N, A, strideA1, strideA2, offsetA, WORK, sw, offsetWORK, scale, WORK, sw, offsetWORK + ((2 * N) * sw));
			scalel = scale[ 0 ];
			normin = 'yes';

			dlatrs( 'upper', 'no-transpose', 'non-unit', normin, N, A, strideA1, strideA2, offsetA, WORK, sw, offsetWORK, scale, WORK, sw, offsetWORK + ((2 * N) * sw));
			scaleu = scale[ 0 ];
		} else {
			// A = L * L^T: solve L * y = x, then L^T * x = y
			dlatrs( 'lower', 'no-transpose', 'non-unit', normin, N, A, strideA1, strideA2, offsetA, WORK, sw, offsetWORK, scale, WORK, sw, offsetWORK + ((2 * N) * sw));
			scalel = scale[ 0 ];
			normin = 'yes';

			dlatrs( 'lower', 'transpose', 'non-unit', normin, N, A, strideA1, strideA2, offsetA, WORK, sw, offsetWORK, scale, WORK, sw, offsetWORK + ((2 * N) * sw));
			scaleu = scale[ 0 ];
		}

		// Combine scaling
		scale[ 0 ] = scalel * scaleu;
		if ( scale[ 0 ] !== 1.0 ) {
			ix = idamax( N, WORK, sw, offsetWORK );
			if ( scale[ 0 ] < Math.abs( WORK[ offsetWORK + (ix * sw) ] ) * SMLNUM || scale[ 0 ] === 0.0 ) {
				// Estimate would overflow; bail out
				KASE[ 0 ] = 0;
				break;
			}
			drscl( N, scale[ 0 ], WORK, sw, offsetWORK );
		}
	}

	// Compute rcond
	ainvnm = EST[ 0 ];
	if ( ainvnm !== 0.0 ) {
		rcond[ 0 ] = ( 1.0 / ainvnm ) / anorm;
	}

	return 0;
}


// EXPORTS //

export default dpocon;
