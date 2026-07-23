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

import { Layout, MatrixTriangle } from '@stdlib/types/blas';

/**
* Interface describing `zla_syrcond_c`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param order - storage layout
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param AF - `AF`
	* @param LDAF - leading dimension of `AF`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param capply - `capply`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param RWORK - `RWORK`
	* @param strideRWork - stride of `RWork`
	* @returns result
	*/
	( order: Layout, uplo: MatrixTriangle, N: number, A: Float64Array, LDA: number, AF: Float64Array, LDAF: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, c: Float64Array, strideC: number, capply: number, WORK: Float64Array, strideWork: number, RWORK: Float64Array, strideRWork: number ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param AF - `AF`
	* @param strideAF1 - stride of `AF`
	* @param strideAF2 - stride of `AF`
	* @param offsetAF - starting index for `AF`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param offsetC - starting index for `C`
	* @param capply - `capply`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @param RWORK - `RWORK`
	* @param strideRWork - stride of `RWork`
	* @param offsetRWork - starting index for `RWork`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, AF: Float64Array, strideAF1: number, strideAF2: number, offsetAF: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, c: Float64Array, strideC: number, offsetC: number, capply: number, WORK: Float64Array, strideWork: number, offsetWork: number, RWORK: Float64Array, strideRWork: number, offsetRWork: number ): number;
}

/**
* @license MIT.
*/
declare var zla_syrcond_c: Routine;


// EXPORTS //

export = zla_syrcond_c;
