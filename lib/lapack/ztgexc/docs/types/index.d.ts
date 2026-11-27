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
* Interface describing `ztgexc`.
*/
interface Routine {
	/**
	* Reorders the generalized Schur decomposition of a complex matrix pair
	*
	* @param order - storage layout
	* @param wantq - wantq
	* @param wantz - wantz
	* @param N - number of columns
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param B - input matrix
	* @param LDB - leading dimension of `B`
	* @param Q - input matrix
	* @param LDQ - leading dimension of `Q`
	* @param Z - output matrix
	* @param LDZ - leading dimension of `Z`
	* @param ifst - ifst
	* @param ilst - ilst
	* @returns result
	*/
	( order: Layout, wantq: boolean, wantz: boolean, N: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, Q: Float64Array, LDQ: number, Z: Float64Array, LDZ: number, ifst: number, ilst: number ): Float64Array;

	/**
	* Reorders the generalized Schur decomposition of a complex matrix pair, using alternative indexing semantics.
	*
	* @param wantq - wantq
	* @param wantz - wantz
	* @param N - number of columns
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - input matrix
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param Q - input matrix
	* @param strideQ1 - stride of `Q`
	* @param strideQ2 - stride of `Q`
	* @param offsetQ - starting index for `Q`
	* @param Z - output matrix
	* @param strideZ1 - stride of `Z`
	* @param strideZ2 - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param ifst - ifst
	* @param ilst - ilst
	* @returns result
	*/
	ndarray( wantq: boolean, wantz: boolean, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, ifst: number, ilst: number ): Float64Array;
}

/**
* Reorders the generalized Schur decomposition of a complex matrix pair
*/
declare var ztgexc: Routine;


// EXPORTS //

export = ztgexc;
