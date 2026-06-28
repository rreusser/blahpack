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
import dlatps from '../../dlatps/lib/base.js';
import drscl from '../../drscl/lib/base.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';


// VARIABLES //

var SMLNUM = 2.2250738585072014e-308; // DLAMCH('S')


// MAIN //

/**
* Estimates the reciprocal condition number of a real symmetric positive definite matrix in packed storage using the Cholesky factorization `A = U^T*U` or `A = L*L^T` computed by dpptrf.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} AP - Cholesky factorization from dpptrf, length N*(N+1)/2
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {number} anorm - the 1-norm (or infinity-norm) of the original matrix
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Float64Array} WORK - workspace array of length 3*N
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - workspace array of length N
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @returns {integer} info - 0 if successful
*/
function dppcon( uplo, N, AP, strideAP, offsetAP, anorm, rcond, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) {
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

	sw = strideWork;
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
		dlacn2( N, WORK, sw, offsetWork + ( N * sw ), WORK, sw, offsetWork, IWORK, strideIWork, offsetIWork, EST, KASE, ISAVE, 1, 0 ); // eslint-disable-line max-len

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		if ( upper ) {
			// A = U^T * U: solve U^T * y = x, then U * x = y
			dlatps( 'upper', 'transpose', 'non-unit', normin, N, AP, strideAP, offsetAP, WORK, sw, offsetWork, scale, WORK, sw, offsetWork + ( ( 2 * N ) * sw ) );
			scalel = scale[ 0 ];
			normin = 'yes';

			dlatps( 'upper', 'no-transpose', 'non-unit', normin, N, AP, strideAP, offsetAP, WORK, sw, offsetWork, scale, WORK, sw, offsetWork + ( ( 2 * N ) * sw ) );
			scaleu = scale[ 0 ];
		} else {
			// A = L * L^T: solve L * y = x, then L^T * x = y
			dlatps( 'lower', 'no-transpose', 'non-unit', normin, N, AP, strideAP, offsetAP, WORK, sw, offsetWork, scale, WORK, sw, offsetWork + ( ( 2 * N ) * sw ) );
			scalel = scale[ 0 ];
			normin = 'yes';

			dlatps( 'lower', 'transpose', 'non-unit', normin, N, AP, strideAP, offsetAP, WORK, sw, offsetWork, scale, WORK, sw, offsetWork + ( ( 2 * N ) * sw ) );
			scaleu = scale[ 0 ];
		}

		// Combine scaling
		scale[ 0 ] = scalel * scaleu;
		if ( scale[ 0 ] !== 1.0 ) {
			ix = idamax( N, WORK, sw, offsetWork );
			if ( scale[ 0 ] < Math.abs( WORK[ offsetWork + ( ix * sw ) ] ) * SMLNUM || scale[ 0 ] === 0.0 ) {
				// Estimate would overflow; bail out
				KASE[ 0 ] = 0;
				break;
			}
			drscl( N, scale[ 0 ], WORK, sw, offsetWork );
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

export default dppcon;
