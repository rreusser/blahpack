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
* Interface describing `dgesc2`.
*/
interface Routine {
	/**
	* Solves a system of linear equations A _ X = scale _ RHS with a general.
	*
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param RHS - `RHS`
	* @param strideRHS - stride of `RHS`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param JPIV - `JPIV`
	* @param strideJPIV - stride of `JPIV`
	* @param scale - `scale`
	* @returns result
	*/
	( N: number, A: Float64Array, LDA: number, RHS: Float64Array, strideRHS: number, IPIV: Int32Array, strideIPIV: number, JPIV: Int32Array, strideJPIV: number, scale: number ): Float64Array;

	/**
	* Solves a system of linear equations A _ X = scale _ RHS with a general using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param RHS - `RHS`
	* @param strideRHS - stride of `RHS`
	* @param offsetRHS - starting index for `RHS`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param JPIV - `JPIV`
	* @param strideJPIV - stride of `JPIV`
	* @param offsetJPIV - starting index for `JPIV`
	* @param scale - `scale`
	* @returns result
	*/
	ndarray( N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, RHS: Float64Array, strideRHS: number, offsetRHS: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, JPIV: Int32Array, strideJPIV: number, offsetJPIV: number, scale: number ): Float64Array;
}

/**
* Solves a system of linear equations A _ X = scale _ RHS with a general.
*/
declare var dgesc2: Routine;


// EXPORTS //

export = dgesc2;
