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

/**
* Interface describing `zgeqp3`.
*/
interface Routine {
	/**
	* Computes a QR factorization with column pivoting of an M-by-N matrix:.
	*
	* @param order - storage layout
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param JPVT - `JPVT`
	* @param strideJPVT - stride of `JPVT`
	* @param TAU - `TAU`
	* @param strideTAU - stride of `TAU`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param RWORK - `RWORK`
	* @param strideRWork - stride of `RWork`
	* @returns result
	*/
	( order: Layout, M: number, N: number, A: Float64Array, LDA: number, JPVT: Float64Array, strideJPVT: number, TAU: Float64Array, strideTAU: number, WORK: Float64Array, strideWork: number, RWORK: Float64Array, strideRWork: number ): number;

	/**
	* Computes a QR factorization with column pivoting of an M-by-N matrix: using alternative indexing semantics.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param JPVT - `JPVT`
	* @param strideJPVT - stride of `JPVT`
	* @param offsetJPVT - starting index for `JPVT`
	* @param TAU - `TAU`
	* @param strideTAU - stride of `TAU`
	* @param offsetTAU - starting index for `TAU`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @param RWORK - `RWORK`
	* @param strideRWork - stride of `RWork`
	* @param offsetRWork - starting index for `RWork`
	* @returns result
	*/
	ndarray( M: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, JPVT: Float64Array, strideJPVT: number, offsetJPVT: number, TAU: Float64Array, strideTAU: number, offsetTAU: number, WORK: Float64Array, strideWork: number, offsetWork: number, RWORK: Float64Array, strideRWork: number, offsetRWork: number ): number;
}

/**
* Computes a QR factorization with column pivoting of an M-by-N matrix:.
*/
declare var zgeqp3: Routine;


// EXPORTS //

export = zgeqp3;
