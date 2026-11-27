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
* Interface describing `dlaexc`.
*/
interface Routine {
	/**
	* Swaps adjacent diagonal blocks T11 and T22 of order 1 or 2 in an upper.
	*
	* @param wantq - `wantq`
	* @param N - number of columns
	* @param T - `T`
	* @param LDT - leading dimension of `T`
	* @param Q - `Q`
	* @param LDQ - leading dimension of `Q`
	* @param j1 - `j1`
	* @param n1 - `n1`
	* @param n2 - `n2`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @returns result
	*/
	( wantq: boolean, N: number, T: Float64Array, LDT: number, Q: Float64Array, LDQ: number, j1: number, n1: number, n2: number, WORK: Float64Array, strideWORK: number ): Float64Array;

	/**
	* Swaps adjacent diagonal blocks T11 and T22 of order 1 or 2 in an upper using alternative indexing semantics.
	*
	* @param wantq - `wantq`
	* @param N - number of columns
	* @param T - `T`
	* @param strideT1 - stride of `T`
	* @param strideT2 - stride of `T`
	* @param offsetT - starting index for `T`
	* @param Q - `Q`
	* @param strideQ1 - stride of `Q`
	* @param strideQ2 - stride of `Q`
	* @param offsetQ - starting index for `Q`
	* @param j1 - `j1`
	* @param n1 - `n1`
	* @param n2 - `n2`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( wantq: boolean, N: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, j1: number, n1: number, n2: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Swaps adjacent diagonal blocks T11 and T22 of order 1 or 2 in an upper.
*/
declare var dlaexc: Routine;


// EXPORTS //

export = dlaexc;
