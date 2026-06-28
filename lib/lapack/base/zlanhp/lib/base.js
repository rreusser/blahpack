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
* Returns the value of the one-norm, Frobenius norm, infinity-norm, or the largest absolute value of any element of a complex Hermitian matrix supplied in packed storage.
*
* For a Hermitian matrix, the one-norm equals the infinity-norm.
*
* ## Notes
*
* -   The diagonal elements of a Hermitian matrix are real; only their real
*     part is used in the max-norm and Frobenius-norm calculations.
*
* -   The off-diagonal elements are complex; their complex modulus is used.
*
* @private
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} AP - packed Hermitian matrix (length >= N*(N+1)/2)
* @param {integer} strideAP - stride for AP (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for AP (in complex elements)
* @param {Float64Array} WORK - workspace array (length >= N for `'one-norm'`/`'inf-norm'` norms)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {number} norm value
*/
function zlanhp( norm, uplo, N, AP, strideAP, offsetAP, WORK, strideWork, offsetWork ) {
	var value;
	var scale;
	var absa;
	var sum;
	var out;
	var sap;
	var oap;
	var Av;
	var re;
	var im;
	var ai;
	var k;
	var i;
	var j;

	if ( N === 0 ) {
		return 0.0;
	}

	Av = reinterpret( AP, 0 );
	sap = strideAP * 2;
	oap = offsetAP * 2;

	if ( norm === 'max' ) {
		// Find max(abs(A(i,j)))
		value = 0.0;
		if ( uplo === 'upper' ) {
			// Upper packed: column j has elements (0..j) at positions k..k+j
			k = 0;
			for ( j = 0; j < N; j++ ) {
				// Off-diagonal elements: i = 0..j-1
				for ( i = k; i < k + j; i++ ) {
					ai = oap + ( i * sap );
					re = Av[ ai ];
					im = Av[ ai + 1 ];
					sum = Math.sqrt( ( re * re ) + ( im * im ) );
					if ( value < sum || sum !== sum ) {
						value = sum;
					}
				}
				// Diagonal element: real part only
				ai = oap + ( ( k + j ) * sap );
				sum = Math.abs( Av[ ai ] );
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
				k += j + 1;
			}
		} else {
			// Lower packed: column j has elements (j..N-1) at positions k..k+N-j-1
			k = 0;
			for ( j = 0; j < N; j++ ) {
				// Diagonal element: real part only
				ai = oap + ( k * sap );
				sum = Math.abs( Av[ ai ] );
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
				// Off-diagonal elements: i = k+1..k+N-j-1
				for ( i = k + 1; i <= k + N - j - 1; i++ ) {
					ai = oap + ( i * sap );
					re = Av[ ai ];
					im = Av[ ai + 1 ];
					sum = Math.sqrt( ( re * re ) + ( im * im ) );
					if ( value < sum || sum !== sum ) {
						value = sum;
					}
				}
				k += N - j;
			}
		}
	} else if ( norm === 'inf-norm' || norm === 'one-norm' ) {
		// One-norm = infinity-norm for Hermitian matrices
		// Accumulate column sums, exploiting Hermitian symmetry
		value = 0.0;
		k = 0;
		if ( uplo === 'upper' ) {
			for ( j = 0; j < N; j++ ) {
				sum = 0.0;

				// Off-diagonal elements: i = 0..j-1
				for ( i = 0; i < j; i++ ) {
					ai = oap + ( k * sap );
					re = Av[ ai ];
					im = Av[ ai + 1 ];
					absa = Math.sqrt( ( re * re ) + ( im * im ) );
					sum += absa;
					WORK[ offsetWork + ( i * strideWork ) ] += absa;
					k += 1;
				}
				// Diagonal element
				ai = oap + ( k * sap );
				WORK[ offsetWork + ( j * strideWork ) ] = sum + Math.abs( Av[ ai ] );
				k += 1;
			}
			for ( i = 0; i < N; i++ ) {
				sum = WORK[ offsetWork + ( i * strideWork ) ];
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		} else {
			// Lower triangle
			for ( i = 0; i < N; i++ ) {
				WORK[ offsetWork + ( i * strideWork ) ] = 0.0;
			}
			for ( j = 0; j < N; j++ ) {
				// Diagonal element
				ai = oap + ( k * sap );
				sum = WORK[ offsetWork + ( j * strideWork ) ] + Math.abs( Av[ ai ] );
				k += 1;

				// Off-diagonal elements: i = j+1..N-1
				for ( i = j + 1; i < N; i++ ) {
					ai = oap + ( k * sap );
					re = Av[ ai ];
					im = Av[ ai + 1 ];
					absa = Math.sqrt( ( re * re ) + ( im * im ) );
					sum += absa;
					WORK[ offsetWork + ( i * strideWork ) ] += absa;
					k += 1;
				}
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
			}
		}
	} else if ( norm === 'frobenius' ) {
		// Frobenius norm
		// Count off-diagonal elements twice (Hermitian symmetry), then add diagonal
		scale = 0.0;
		sum = 1.0;
		k = 1; // Start at second element (first off-diagonal)
		if ( uplo === 'upper' ) {
			// Upper packed: for column j (j=1..N-1), the off-diagonal elements are the first j elements
			for ( j = 1; j < N; j++ ) {
				out = zlassq( j, AP, strideAP, offsetAP + ( k * strideAP ), scale, sum );
				scale = out.scl;
				sum = out.sumsq;
				k += j + 1;
			}
		} else {
			// Lower packed: for column j (j=0..N-2), the off-diagonal elements start at position k
			k = 1;
			for ( j = 0; j < N - 1; j++ ) {
				out = zlassq( N - j - 1, AP, strideAP, offsetAP + ( k * strideAP ), scale, sum );
				scale = out.scl;
				sum = out.sumsq;
				k += N - j;
			}
		}
		// Off-diagonal elements counted once; multiply by 2 for full Hermitian matrix
		sum *= 2.0;

		// Add diagonal elements (real-valued for Hermitian)
		k = 0;
		for ( i = 0; i < N; i++ ) {
			ai = oap + ( k * sap );
			re = Av[ ai ]; // Real part of diagonal
			if ( re !== 0.0 ) {
				absa = Math.abs( re );
				if ( scale < absa ) {
					sum = 1.0 + ( sum * ( ( scale / absa ) * ( scale / absa ) ) );
					scale = absa;
				} else {
					sum += ( absa / scale ) * ( absa / scale );
				}
			}
			if ( uplo === 'upper' ) {
				k += i + 2;
			} else {
				k += N - i;
			}
		}
		value = scale * Math.sqrt( sum );
	} else {
		value = 0.0;
	}

	return value;
}


// EXPORTS //

export default zlanhp;
