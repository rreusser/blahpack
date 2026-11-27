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
* Interface describing `dpftri`.
*/
interface Routine {
	/**
	* Computes the inverse of A real symmetric positive definite matrix in Rectangular Full Packed format.
	*
	* @param transr - `transr`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @returns result
	*/
	( transr: string, uplo: MatrixTriangle, N: number, A: Float64Array ): Float64Array;

	/**
	* Computes the inverse of A real symmetric positive definite matrix in Rectangular Full Packed format using alternative indexing semantics.
	*
	* @param transr - `transr`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param strideA - stride of `A`
	* @param offsetA - starting index for `A`
	* @returns result
	*/
	ndarray( transr: string, uplo: MatrixTriangle, N: number, A: Float64Array, strideA: number, offsetA: number ): Float64Array;
}

/**
* Computes the inverse of A real symmetric positive definite matrix in Rectangular Full Packed format.
*/
declare var dpftri: Routine;


// EXPORTS //

export = dpftri;
