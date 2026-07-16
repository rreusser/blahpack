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
	* Computes for an N-by-N complex nonsymmetric matrix A, the eigenvalues.
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
	* @param strideWORK - stride of `WORK`
	* @param RWORK - `RWORK`
	* @param strideRWORK - stride of `RWORK`
	* @param BWORK - `BWORK`
	* @param strideBWORK - stride of `BWORK`
	* @returns result
	*/
	( jobvs: string, sort: string, select: Function, N: number, A: Float64Array, LDA: number, sdim: number, W: Float64Array, strideW: number, VS: Float64Array, LDVS: number, WORK: Float64Array, strideWORK: number, RWORK: Float64Array, strideRWORK: number, BWORK: Int32Array, strideBWORK: number ): Float64Array;

	/**
	* Computes for an N-by-N complex nonsymmetric matrix A, the eigenvalues, using alternative indexing semantics.
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
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param RWORK - `RWORK`
	* @param strideRWORK - stride of `RWORK`
	* @param offsetRWORK - starting index for `RWORK`
	* @param BWORK - `BWORK`
	* @param strideBWORK - stride of `BWORK`
	* @param offsetBWORK - starting index for `BWORK`
	* @returns result
	*/
	ndarray( jobvs: string, sort: string, select: Function, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, sdim: number, W: Float64Array, strideW: number, offsetW: number, VS: Float64Array, strideVS1: number, strideVS2: number, offsetVS: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, RWORK: Float64Array, strideRWORK: number, offsetRWORK: number, BWORK: Int32Array, strideBWORK: number, offsetBWORK: number ): Float64Array;
}

/**
* Computes for an N-by-N complex nonsymmetric matrix A, the eigenvalues.
*/
declare var zgees: Routine;


// EXPORTS //

export = zgees;
