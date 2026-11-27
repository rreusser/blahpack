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
* Interface describing `dsygs2`.
*/
interface Routine {
	/**
	* Reduces a real symmetric-definite generalized eigenproblem to standard form.
	*
	* @param itype - `itype`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @returns result
	*/
	( itype: number, uplo: MatrixTriangle, N: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number ): Float64Array;

	/**
	* Reduces a real symmetric-definite generalized eigenproblem to standard form using alternative indexing semantics.
	*
	* @param itype - `itype`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @returns result
	*/
	ndarray( itype: number, uplo: MatrixTriangle, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number ): Float64Array;
}

/**
* Reduces a real symmetric-definite generalized eigenproblem to standard form.
*/
declare var dsygs2: Routine;


// EXPORTS //

export = dsygs2;
