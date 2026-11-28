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
* Interface describing `zlapmt`.
*/
interface Routine {
	/**
	* Rearrange columns of a complex matrix as specified by a permutation vector.
	*
	* @param forwrd - `forwrd`
	* @param M - number of rows
	* @param N - number of columns
	* @param X - `X`
	* @param LDX - leading dimension of `X`
	* @param k - `k`
	* @param strideK - stride of `K`
	* @returns result
	*/
	( forwrd: boolean, M: number, N: number, X: Float64Array, LDX: number, k: Float64Array, strideK: number ): Float64Array;

	/**
	* Rearrange columns of a complex matrix as specified by a permutation vector using alternative indexing semantics.
	*
	* @param forwrd - `forwrd`
	* @param M - number of rows
	* @param N - number of columns
	* @param X - `X`
	* @param strideX1 - stride of `X`
	* @param strideX2 - stride of `X`
	* @param offsetX - starting index for `X`
	* @param k - `k`
	* @param strideK - stride of `K`
	* @param offsetK - starting index for `K`
	* @returns result
	*/
	ndarray( forwrd: boolean, M: number, N: number, X: Float64Array, strideX1: number, strideX2: number, offsetX: number, k: Float64Array, strideK: number, offsetK: number ): Float64Array;
}

/**
* Rearrange columns of a complex matrix as specified by a permutation vector.
*/
declare var zlapmt: Routine;


// EXPORTS //

export = zlapmt;
