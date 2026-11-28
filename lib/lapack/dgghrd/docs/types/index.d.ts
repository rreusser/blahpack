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
* Interface describing `dgghrd`.
*/
interface Routine {
	/**
	* @license Apache-2.0.
	*
	* @param order - storage layout
	* @param compq - `compq`
	* @param compz - `compz`
	* @param N - number of columns
	* @param ilo - lower index
	* @param ihi - upper index
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param Q - `Q`
	* @param LDQ - leading dimension of `Q`
	* @param Z - `Z`
	* @param LDZ - leading dimension of `Z`
	* @returns result
	*/
	( order: Layout, compq: string, compz: string, N: number, ilo: number, ihi: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, Q: Float64Array, LDQ: number, Z: Float64Array, LDZ: number ): Float64Array;

	/**
	* @license Apache-2.0 using alternative indexing semantics.
	*
	* @param compq - `compq`
	* @param compz - `compz`
	* @param N - number of columns
	* @param ilo - lower index
	* @param ihi - upper index
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param Q - `Q`
	* @param strideQ1 - stride of `Q`
	* @param strideQ2 - stride of `Q`
	* @param offsetQ - starting index for `Q`
	* @param Z - `Z`
	* @param strideZ1 - stride of `Z`
	* @param strideZ2 - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @returns result
	*/
	ndarray( compq: string, compz: string, N: number, ilo: number, ihi: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number ): Float64Array;
}

/**
* @license Apache-2.0.
*/
declare var dgghrd: Routine;


// EXPORTS //

export = dgghrd;
