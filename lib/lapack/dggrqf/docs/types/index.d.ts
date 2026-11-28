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

/**
* Interface describing `dggrqf`.
*/
interface Routine {
	/**
	* Computes a generalized RQ factorization of an M-by-N matrix A and a.
	*
	* @param M - number of rows
	* @param p - `p`
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param TAUA - `TAUA`
	* @param strideTAUA - stride of `TAUA`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param TAUB - `TAUB`
	* @param strideTAUB - stride of `TAUB`
	* @returns result
	*/
	( M: number, p: number, N: number, A: Float64Array, LDA: number, TAUA: Float64Array, strideTAUA: number, B: Float64Array, LDB: number, TAUB: Float64Array, strideTAUB: number ): Float64Array;

	/**
	* Computes a generalized RQ factorization of an M-by-N matrix A and a using alternative indexing semantics.
	*
	* @param M - number of rows
	* @param p - `p`
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param TAUA - `TAUA`
	* @param strideTAUA - stride of `TAUA`
	* @param offsetTAUA - starting index for `TAUA`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param TAUB - `TAUB`
	* @param strideTAUB - stride of `TAUB`
	* @param offsetTAUB - starting index for `TAUB`
	* @returns result
	*/
	ndarray( M: number, p: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, TAUA: Float64Array, strideTAUA: number, offsetTAUA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, TAUB: Float64Array, strideTAUB: number, offsetTAUB: number ): Float64Array;
}

/**
* Computes a generalized RQ factorization of an M-by-N matrix A and a.
*/
declare var dggrqf: Routine;


// EXPORTS //

export = dggrqf;
