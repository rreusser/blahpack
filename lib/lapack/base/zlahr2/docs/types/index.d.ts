/*
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

// TypeScript Version: 4.1

/**
* Interface describing `zlahr2`.
*/
interface Routine {
	/**
	* Reduces the first nb columns of a complex general rectangular matrix to upper trapezoidal form.
	*
	* @param N - number of columns
	* @param K - inner dimension
	* @param nb - `nb`
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param tau - `tau`
	* @param strideTAU - stride of `TAU`
	* @param offsetTAU - starting index for `TAU`
	* @param T - `T`
	* @param strideT1 - stride of `T`
	* @param strideT2 - stride of `T`
	* @param offsetT - starting index for `T`
	* @param Y - `Y`
	* @param strideY1 - stride of `Y`
	* @param strideY2 - stride of `Y`
	* @param offsetY - starting index for `Y`
	* @returns result
	*/
	( N: number, K: number, nb: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, tau: Float64Array, strideTAU: number, offsetTAU: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number, Y: Float64Array, strideY1: number, strideY2: number, offsetY: number ): void;

	/**
	* Reduces the first nb columns of a complex general rectangular matrix to upper trapezoidal form using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param K - inner dimension
	* @param nb - `nb`
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param tau - `tau`
	* @param strideTAU - stride of `TAU`
	* @param offsetTAU - starting index for `TAU`
	* @param T - `T`
	* @param strideT1 - stride of `T`
	* @param strideT2 - stride of `T`
	* @param offsetT - starting index for `T`
	* @param Y - `Y`
	* @param strideY1 - stride of `Y`
	* @param strideY2 - stride of `Y`
	* @param offsetY - starting index for `Y`
	* @returns result
	*/
	ndarray( N: number, K: number, nb: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, tau: Float64Array, strideTAU: number, offsetTAU: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number, Y: Float64Array, strideY1: number, strideY2: number, offsetY: number ): void;
}

/**
* Reduces the first nb columns of a complex general rectangular matrix to upper trapezoidal form.
*/
declare var zlahr2: Routine;


// EXPORTS //

export = zlahr2;
