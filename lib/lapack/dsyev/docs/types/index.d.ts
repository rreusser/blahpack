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
* Interface describing `dsyev`.
*/
interface Routine {
	/**
	* Computes all eigenvalues and, optionally, eigenvectors of a real symmetric.
	*
	* @param order - storage layout
	* @param jobz - `jobz`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @returns result
	*/
	( order: Layout, jobz: string, uplo: MatrixTriangle, N: number, A: Float64Array, LDA: number, w: Float64Array, strideW: number, WORK: Float64Array, strideWORK: number ): Float64Array;

	/**
	* Computes all eigenvalues and, optionally, eigenvectors of a real symmetric using alternative indexing semantics.
	*
	* @param jobz - `jobz`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param offsetW - starting index for `W`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( jobz: string, uplo: MatrixTriangle, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, w: Float64Array, strideW: number, offsetW: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Computes all eigenvalues and, optionally, eigenvectors of a real symmetric.
*/
declare var dsyev: Routine;


// EXPORTS //

export = dsyev;
