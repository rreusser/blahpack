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
import { Complex128Array } from '@stdlib/types/array';

/**
* Interface describing `zgelss`.
*/
interface Routine {
	/**
	* Computes the minimum norm solution to a complex linear least squares problem using the singular value decomposition of `A`.
	*
	* @param order - storage layout (`'row-major'` or `'column-major'`)
	* @param M - number of rows of `A`
	* @param N - number of columns of `A`
	* @param nrhs - number of right-hand sides
	* @param A - input matrix `A`; overwritten on exit
	* @param LDA - leading dimension of `A`
	* @param B - `max(M,N)`-by-`nrhs` matrix: the right-hand sides on entry, the solution on exit
	* @param LDB - leading dimension of `B` (column-major: `>= max(1,M,N)`; row-major: `>= max(1,nrhs)`)
	* @param S - output singular values in decreasing order (length `min(M,N)`)
	* @param strideS - stride length for `S`
	* @param rcond - threshold used to determine the effective rank of `A`
	* @param rank - output array; `rank[0]` is set to the effective rank of `A`
	* @param WORK - complex workspace; if `null`, a workspace is allocated internally
	* @param RWORK - real workspace (length `>= 5*min(M,N)`); if `null`, a workspace is allocated internally
	* @returns info status code
	*/
	( order: Layout, M: number, N: number, nrhs: number, A: Complex128Array, LDA: number, B: Complex128Array, LDB: number, S: Float64Array, strideS: number, rcond: number, rank: Array<number>, WORK: Complex128Array | null, RWORK: Float64Array | null ): number;

	/**
	* Computes the minimum norm solution to a complex linear least squares problem: using alternative indexing semantics.
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
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param lwork - workspace size
	* @param RWORK - `RWORK`
	* @param strideRWORK - stride of `RWORK`
	* @param offsetRWORK - starting index for `RWORK`
	* @returns result
	*/
	ndarray( M: number, N: number, nrhs: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, S: Float64Array, strideS: number, offsetS: number, rcond: number, rank: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, lwork: number, RWORK: Float64Array, strideRWORK: number, offsetRWORK: number ): Float64Array;
}

/**
* Computes the minimum norm solution to a complex linear least squares problem:.
*/
declare var zgelss: Routine;

// EXPORTS //

export = zgelss;
