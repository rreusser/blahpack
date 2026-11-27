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

import { MatrixTriangle, TransposeOperation } from '@stdlib/types/blas';

/**
* Interface describing `dsfrk`.
*/
interface Routine {
	/**
	* Performs a symmetric rank-k operation for a matrix in Rectangular Full Packed format.
	*
	* @param transr - `transr`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param trans - specifies whether the matrix should be transposed
	* @param N - number of columns
	* @param K - inner dimension
	* @param alpha - scalar constant
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param beta - scalar constant
	* @param C - `C`
	* @returns result
	*/
	( transr: string, uplo: MatrixTriangle, trans: TransposeOperation, N: number, K: number, alpha: number, A: Float64Array, LDA: number, beta: number, C: Float64Array ): Float64Array;

	/**
	* Performs a symmetric rank-k operation for a matrix in Rectangular Full Packed format using alternative indexing semantics.
	*
	* @param transr - `transr`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param trans - specifies whether the matrix should be transposed
	* @param N - number of columns
	* @param K - inner dimension
	* @param alpha - scalar constant
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param beta - scalar constant
	* @param C - `C`
	* @param strideC - stride of `C`
	* @param offsetC - starting index for `C`
	* @returns result
	*/
	ndarray( transr: string, uplo: MatrixTriangle, trans: TransposeOperation, N: number, K: number, alpha: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, beta: number, C: Float64Array, strideC: number, offsetC: number ): Float64Array;
}

/**
* Performs a symmetric rank-k operation for a matrix in Rectangular Full Packed format.
*/
declare var dsfrk: Routine;


// EXPORTS //

export = dsfrk;
