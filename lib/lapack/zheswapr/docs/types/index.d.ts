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



/**
* Interface describing `zheswapr`.
*/
interface Routine {
	/**
	* Applies an elementary permutation to a complex Hermitian matrix
	*
	* @param uplo - specifies the operation type
	* @param N - number of columns
	* @param a - input array
	* @param strideA - stride length for `a`
	* @param lda - lda
	* @param i1 - i1
	* @param i2 - i2
	* @returns result
	*/
	( uplo: string, N: number, a: Float64Array, strideA: number, lda: number, i1: number, i2: number ): Float64Array;

	/**
	* Applies an elementary permutation to a complex Hermitian matrix, using alternative indexing semantics.
	*
	* @param uplo - specifies the operation type
	* @param N - number of columns
	* @param a - input array
	* @param strideA - stride length for `a`
	* @param offsetA - starting index for `A`
	* @param lda - lda
	* @param i1 - i1
	* @param i2 - i2
	* @returns result
	*/
	ndarray( uplo: string, N: number, a: Float64Array, strideA: number, offsetA: number, lda: number, i1: number, i2: number ): Float64Array;
}

/**
* Applies an elementary permutation to a complex Hermitian matrix
*/
declare var zheswapr: Routine;


// EXPORTS //

export = zheswapr;
