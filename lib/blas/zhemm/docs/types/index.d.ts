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

import { OperationSide, MatrixTriangle, Layout } from '@stdlib/types/blas';

/**
* Interface describing `zhemm`.
*/
interface Routine {
	/**
	* Performs one of the Hermitian matrix-matrix operations:.
	*
	* @param order - storage layout
	* @param side - specifies the side of the operation
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param M - number of rows
	* @param N - number of columns
	* @param alpha - scalar constant
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param beta - scalar constant
	* @param C - `C`
	* @param LDC - leading dimension of `C`
	* @returns result
	*/
	( order: Layout, side: OperationSide, uplo: MatrixTriangle, M: number, N: number, alpha: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, beta: number, C: Float64Array, LDC: number ): Float64Array;

	/**
	* Performs one of the Hermitian matrix-matrix operations: using alternative indexing semantics.
	*
	* @param side - specifies the side of the operation
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param M - number of rows
	* @param N - number of columns
	* @param alpha - scalar constant
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param beta - scalar constant
	* @param C - `C`
	* @param strideC1 - stride of `C`
	* @param strideC2 - stride of `C`
	* @param offsetC - starting index for `C`
	* @returns result
	*/
	ndarray( side: OperationSide, uplo: MatrixTriangle, M: number, N: number, alpha: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, beta: number, C: Float64Array, strideC1: number, strideC2: number, offsetC: number ): Float64Array;
}

/**
* Performs one of the Hermitian matrix-matrix operations:.
*/
declare var zhemm: Routine;


// EXPORTS //

export = zhemm;
