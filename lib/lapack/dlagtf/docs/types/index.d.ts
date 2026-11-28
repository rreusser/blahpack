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
* Interface describing `dlagtf`.
*/
interface Routine {
	/**
	* Computes an LU factorization of the matrix (T - lambda_I), where T is an.
	*
	* @param N - number of columns
	* @param a - `a`
	* @param strideA - stride of `A`
	* @param lambda - `lambda`
	* @param b - `b`
	* @param strideB - stride of `B`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param tol - `tol`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param IN - `IN`
	* @param strideIN - stride of `IN`
	* @returns result
	*/
	( N: number, a: Float64Array, strideA: number, lambda: number, b: Float64Array, strideB: number, c: Float64Array, strideC: number, tol: number, d: Float64Array, strideD: number, IN: Float64Array, strideIN: number ): Float64Array;

	/**
	* Computes an LU factorization of the matrix (T - lambda_I), where T is an using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param a - `a`
	* @param strideA - stride of `A`
	* @param offsetA - starting index for `A`
	* @param lambda - `lambda`
	* @param b - `b`
	* @param strideB - stride of `B`
	* @param offsetB - starting index for `B`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param offsetC - starting index for `C`
	* @param tol - `tol`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param IN - `IN`
	* @param strideIN - stride of `IN`
	* @param offsetIN - starting index for `IN`
	* @returns result
	*/
	ndarray( N: number, a: Float64Array, strideA: number, offsetA: number, lambda: number, b: Float64Array, strideB: number, offsetB: number, c: Float64Array, strideC: number, offsetC: number, tol: number, d: Float64Array, strideD: number, offsetD: number, IN: Float64Array, strideIN: number, offsetIN: number ): Float64Array;
}

/**
* Computes an LU factorization of the matrix (T - lambda_I), where T is an.
*/
declare var dlagtf: Routine;


// EXPORTS //

export = dlagtf;
