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
* Interface describing `dlaqge`.
*/
interface Routine {
	/**
	* Equilibrates a general M-by-N matrix A using the row and column scaling.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param r - `r`
	* @param strideR - stride of `R`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param rowcnd - `rowcnd`
	* @param colcnd - `colcnd`
	* @param amax - `amax`
	* @returns result
	*/
	( M: number, N: number, A: Float64Array, LDA: number, r: Float64Array, strideR: number, c: Float64Array, strideC: number, rowcnd: number, colcnd: number, amax: number ): Float64Array;

	/**
	* Equilibrates a general M-by-N matrix A using the row and column scaling using alternative indexing semantics.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param r - `r`
	* @param strideR - stride of `R`
	* @param offsetR - starting index for `R`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param offsetC - starting index for `C`
	* @param rowcnd - `rowcnd`
	* @param colcnd - `colcnd`
	* @param amax - `amax`
	* @param equed - `equed`
	* @returns result
	*/
	ndarray( M: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, r: Float64Array, strideR: number, offsetR: number, c: Float64Array, strideC: number, offsetC: number, rowcnd: number, colcnd: number, amax: number, equed: string ): Float64Array;
}

/**
* Equilibrates a general M-by-N matrix A using the row and column scaling.
*/
declare var dlaqge: Routine;


// EXPORTS //

export = dlaqge;
