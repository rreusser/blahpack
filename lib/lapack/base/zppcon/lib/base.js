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
import zlatps from '../../zlatps/lib/base.js';
import zdrscl from '../../zdrscl/lib/base.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';


// VARIABLES //

var SMLNUM = 2.2250738585072014e-308; // DLAMCH('S')


// FUNCTIONS //

/**
* Returns |re(z)| + |im(z)| for the complex number at the given index.
*
* @private
* @param {Float64Array} v - Float64 view of complex array
* @param {integer} idx - index of real part
* @returns {number} result
*/
function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Estimates the reciprocal of the condition number of a complex Hermitian positive definite matrix in packed storage using the Cholesky factorization `A = U^H * U` or `A = L * L^H` computed by zpptrf.
*
* An estimate is obtained for norm(inv(A)), and the reciprocal of the
* condition number is computed as RCOND = 1 / ( norm(A) * norm(inv(A)) ).
*
* @private
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} AP - Cholesky factor from zpptrf, packed
* @param {integer} strideAP - stride for `AP` (complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (complex elements)
* @param {number} anorm - the 1-norm of the original matrix A
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Complex128Array} WORK - workspace array of length 2*N
* @param {integer} strideWORK - stride for `WORK` (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (complex elements)
* @param {Float64Array} RWORK - workspace array of length N
* @param {integer} strideRWORK - stride for `RWORK`
* @param {NonNegativeInteger} offsetRWORK - starting index for `RWORK`
* @returns {integer} info - 0 if successful
*/
function zppcon( uplo, N, AP, strideAP, offsetAP, anorm, rcond, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) {
	var ainvnm;
	var normin;
	var scalel;
	var scaleu;
	var upper;
	var scale;
	var ISAVE;
	var bail;
	var KASE;
	var EST;
	var xv;
	var sw;
	var ow;
	var ix;

	rcond[ 0 ] = 0.0;

	if ( N === 0 ) {
		rcond[ 0 ] = 1.0;
		return 0;
	}
	if ( anorm === 0.0 ) {
		return 0;
	}

	upper = ( uplo === 'upper' );

	// Allocate state arrays for zlacn2...
	ISAVE = new Int32Array( 3 );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );
	scale = new Float64Array( 1 );

	sw = strideWORK;
	ow = offsetWORK;

	KASE[ 0 ] = 0;
	normin = 'no';

	xv = reinterpret( WORK, 0 );

	// Reverse-communication loop...
	bail = false;

	while ( true ) {
		zlacn2( N, WORK, sw, ow + ( N * sw ), WORK, sw, ow, EST, KASE, ISAVE, 1, 0 ); // eslint-disable-line max-len

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		if ( upper ) {
			// A = U^H * U: solve U^H * x = b, then U * x = b
			zlatps( 'upper', 'conjugate-transpose', 'non-unit', normin, N, AP, strideAP, offsetAP, WORK, sw, ow, scale, RWORK, strideRWORK, offsetRWORK ); // eslint-disable-line max-len
			scalel = scale[ 0 ];
			normin = 'yes';

			zlatps( 'upper', 'no-transpose', 'non-unit', normin, N, AP, strideAP, offsetAP, WORK, sw, ow, scale, RWORK, strideRWORK, offsetRWORK ); // eslint-disable-line max-len
			scaleu = scale[ 0 ];
		} else {
			// A = L * L^H: solve L * x = b, then L^H * x = b
			zlatps( 'lower', 'no-transpose', 'non-unit', normin, N, AP, strideAP, offsetAP, WORK, sw, ow, scale, RWORK, strideRWORK, offsetRWORK ); // eslint-disable-line max-len
			scalel = scale[ 0 ];
			normin = 'yes';

			zlatps( 'lower', 'conjugate-transpose', 'non-unit', normin, N, AP, strideAP, offsetAP, WORK, sw, ow, scale, RWORK, strideRWORK, offsetRWORK ); // eslint-disable-line max-len
			scaleu = scale[ 0 ];
		}

		// Combine scaling...
		scale[ 0 ] = scalel * scaleu;
		if ( scale[ 0 ] !== 1.0 ) {
			ix = izamax( N, WORK, sw, ow );
			if ( scale[ 0 ] < cabs1( xv, ( ow + ( ix * sw ) ) * 2 ) * SMLNUM || scale[ 0 ] === 0.0 ) { // eslint-disable-line max-len
				bail = true;
				break;
			}
			zdrscl( N, scale[ 0 ], WORK, sw, ow );
		}
	}

	if ( !bail ) {
		ainvnm = EST[ 0 ];
		if ( ainvnm !== 0.0 ) {
			rcond[ 0 ] = ( 1.0 / ainvnm ) / anorm;
		}
	}

	return 0;
}


// EXPORTS //

export default zppcon;
