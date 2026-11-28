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
* Interface describing `dgbequ`.
*/
interface Routine {
	/**
	* Computes row and column scalings to equilibrate a real general band matrix.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param kl - number of subdiagonals
	* @param ku - number of superdiagonals
	* @param AB - `AB`
	* @param LDAB - leading dimension of `AB`
	* @param r - `r`
	* @param strideR - stride of `R`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @returns result
	*/
	( M: number, N: number, kl: number, ku: number, AB: Float64Array, LDAB: number, r: Float64Array, strideR: number, c: Float64Array, strideC: number ): Float64Array;

	/**
	* Computes row and column scalings to equilibrate a real general band matrix using alternative indexing semantics.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param kl - number of subdiagonals
	* @param ku - number of superdiagonals
	* @param AB - `AB`
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param r - `r`
	* @param strideR - stride of `R`
	* @param offsetR - starting index for `R`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param offsetC - starting index for `C`
	* @returns result
	*/
	ndarray( M: number, N: number, kl: number, ku: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, r: Float64Array, strideR: number, offsetR: number, c: Float64Array, strideC: number, offsetC: number ): Float64Array;
}

/**
* Computes row and column scalings to equilibrate a real general band matrix.
*/
declare var dgbequ: Routine;


// EXPORTS //

export = dgbequ;
