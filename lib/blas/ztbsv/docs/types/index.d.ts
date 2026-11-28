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

import { MatrixTriangle, TransposeOperation, DiagonalType, Layout } from '@stdlib/types/blas';

/**
* Interface describing `ztbsv`.
*/
interface Routine {
	/**
	* Solves one of the systems of equations:.
	*
	* @param order - storage layout
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param trans - specifies whether the matrix should be transposed
	* @param diag - specifies whether the matrix is unit triangular
	* @param N - number of columns
	* @param K - inner dimension
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param x - `x`
	* @param strideX - stride of `X`
	* @returns result
	*/
	( order: Layout, uplo: MatrixTriangle, trans: TransposeOperation, diag: DiagonalType, N: number, K: number, A: Float64Array, LDA: number, x: Float64Array, strideX: number ): Float64Array;

	/**
	* Solves one of the systems of equations: using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param trans - specifies whether the matrix should be transposed
	* @param diag - specifies whether the matrix is unit triangular
	* @param N - number of columns
	* @param K - inner dimension
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param offsetX - starting index for `X`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, trans: TransposeOperation, diag: DiagonalType, N: number, K: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, x: Float64Array, strideX: number, offsetX: number ): Float64Array;
}

/**
* Solves one of the systems of equations:.
*/
declare var ztbsv: Routine;


// EXPORTS //

export = ztbsv;
