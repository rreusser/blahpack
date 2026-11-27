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
* Interface describing `zla_gerpvgrw`.
*/
interface Routine {
	/**
	* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a complex general matrix.
	*
	* @param N - number of columns
	* @param ncols - `ncols`
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param AF - `AF`
	* @param LDAF - leading dimension of `AF`
	* @returns result
	*/
	( N: number, ncols: number, A: Float64Array, LDA: number, AF: Float64Array, LDAF: number ): Float64Array;

	/**
	* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a complex general matrix using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param ncols - `ncols`
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param AF - `AF`
	* @param strideAF1 - stride of `AF`
	* @param strideAF2 - stride of `AF`
	* @param offsetAF - starting index for `AF`
	* @returns result
	*/
	ndarray( N: number, ncols: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, AF: Float64Array, strideAF1: number, strideAF2: number, offsetAF: number ): Float64Array;
}

/**
* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a complex general matrix.
*/
declare var zla_gerpvgrw: Routine;


// EXPORTS //

export = zla_gerpvgrw;
