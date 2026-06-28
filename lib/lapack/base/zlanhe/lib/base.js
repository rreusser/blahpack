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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlassq from '../../zlassq/lib/base.js';


// MAIN //

/**
* Computes the value of the one-norm, Frobenius norm, infinity-norm, or the.
* largest absolute value of any element of a complex Hermitian matrix.
*
* For a Hermitian matrix, the one-norm equals the infinity-norm.
*
* ## Notes
*
* -   The diagonal elements of a Hermitian matrix are real; only their real
* part is used in the max-norm and Frobenius-norm calculations.
*
* -   The off-diagonal elements are complex; their complex modulus is used.
*
* @private
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - complex Hermitian matrix
* @param {integer} strideA1 - first dimension stride for A (in complex elements)
* @param {integer} strideA2 - second dimension stride for A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Float64Array} WORK - workspace array (length >= N for `'one-norm'`/`'inf-norm'` norms)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {number} norm value
*/
function zlanhe( norm, uplo, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork ) {
	var value;
	var scale;
	var absa;
	var sum;
	var out;
	var sa1;
	var sa2;
	var Av;
	var oA;
	var ai;
	var re;
	var im;
	var wi;
	var i;
	var j;

	if ( N === 0 ) {
		return 0.0;
	}

	Av = reinterpret( A, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;

	if ( norm === 'max' ) {
		// Max absolute value
		value = 0.0;
		if ( uplo === 'upper' ) {
			for ( j = 0; j < N; j++ ) {
				ai = oA + (j * sa2);

				// Off-diagonal elements: i = 0..j-1
				for ( i = 0; i < j; i++ ) {
					re = Av[ ai ];
					im = Av[ ai + 1 ];
					sum = Math.sqrt( (re * re) + (im * im) ); // |A(i,j)| for complex
					if ( value < sum || sum !== sum ) {
						value = sum;
					}
					ai += sa1;
				}
				// Diagonal element: Hermitian diagonal is real, take abs of real part
				sum = Math.abs( Av[ ai ] );
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				ai = oA + (j * sa2) + (j * sa1);

				// Diagonal element
				sum = Math.abs( Av[ ai ] );
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
				ai += sa1;

				// Off-diagonal elements: i = j+1..N-1
				for ( i = j + 1; i < N; i++ ) {
					re = Av[ ai ];
					im = Av[ ai + 1 ];
					sum = Math.sqrt( (re * re) + (im * im) ); // |A(i,j)|
					if ( value < sum || sum !== sum ) {
						value = sum;
					}
					ai += sa1;
				}
			}
		}
	} else if ( norm === 'inf-norm' || norm === 'one-norm' || norm === 'one-norm' ) {
		// One-norm = infinity-norm for Hermitian matrices
		// Compute column sums of absolute values, exploiting Hermitian symmetry
		value = 0.0;
		if ( uplo === 'upper' ) {
			for ( j = 0; j < N; j++ ) {
				sum = 0.0;
				ai = oA + (j * sa2);

				// Off-diagonal elements: i = 0..j-1
				for ( i = 0; i < j; i++ ) {
					re = Av[ ai ];
					im = Av[ ai + 1 ];
					absa = Math.sqrt( (re * re) + (im * im) );
					sum += absa;
					WORK[ offsetWork + (i * strideWork) ] += absa;
					ai += sa1;
				}
				// Diagonal element
				WORK[ offsetWork + (j * strideWork) ] = sum + Math.abs( Av[ ai ] );
			}
			for ( i = 0; i < N; i++ ) {
				wi = offsetWork + (i * strideWork);
				sum = WORK[ wi ];
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		} else {
			// Lower triangle
			for ( i = 0; i < N; i++ ) {
				WORK[ offsetWork + (i * strideWork) ] = 0.0;
			}
			for ( j = 0; j < N; j++ ) {
				ai = oA + (j * sa2) + (j * sa1);

				// Diagonal element
				sum = WORK[ offsetWork + (j * strideWork) ] + Math.abs( Av[ ai ] );
				ai += sa1;

				// Off-diagonal elements: i = j+1..N-1
				for ( i = j + 1; i < N; i++ ) {
					re = Av[ ai ];
					im = Av[ ai + 1 ];
					absa = Math.sqrt( (re * re) + (im * im) );
					sum += absa;
					WORK[ offsetWork + (i * strideWork) ] += absa;
					ai += sa1;
				}
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		}
	} else if ( norm === 'frobenius' || norm === 'frobenius' ) {
		// Frobenius norm
		// Off-diagonal elements contribute twice (Hermitian symmetry)
		scale = 0.0;
		sum = 1.0;
		if ( uplo === 'upper' ) {
			// Upper triangle off-diagonal: columns j=1..N-1, rows 0..j-1
			for ( j = 1; j < N; j++ ) {
				out = zlassq( j, A, strideA1, offsetA + (j * strideA2), scale, sum );
				scale = out.scl;
				sum = out.sumsq;
			}
		} else {
			// Lower triangle off-diagonal: columns j=0..N-2, rows j+1..N-1
			for ( j = 0; j < N - 1; j++ ) {
				out = zlassq( N - j - 1, A, strideA1, offsetA + (j * strideA2) + (( j + 1 ) * strideA1), scale, sum );
				scale = out.scl;
				sum = out.sumsq;
			}
		}
		// Off-diagonal counted once, but appear twice in full Hermitian matrix
		sum *= 2.0;

		// Add diagonal elements (real-valued for Hermitian)
		for ( i = 0; i < N; i++ ) {
			ai = oA + (i * sa1) + (i * sa2); // A(i,i) in Float64 index
			re = Av[ ai ]; // Real part of diagonal (imaginary part is zero for Hermitian)
			if ( re !== 0.0 ) {
				absa = Math.abs( re );
				if ( scale < absa ) {
					sum = 1.0 + (sum * ( scale / absa ) * ( scale / absa ));
					scale = absa;
				} else {
					sum += ( absa / scale ) * ( absa / scale );
				}
			}
		}
		value = scale * Math.sqrt( sum );
	} else {
		value = 0.0;
	}

	return value;
}


// EXPORTS //

export default zlanhe;
