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
	* @param strideWORK - stride of `WORK`
	* @param lwork - workspace size
	* @param RWORK - `RWORK`
	* @param strideRWORK - stride of `RWORK`
	* @returns result
	*/
	( order: Layout, M: number, N: number, A: Float64Array, LDA: number, JPVT: Float64Array, strideJPVT: number, TAU: Float64Array, strideTAU: number, WORK: Float64Array, strideWORK: number, lwork: number, RWORK: Float64Array, strideRWORK: number ): Float64Array;

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
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param lwork - workspace size
	* @param RWORK - `RWORK`
	* @param strideRWORK - stride of `RWORK`
	* @param offsetRWORK - starting index for `RWORK`
	* @returns result
	*/
	ndarray( M: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, JPVT: Float64Array, strideJPVT: number, offsetJPVT: number, TAU: Float64Array, strideTAU: number, offsetTAU: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, lwork: number, RWORK: Float64Array, strideRWORK: number, offsetRWORK: number ): Float64Array;
}

/**
* Computes a QR factorization with column pivoting of an M-by-N matrix:.
*/
declare var zgeqp3: Routine;


// EXPORTS //

export = zgeqp3;
