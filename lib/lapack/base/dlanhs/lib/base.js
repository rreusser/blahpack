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

import dlassq from '../../dlassq/lib/base.js';


// MAIN //

/**
* Returns the value of the one norm, Frobenius norm, infinity norm, or the largest absolute value of a real upper Hessenberg matrix.
*
* @private
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - upper Hessenberg matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} WORK - workspace array (length >= N, used for `'inf-norm'` only)
* @param {integer} strideWork - stride for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {number} matrix norm value
*/
function dlanhs( norm, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork ) {
	var value;
	var scale;
	var temp;
	var sum;
	var out;
	var lim;
	var ai;
	var wi;
	var i;
	var j;

	if ( N === 0 ) {
		return 0.0;
	}

	if ( norm === 'max' ) {
		// Max absolute value
		value = 0.0;
		for ( j = 0; j < N; j++ ) {
			lim = Math.min( N, j + 2 ); // upper Hessenberg: rows 0..min(N-1, j+1)
			ai = offsetA + ( j * strideA2 );
			for ( i = 0; i < lim; i++ ) {
				temp = Math.abs( A[ ai ] );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
				ai += strideA1;
			}
		}
	} else if ( norm === 'one-norm' ) {
		// One-norm: maximum column sum of absolute values
		value = 0.0;
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			lim = Math.min( N, j + 2 );
			ai = offsetA + ( j * strideA2 );
			for ( i = 0; i < lim; i++ ) {
				sum += Math.abs( A[ ai ] );
				ai += strideA1;
			}
			if ( value < sum || sum !== sum ) {
				value = sum;
			}
		}
	} else if ( norm === 'inf-norm' ) {
		// Infinity-norm: maximum row sum of absolute values
		for ( i = 0; i < N; i++ ) {
			WORK[ offsetWork + ( i * strideWork ) ] = 0.0;
		}
		for ( j = 0; j < N; j++ ) {
			lim = Math.min( N, j + 2 );
			ai = offsetA + ( j * strideA2 );
			wi = offsetWork;
			for ( i = 0; i < lim; i++ ) {
				WORK[ wi ] += Math.abs( A[ ai ] );
				ai += strideA1;
				wi += strideWork;
			}
		}
		value = 0.0;
		for ( i = 0; i < N; i++ ) {
			temp = WORK[ offsetWork + ( i * strideWork ) ];
			if ( value < temp || temp !== temp ) {
				value = temp;
			}
		}
	} else if ( norm === 'frobenius' ) {
		// Frobenius norm: scale * sqrt(sumsq) using dlassq per column
		scale = 0.0;
		sum = 1.0;
		for ( j = 0; j < N; j++ ) {
			lim = Math.min( N, j + 2 );
			out = dlassq( lim, A, strideA1, offsetA + ( j * strideA2 ), scale, sum );
			scale = out.scl;
			sum = out.sumsq;
		}
		value = scale * Math.sqrt( sum );
	} else {
		value = 0.0;
	}

	return value;
}


// EXPORTS //

export default dlanhs;
