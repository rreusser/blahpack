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

import { TransposeOperation, Layout } from '@stdlib/types/blas';

/**
* Interface describing `dgetrs`.
*/
interface Routine {
	/**
	* Solves a system of linear equations A_X = B or A^T_X = B with a general.
	*
	* @param order - storage layout
	* @param trans - specifies whether the matrix should be transposed
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @returns result
	*/
	( order: Layout, trans: TransposeOperation, N: number, nrhs: number, A: Float64Array, LDA: number, IPIV: Int32Array, strideIPIV: number, B: Float64Array, LDB: number ): Float64Array;

	/**
	* Solves a system of linear equations A_X = B or A^T_X = B with a general using alternative indexing semantics.
	*
	* @param trans - specifies whether the matrix should be transposed
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @returns result
	*/
	ndarray( trans: TransposeOperation, N: number, nrhs: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number ): Float64Array;
}

/**
* Solves a system of linear equations A_X = B or A^T_X = B with a general.
*/
declare var dgetrs: Routine;


// EXPORTS //

export = dgetrs;
