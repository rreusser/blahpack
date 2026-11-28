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
* Interface describing `dgebal`.
*/
interface Routine {
	/**
	* Balances a general real matrix A.
	*
	* @param job - `job`
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param SCALE - `SCALE`
	* @param strideSCALE - stride of `SCALE`
	* @returns result
	*/
	( job: string, N: number, A: Float64Array, LDA: number, SCALE: Float64Array, strideSCALE: number ): Float64Array;

	/**
	* Balances a general real matrix A using alternative indexing semantics.
	*
	* @param job - `job`
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param ilo - lower index
	* @param ihi - upper index
	* @param SCALE - `SCALE`
	* @param strideSCALE - stride of `SCALE`
	* @param offsetSCALE - starting index for `SCALE`
	* @returns result
	*/
	ndarray( job: string, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, ilo: number, ihi: number, SCALE: Float64Array, strideSCALE: number, offsetSCALE: number ): Float64Array;
}

/**
* Balances a general real matrix A.
*/
declare var dgebal: Routine;


// EXPORTS //

export = dgebal;
