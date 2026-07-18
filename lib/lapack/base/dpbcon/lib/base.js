/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlacn2 from '../../dlacn2/lib/base.js';
import dlatbs from '../../dlatbs/lib/base.js';
import drscl from '../../drscl/lib/base.js';
import idamax from './../../../../blas/base/idamax/lib/base.js';


// VARIABLES //

const SMLNUM = 2.2250738585072014e-308; // DLAMCH('S')


// MAIN //

/**
* Estimates the reciprocal of the condition number of a symmetric positive.
* definite band matrix A using the Cholesky factorization A = U^T_U or
_ A = L_L^T computed by dpbtrf.
*
* @private
* @param {string} uplo - 'upper' if upper Cholesky factor, 'lower' if lower
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of superdiagonals (upper) or subdiagonals (lower)
* @param {Float64Array} AB - Cholesky factorization from dpbtrf, (KD+1) by N
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
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
function dpbcon( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, anorm, rcond, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) {
	let normin, scalel, scaleu, ix;

	const sw = strideWork;
	const upper = ( uplo === 'upper' );

	rcond[ 0 ] = 0.0;

	if ( N === 0 ) {
		rcond[ 0 ] = 1.0;
		return 0;
	}
	if ( anorm === 0.0 ) {
		return 0;
	}

	// Allocate state arrays for dlacn2
	const ISAVE = new Int32Array( 3 );
	const KASE = new Int32Array( 1 );
	const EST = new Float64Array( 1 );
	const scale = new Float64Array( 1 );

	normin = 'no';
	KASE[ 0 ] = 0;

	// Estimate norm(inv(A)) using reverse communication with dlacn2
	while ( true ) {
		dlacn2( N, WORK, sw, offsetWork + (N * sw), // v
			WORK, sw, offsetWork, // x
			IWORK, strideIWork, offsetIWork, // isgn
			EST, KASE, ISAVE, 1, 0);

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		if ( upper ) {
			// A = U^T * U: solve U^T * y = x, then U * x = y
			dlatbs( 'upper', 'transpose', 'non-unit', normin, N, kd, AB, strideAB1, strideAB2, offsetAB, WORK, sw, offsetWork, scale, WORK, sw, offsetWork + ((2 * N) * sw));
			scalel = scale[ 0 ];
			normin = 'yes';

			dlatbs( 'upper', 'no-transpose', 'non-unit', normin, N, kd, AB, strideAB1, strideAB2, offsetAB, WORK, sw, offsetWork, scale, WORK, sw, offsetWork + ((2 * N) * sw));
			scaleu = scale[ 0 ];
		} else {
			// A = L * L^T: solve L * y = x, then L^T * x = y
			dlatbs( 'lower', 'no-transpose', 'non-unit', normin, N, kd, AB, strideAB1, strideAB2, offsetAB, WORK, sw, offsetWork, scale, WORK, sw, offsetWork + ((2 * N) * sw));
			scalel = scale[ 0 ];
			normin = 'yes';

			dlatbs( 'lower', 'transpose', 'non-unit', normin, N, kd, AB, strideAB1, strideAB2, offsetAB, WORK, sw, offsetWork, scale, WORK, sw, offsetWork + ((2 * N) * sw));
			scaleu = scale[ 0 ];
		}

		// Combine scaling
		scale[ 0 ] = scalel * scaleu;
		if ( scale[ 0 ] !== 1.0 ) {
			ix = idamax( N, WORK, sw, offsetWork );
			if ( scale[ 0 ] < Math.abs( WORK[ offsetWork + (ix * sw) ] ) * SMLNUM || scale[ 0 ] === 0.0 ) {
				// Estimate would overflow; bail out
				KASE[ 0 ] = 0;
				break;
			}
			drscl( N, scale[ 0 ], WORK, sw, offsetWork );
		}
	}

	// Compute rcond
	const ainvnm = EST[ 0 ];
	if ( ainvnm !== 0.0 ) {
		rcond[ 0 ] = ( 1.0 / ainvnm ) / anorm;
	}

	return 0;
}


// EXPORTS //

export default dpbcon;
