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
* Interface describing `dlarft`.
*/
interface Routine {
	/**
	* Forms the triangular factor T of a real block reflector H of order N.
	*
	* @param order - storage layout
	* @param direct - `direct`
	* @param storev - `storev`
	* @param N - number of columns
	* @param K - inner dimension
	* @param V - `V`
	* @param LDV - leading dimension of `V`
	* @param TAU - `TAU`
	* @param strideTAU - stride of `TAU`
	* @param T - `T`
	* @param LDT - leading dimension of `T`
	* @returns result
	*/
	( order: Layout, direct: string, storev: string, N: number, K: number, V: Float64Array, LDV: number, TAU: Float64Array, strideTAU: number, T: Float64Array, LDT: number ): Float64Array;

	/**
	* Forms the triangular factor T of a real block reflector H of order N, using alternative indexing semantics.
	*
	* @param direct - `direct`
	* @param storev - `storev`
	* @param N - number of columns
	* @param K - inner dimension
	* @param V - `V`
	* @param strideV1 - stride of `V`
	* @param strideV2 - stride of `V`
	* @param offsetV - starting index for `V`
	* @param TAU - `TAU`
	* @param strideTAU - stride of `TAU`
	* @param offsetTAU - starting index for `TAU`
	* @param T - `T`
	* @param strideT1 - stride of `T`
	* @param strideT2 - stride of `T`
	* @param offsetT - starting index for `T`
	* @returns result
	*/
	ndarray( direct: string, storev: string, N: number, K: number, V: Float64Array, strideV1: number, strideV2: number, offsetV: number, TAU: Float64Array, strideTAU: number, offsetTAU: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number ): Float64Array;
}

/**
* Forms the triangular factor T of a real block reflector H of order N.
*/
declare var dlarft: Routine;


// EXPORTS //

export = dlarft;
