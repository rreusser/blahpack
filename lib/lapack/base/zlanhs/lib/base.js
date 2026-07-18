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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlassq from '../../zlassq/lib/base.js';
import cmplx from '../../../../cmplx.js';


// MAIN //

/**
* Returns the value of the one norm, Frobenius norm, infinity norm, or.
* max absolute value of an upper Hessenberg complex matrix.
*
* @private
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - upper Hessenberg matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Float64Array} WORK - workspace (length >= N, used for inf-norm only, real)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {number} matrix norm value
*/
function zlanhs( norm, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork ) {
	let result, value, scale, sum, lim, aij, wi, i, j;

	const Av = reinterpret( A, 0 );
	const sa1 = strideA1 * 2;
	const sa2 = strideA2 * 2;
	const oA = offsetA * 2;

	if ( norm === 'max' ) {
		// Max absolute value
		value = 0.0;
		for ( j = 0; j < N; j++ ) {
			lim = Math.min( N, j + 2 ); // upper Hessenberg: rows 0..min(N-1, j+1)
			aij = oA + (j * sa2);
			for ( i = 0; i < lim; i++ ) {
				sum = cmplx.absAt( Av, aij );
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
				aij += sa1;
			}
		}
	} else if ( norm === 'one-norm' ) {
		// One-norm (max column sum of absolute values)
		value = 0.0;
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			lim = Math.min( N, j + 2 );
			aij = oA + (j * sa2);
			for ( i = 0; i < lim; i++ ) {
				sum += cmplx.absAt( Av, aij );
				aij += sa1;
			}
			if ( value < sum || sum !== sum ) {
				value = sum;
			}
		}
	} else if ( norm === 'inf-norm' ) {
		// Infinity-norm (max row sum of absolute values)
		for ( i = 0; i < N; i++ ) {
			WORK[ offsetWork + (i * strideWork) ] = 0.0;
		}
		for ( j = 0; j < N; j++ ) {
			lim = Math.min( N, j + 2 );
			aij = oA + (j * sa2);
			wi = offsetWork;
			for ( i = 0; i < lim; i++ ) {
				WORK[ wi ] += cmplx.absAt( Av, aij );
				aij += sa1;
				wi += strideWork;
			}
		}
		value = 0.0;
		for ( i = 0; i < N; i++ ) {
			sum = WORK[ offsetWork + (i * strideWork) ];
			if ( value < sum || sum !== sum ) {
				value = sum;
			}
		}
	} else if ( norm === 'frobenius' ) {
		// Frobenius norm
		// Zlassq now takes Complex128Array with offset in complex elements
		scale = 0.0;
		sum = 1.0;
		for ( j = 0; j < N; j++ ) {
			lim = Math.min( N, j + 2 );
			result = zlassq( lim, A, strideA1, offsetA + (j * strideA2), scale, sum );
			scale = result.scl;
			sum = result.sumsq;
		}
		value = scale * Math.sqrt( sum );
	} else {
		value = 0.0;
	}

	return value;
}


// EXPORTS //

export default zlanhs;
