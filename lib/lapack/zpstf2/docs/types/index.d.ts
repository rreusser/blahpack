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

import { MatrixTriangle, Layout } from '@stdlib/types/blas';

/**
* Interface describing `zpstf2`.
*/
interface Routine {
	/**
	* Computes the Cholesky factorization with complete pivoting of a complex Hermitian positive semi-definite matrix (unblocked algorithm).
	*
	* @param order - storage layout
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param PIV - `PIV`
	* @param RANK - `RANK`
	* @param tol - `tol`
	* @param WORK - `WORK`
	* @returns result
	*/
	( order: Layout, uplo: MatrixTriangle, N: number, A: Float64Array, LDA: number, PIV: Float64Array, RANK: number, tol: number, WORK: number ): Float64Array;

	/**
	* Computes the Cholesky factorization with complete pivoting of a complex Hermitian positive semi-definite matrix (unblocked algorithm) using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param PIV - `PIV`
	* @param stridePIV - stride of `PIV`
	* @param offsetPIV - starting index for `PIV`
	* @param RANK - `RANK`
	* @param tol - `tol`
	* @param WORK - `WORK`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, PIV: Float64Array, stridePIV: number, offsetPIV: number, RANK: number, tol: number, WORK: number ): Float64Array;
}

/**
* Computes the Cholesky factorization with complete pivoting of a complex Hermitian positive semi-definite matrix (unblocked algorithm).
*/
declare var zpstf2: Routine;


// EXPORTS //

export = zpstf2;
