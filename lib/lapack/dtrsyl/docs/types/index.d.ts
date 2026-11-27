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
* Interface describing `dtrsyl`.
*/
interface Routine {
	/**
	* Solves the real Sylvester matrix equation:.
	*
	* @param trana - `trana`
	* @param tranb - `tranb`
	* @param isgn - `isgn`
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param C - `C`
	* @param LDC - leading dimension of `C`
	* @param scale - `scale`
	* @returns result
	*/
	( trana: string, tranb: string, isgn: string, M: number, N: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, C: Float64Array, LDC: number, scale: number ): Float64Array;

	/**
	* Solves the real Sylvester matrix equation: using alternative indexing semantics.
	*
	* @param trana - `trana`
	* @param tranb - `tranb`
	* @param isgn - `isgn`
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param C - `C`
	* @param strideC1 - stride of `C`
	* @param strideC2 - stride of `C`
	* @param offsetC - starting index for `C`
	* @param scale - `scale`
	* @returns result
	*/
	ndarray( trana: string, tranb: string, isgn: string, M: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, C: Float64Array, strideC1: number, strideC2: number, offsetC: number, scale: number ): Float64Array;
}

/**
* Solves the real Sylvester matrix equation:.
*/
declare var dtrsyl: Routine;


// EXPORTS //

export = dtrsyl;
