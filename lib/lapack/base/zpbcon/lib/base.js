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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlacn2 from '../../zlacn2/lib/base.js';
import zlatbs from '../../zlatbs/lib/base.js';
import zdrscl from '../../zdrscl/lib/base.js';
import izamax from './../../../../blas/base/izamax/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var SMLNUM = dlamch( 'safe-minimum' );


// FUNCTIONS //

/**
* CABS1: |re(z)| + |im(z)|.
*
* @private
* @param {Float64Array} v - Float64 view
* @param {integer} idx - index of real part
* @returns {number} CABS1 value
*/
function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Estimates the reciprocal of the condition number of a complex Hermitian.
* positive definite band matrix A using the Cholesky factorization
* A = U^H_U or A = L_L^H computed by zpbtrf.
*
* @private
* @param {string} uplo - 'upper' if upper Cholesky factor, 'lower' if lower
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of superdiagonals (upper) or subdiagonals (lower)
* @param {Complex128Array} AB - Cholesky factorization from zpbtrf, (KD+1) by N
* @param {integer} strideAB1 - stride of the first dimension of `AB` (complex elements)
* @param {integer} strideAB2 - stride of the second dimension of `AB` (complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for `AB` (complex elements)
* @param {number} anorm - the 1-norm (or infinity-norm) of the original matrix
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Complex128Array} WORK - workspace array of length 2*N
* @param {integer} strideWORK - stride for `WORK` (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (complex elements)
* @param {Float64Array} RWORK - workspace array of length N
* @param {integer} strideRWORK - stride for `RWORK`
* @param {NonNegativeInteger} offsetRWORK - starting index for `RWORK`
* @returns {integer} info - 0 if successful
*/
function zpbcon( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, anorm, rcond, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) {
	var ainvnm;
	var normin;
	var scalel;
	var scaleu;
	var upper;
	var scale;
	var ISAVE;
	var KASE;
	var EST;
	var wv;
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

	// Allocate state arrays for zlacn2
	ISAVE = new Int32Array( 3 );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );
	scale = new Float64Array( 1 );

	normin = 'no';
	KASE[ 0 ] = 0;
	wv = reinterpret( WORK, 0 );

	// Estimate norm(inv(A)) using reverse communication with zlacn2
	while ( true ) {
		zlacn2( N,
			WORK, sw, offsetWORK + ( N * sw ),  // v
			WORK, sw, offsetWORK,                // x
			EST, KASE, ISAVE, 1, 0
		);

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		if ( upper ) {
			// A = U^H * U: solve U^H * y = x, then U * x = y
			zlatbs( 'upper', 'conjugate-transpose', 'non-unit', normin, N, kd,
				AB, strideAB1, strideAB2, offsetAB,
				WORK, sw, offsetWORK,
				scale, RWORK, strideRWORK, offsetRWORK );
			scalel = scale[ 0 ];
			normin = 'yes';

			zlatbs( 'upper', 'no-transpose', 'non-unit', normin, N, kd,
				AB, strideAB1, strideAB2, offsetAB,
				WORK, sw, offsetWORK,
				scale, RWORK, strideRWORK, offsetRWORK );
			scaleu = scale[ 0 ];
		} else {
			// A = L * L^H: solve L * y = x, then L^H * x = y
			zlatbs( 'lower', 'no-transpose', 'non-unit', normin, N, kd,
				AB, strideAB1, strideAB2, offsetAB,
				WORK, sw, offsetWORK,
				scale, RWORK, strideRWORK, offsetRWORK );
			scalel = scale[ 0 ];
			normin = 'yes';

			zlatbs( 'lower', 'conjugate-transpose', 'non-unit', normin, N, kd,
				AB, strideAB1, strideAB2, offsetAB,
				WORK, sw, offsetWORK,
				scale, RWORK, strideRWORK, offsetRWORK );
			scaleu = scale[ 0 ];
		}

		// Combine scaling
		scale[ 0 ] = scalel * scaleu;
		if ( scale[ 0 ] !== 1.0 ) {
			ix = izamax( N, WORK, sw, offsetWORK );
			if ( scale[ 0 ] < cabs1( wv, ( offsetWORK + ( ix * sw ) ) * 2 ) * SMLNUM || scale[ 0 ] === 0.0 ) {
				// Estimate would overflow; bail out
				KASE[ 0 ] = 0;
				break;
			}
			zdrscl( N, scale[ 0 ], WORK, sw, offsetWORK );
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

export default zpbcon;
