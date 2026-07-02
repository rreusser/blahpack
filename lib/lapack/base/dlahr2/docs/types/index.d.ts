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

/// <reference types="@stdlib/types"/>

import { Layout } from '@stdlib/types/blas';

/**
* Interface describing `dlahr2`.
*/
interface Routine {
	/**
	* Reduces NB columns of a real general n-by-(n-k+1) matrix A.
	*
	* @param order - storage layout
	* @param N - number of columns
	* @param K - inner dimension
	* @param nb - `nb`
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param tau - `tau`
	* @param strideTAU - stride of `TAU`
	* @param t - `t`
	* @param strideT1 - stride of dimension 1 of `T`
	* @param strideT2 - stride of dimension 2 of `T`
	* @param y - `y`
	* @param strideY1 - stride of dimension 1 of `Y`
	* @param strideY2 - stride of dimension 2 of `Y`
	* @returns result
	*/
	( order: Layout, N: number, K: number, nb: number, A: Float64Array, LDA: number, tau: Float64Array, strideTAU: number, t: Float64Array, strideT1: number, strideT2: number, y: Float64Array, strideY1: number, strideY2: number ): Float64Array;

	/**
	* Reduces NB columns of a real general n-by-(n-k+1) matrix A using alternative indexing semantics.
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
	* @param strideT1 - stride of dimension 1 of `T`
	* @param strideT2 - stride of dimension 2 of `T`
	* @param offsetT - starting index for `T`
	* @param Y - `Y`
	* @param strideY1 - stride of dimension 1 of `Y`
	* @param strideY2 - stride of dimension 2 of `Y`
	* @param offsetY - starting index for `Y`
	* @returns result
	*/
	ndarray( N: number, K: number, nb: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, tau: Float64Array, strideTAU: number, offsetTAU: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number, Y: Float64Array, strideY1: number, strideY2: number, offsetY: number ): Float64Array;
}

/**
* Reduces NB columns of a real general n-by-(n-k+1) matrix A.
*/
declare var dlahr2: Routine;


// EXPORTS //

export = dlahr2;
