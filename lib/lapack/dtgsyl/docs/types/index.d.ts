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

import { TransposeOperation } from '@stdlib/types/blas';

/**
* Interface describing `dtgsyl`.
*/
interface Routine {
	/**
	* Solves the generalized Sylvester equation (blocked):.
	*
	* @param trans - specifies whether the matrix should be transposed
	* @param ijob - `ijob`
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param C - `C`
	* @param LDC - leading dimension of `C`
	* @param D - `D`
	* @param LDD - leading dimension of `D`
	* @param E - `E`
	* @param LDE - leading dimension of `E`
	* @param F - `F`
	* @param LDF - leading dimension of `F`
	* @param scale - `scale`
	* @param dif - `dif`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param lwork - workspace size
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @returns result
	*/
	( trans: TransposeOperation, ijob: number, M: number, N: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, C: Float64Array, LDC: number, D: Float64Array, LDD: number, E: Float64Array, LDE: number, F: Float64Array, LDF: number, scale: number, dif: number, WORK: Float64Array, strideWORK: number, lwork: number, IWORK: Int32Array, strideIWORK: number ): Float64Array;

	/**
	* Solves the generalized Sylvester equation (blocked): using alternative indexing semantics.
	*
	* @param trans - specifies whether the matrix should be transposed
	* @param ijob - `ijob`
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param C - `C`
	* @param strideC1 - stride of `C`
	* @param strideC2 - stride of `C`
	* @param offsetC - starting index for `C`
	* @param D - `D`
	* @param strideD1 - stride of `D`
	* @param strideD2 - stride of `D`
	* @param offsetD - starting index for `D`
	* @param E - `E`
	* @param strideE1 - stride of `E`
	* @param strideE2 - stride of `E`
	* @param offsetE - starting index for `E`
	* @param F - `F`
	* @param strideF1 - stride of `F`
	* @param strideF2 - stride of `F`
	* @param offsetF - starting index for `F`
	* @param scale - `scale`
	* @param dif - `dif`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param lwork - workspace size
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	ndarray( trans: TransposeOperation, ijob: number, M: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, C: Float64Array, strideC1: number, strideC2: number, offsetC: number, D: Float64Array, strideD1: number, strideD2: number, offsetD: number, E: Float64Array, strideE1: number, strideE2: number, offsetE: number, F: Float64Array, strideF1: number, strideF2: number, offsetF: number, scale: number, dif: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, lwork: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;
}

/**
* Solves the generalized Sylvester equation (blocked):.
*/
declare var dtgsyl: Routine;


// EXPORTS //

export = dtgsyl;
