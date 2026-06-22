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
import zlantp from '../../zlantp/lib/base.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';


// VARIABLES //

var SMLNUM = 2.2250738585072014e-308; // DLAMCH('S')


// FUNCTIONS //

/**
* Computes CABS1, the sum of absolute values of real and imaginary parts.
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
* Estimates the reciprocal of the condition number of a packed triangular complex matrix A, in either the 1-norm or the infinity-norm.
*
* @private
* @param {string} norm - norm type: 'one-norm' or 'inf-norm'
* @param {string} uplo - 'upper' or 'lower'
* @param {string} diag - 'unit' or 'non-unit'
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} AP - packed triangular matrix
* @param {integer} strideAP - stride for `AP` (complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (complex elements)
* @param {Float64Array} RCOND - output array of length 1; RCOND[0] receives the reciprocal condition number
* @param {Complex128Array} WORK - workspace of length 2*N (complex elements)
* @param {integer} strideWORK - stride for `WORK` (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (complex elements)
* @param {Float64Array} RWORK - workspace of length N (real)
* @param {integer} strideRWORK - stride for `RWORK`
* @param {NonNegativeInteger} offsetRWORK - starting index for `RWORK`
* @returns {integer} info - 0 if successful
*/
function ztpcon( norm, uplo, diag, N, AP, strideAP, offsetAP, RCOND, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) {
	var ainvnm;
	var onenrm;
	var normin;
	var smlnum;
	var xnorm;
	var anorm;
	var scale;
	var kase1;
	var ISAVE;
	var KASE;
	var EST;
	var xv;
	var sw;
	var ow;
	var ix;

	// Quick return if possible
	if ( N === 0 ) {
		RCOND[ 0 ] = 1.0;
		return 0;
	}

	RCOND[ 0 ] = 0.0;
	smlnum = SMLNUM * Math.max( 1, N );

	// Determine norm type
	onenrm = ( norm === 'one-norm' );

	// Compute norm of A (packed)
	anorm = zlantp( norm, uplo, diag, N, AP, strideAP, offsetAP, RWORK, strideRWORK, offsetRWORK );

	// Continue only if anorm > 0
	if ( anorm > 0.0 ) {
		sw = strideWORK;
		ow = offsetWORK;

		ainvnm = 0.0;
		normin = 'no';
		if ( onenrm ) {
			kase1 = 1;
		} else {
			kase1 = 2;
		}

		// Allocate state arrays for zlacn2
		KASE = new Int32Array( 1 );
		EST = new Float64Array( 1 );
		ISAVE = new Int32Array( 3 );
		scale = new Float64Array( 1 );

		KASE[ 0 ] = 0;

		xv = reinterpret( WORK, 0 );

		// Reverse communication loop
		while ( true ) {
			zlacn2( N, WORK, sw, ow + ( N * sw ), WORK, sw, ow, EST, KASE, ISAVE, 1, 0 ); // eslint-disable-line max-len

			if ( KASE[ 0 ] === 0 ) {
				break;
			}

			if ( KASE[ 0 ] === kase1 ) {
				// Multiply by inv(A): solve A*x = b (packed)
				zlatps( uplo, 'no-transpose', diag, normin, N, AP, strideAP, offsetAP, WORK, sw, ow, scale, RWORK, strideRWORK, offsetRWORK);
			} else {
				// Multiply by inv(A^H): solve A^H*x = b (packed)
				zlatps( uplo, 'conjugate-transpose', diag, normin, N, AP, strideAP, offsetAP, WORK, sw, ow, scale, RWORK, strideRWORK, offsetRWORK);
			}
			normin = 'yes';

			// Multiply by 1/SCALE if doing so will not cause overflow
			if ( scale[ 0 ] !== 1.0 ) {
				ix = izamax( N, WORK, sw, ow );
				xnorm = cabs1( xv, ( ow + ( ix * sw ) ) * 2 );
				if ( scale[ 0 ] < xnorm * smlnum || scale[ 0 ] === 0.0 ) {
					return 0;
				}
				zdrscl( N, scale[ 0 ], WORK, sw, ow );
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

export default ztpcon;
