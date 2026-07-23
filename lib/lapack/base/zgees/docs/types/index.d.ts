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
* Interface describing `zgees`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param jobvs - `jobvs`
	* @param sort - `sort`
	* @param select - `select`
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param sdim - `sdim`
	* @param W - `W`
	* @param strideW - stride of `W`
	* @param VS - `VS`
	* @param LDVS - leading dimension of `VS`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param RWORK - `RWORK`
	* @param strideRWork - stride of `RWork`
	* @param BWORK - `BWORK`
	* @param strideBWork - stride of `BWork`
	* @returns result
	*/
	( jobvs: string, sort: string, select: Function, N: number, A: Float64Array, LDA: number, sdim: number, W: Float64Array, strideW: number, VS: Float64Array, LDVS: number, WORK: Float64Array, strideWork: number, RWORK: Float64Array, strideRWork: number, BWORK: Int32Array, strideBWork: number ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param jobvs - `jobvs`
	* @param sort - `sort`
	* @param select - `select`
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param sdim - `sdim`
	* @param W - `W`
	* @param strideW - stride of `W`
	* @param offsetW - starting index for `W`
	* @param VS - `VS`
	* @param strideVS1 - stride of `VS`
	* @param strideVS2 - stride of `VS`
	* @param offsetVS - starting index for `VS`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @param RWORK - `RWORK`
	* @param strideRWork - stride of `RWork`
	* @param offsetRWork - starting index for `RWork`
	* @param BWORK - `BWORK`
	* @param strideBWork - stride of `BWork`
	* @param offsetBWork - starting index for `BWork`
	* @returns result
	*/
	ndarray( jobvs: string, sort: string, select: Function, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, sdim: number, W: Float64Array, strideW: number, offsetW: number, VS: Float64Array, strideVS1: number, strideVS2: number, offsetVS: number, WORK: Float64Array, strideWork: number, offsetWork: number, RWORK: Float64Array, strideRWork: number, offsetRWork: number, BWORK: Int32Array, strideBWork: number, offsetBWork: number ): number;
}

/**
* @license MIT.
*/
declare var zgees: Routine;


// EXPORTS //

export = zgees;
