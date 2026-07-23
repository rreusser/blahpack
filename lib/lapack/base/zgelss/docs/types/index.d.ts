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
* Interface describing `zgelss`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param S - `S`
	* @param strideS - stride of `S`
	* @param rcond - `rcond`
	* @param rank - `rank`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param RWORK - `RWORK`
	* @param strideRWork - stride of `RWork`
	* @returns result
	*/
	( M: number, N: number, nrhs: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, S: Float64Array, strideS: number, rcond: number, rank: number, WORK: Float64Array, strideWork: number, RWORK: Float64Array, strideRWork: number ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param S - `S`
	* @param strideS - stride of `S`
	* @param offsetS - starting index for `S`
	* @param rcond - `rcond`
	* @param rank - `rank`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @param RWORK - `RWORK`
	* @param strideRWork - stride of `RWork`
	* @param offsetRWork - starting index for `RWork`
	* @returns result
	*/
	ndarray( M: number, N: number, nrhs: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, S: Float64Array, strideS: number, offsetS: number, rcond: number, rank: number, WORK: Float64Array, strideWork: number, offsetWork: number, RWORK: Float64Array, strideRWork: number, offsetRWork: number ): number;
}

/**
* @license MIT.
*/
declare var zgelss: Routine;


// EXPORTS //

export = zgelss;
