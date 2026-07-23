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
* Interface describing `dgees`.
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
	* @param WR - `WR`
	* @param strideWR - stride of `WR`
	* @param WI - `WI`
	* @param strideWI - stride of `WI`
	* @param VS - `VS`
	* @param LDVS - leading dimension of `VS`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param BWORK - `BWORK`
	* @param strideBWork - stride of `BWork`
	* @returns result
	*/
	( jobvs: string, sort: string, select: Function, N: number, A: Float64Array, LDA: number, sdim: number, WR: Float64Array, strideWR: number, WI: Float64Array, strideWI: number, VS: Float64Array, LDVS: number, WORK: Float64Array, strideWork: number, BWORK: Int32Array, strideBWork: number ): number;

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
	* @param WR - `WR`
	* @param strideWR - stride of `WR`
	* @param offsetWR - starting index for `WR`
	* @param WI - `WI`
	* @param strideWI - stride of `WI`
	* @param offsetWI - starting index for `WI`
	* @param VS - `VS`
	* @param strideVS1 - stride of `VS`
	* @param strideVS2 - stride of `VS`
	* @param offsetVS - starting index for `VS`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @param BWORK - `BWORK`
	* @param strideBWork - stride of `BWork`
	* @param offsetBWork - starting index for `BWork`
	* @returns result
	*/
	ndarray( jobvs: string, sort: string, select: Function, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, sdim: number, WR: Float64Array, strideWR: number, offsetWR: number, WI: Float64Array, strideWI: number, offsetWI: number, VS: Float64Array, strideVS1: number, strideVS2: number, offsetVS: number, WORK: Float64Array, strideWork: number, offsetWork: number, BWORK: Int32Array, strideBWork: number, offsetBWork: number ): number;
}

/**
* @license MIT.
*/
declare var dgees: Routine;


// EXPORTS //

export = dgees;
