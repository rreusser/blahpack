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

import { MatrixTriangle } from '@stdlib/types/blas';

/**
* Interface describing `zheevx`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param jobz - `jobz`
	* @param range - `range`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param vl - `vl`
	* @param vu - `vu`
	* @param il - `il`
	* @param iu - `iu`
	* @param abstol - `abstol`
	* @param out - `out`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param Z - `Z`
	* @param LDZ - leading dimension of `Z`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param RWORK - `RWORK`
	* @param strideRWork - stride of `RWork`
	* @param IWORK - `IWORK`
	* @param strideIWork - stride of `IWork`
	* @param IFAIL - `IFAIL`
	* @param strideIFAIL - stride of `IFAIL`
	* @returns result
	*/
	( jobz: string, range: string, uplo: MatrixTriangle, N: number, A: Float64Array, LDA: number, vl: number, vu: number, il: number, iu: number, abstol: number, out: number, w: Float64Array, strideW: number, Z: Float64Array, LDZ: number, WORK: Float64Array, strideWork: number, RWORK: Float64Array, strideRWork: number, IWORK: Int32Array, strideIWork: number, IFAIL: Float64Array, strideIFAIL: number ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param jobz - `jobz`
	* @param range - `range`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param vl - `vl`
	* @param vu - `vu`
	* @param il - `il`
	* @param iu - `iu`
	* @param abstol - `abstol`
	* @param out - `out`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param offsetW - starting index for `W`
	* @param Z - `Z`
	* @param strideZ1 - stride of `Z`
	* @param strideZ2 - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @param RWORK - `RWORK`
	* @param strideRWork - stride of `RWork`
	* @param offsetRWork - starting index for `RWork`
	* @param IWORK - `IWORK`
	* @param strideIWork - stride of `IWork`
	* @param offsetIWork - starting index for `IWork`
	* @param IFAIL - `IFAIL`
	* @param strideIFAIL - stride of `IFAIL`
	* @param offsetIFAIL - starting index for `IFAIL`
	* @returns result
	*/
	ndarray( jobz: string, range: string, uplo: MatrixTriangle, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, vl: number, vu: number, il: number, iu: number, abstol: number, out: number, w: Float64Array, strideW: number, offsetW: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, WORK: Float64Array, strideWork: number, offsetWork: number, RWORK: Float64Array, strideRWork: number, offsetRWork: number, IWORK: Int32Array, strideIWork: number, offsetIWork: number, IFAIL: Float64Array, strideIFAIL: number, offsetIFAIL: number ): number;
}

/**
* @license MIT.
*/
declare var zheevx: Routine;


// EXPORTS //

export = zheevx;
