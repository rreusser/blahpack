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
* Computes the value of the one norm, Frobenius norm, infinity norm, or.
* largest absolute value of a real matrix.
*
* @private
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} WORK - workspace array (length >= M for `'inf-norm'`)
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {number} norm value
*/
function dlange( norm, M, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork ) {
	let value, scale, temp, sum, out, ai, wi, i, j;

	if ( M === 0 || N === 0 ) {
		return 0.0;
	}

	if ( norm === 'max' ) {
		// Max absolute value
		value = 0.0;
		for ( j = 0; j < N; j++ ) {
			ai = offsetA + (j * strideA2);
			for ( i = 0; i < M; i++ ) {
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
			ai = offsetA + (j * strideA2);
			for ( i = 0; i < M; i++ ) {
				sum += Math.abs( A[ ai ] );
				ai += strideA1;
			}
			if ( value < sum || sum !== sum ) {
				value = sum;
			}
		}
	} else if ( norm === 'inf-norm' ) {
		// Infinity-norm: maximum row sum of absolute values
		for ( i = 0; i < M; i++ ) {
			wi = offsetWork + (i * strideWork);
			WORK[ wi ] = 0.0;
		}
		for ( j = 0; j < N; j++ ) {
			ai = offsetA + (j * strideA2);
			wi = offsetWork;
			for ( i = 0; i < M; i++ ) {
				WORK[ wi ] += Math.abs( A[ ai ] );
				ai += strideA1;
				wi += strideWork;
			}
		}
		value = 0.0;
		for ( i = 0; i < M; i++ ) {
			wi = offsetWork + (i * strideWork);
			temp = WORK[ wi ];
			if ( value < temp || temp !== temp ) {
				value = temp;
			}
		}
	} else if ( norm === 'frobenius' ) {
		// Frobenius norm: scale * sqrt(sumsq) using dlassq per column
		scale = 0.0;
		sum = 1.0;
		for ( j = 0; j < N; j++ ) {
			out = dlassq( M, A, strideA1, offsetA + (j * strideA2), scale, sum );
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

export default dlange;
