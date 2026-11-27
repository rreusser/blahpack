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
* Interface describing `dlagts`.
*/
interface Routine {
	/**
	* Solves the system (T - lambda_I)_x = y or (T - lambda_I)__T_x = y using.
	*
	* @param job - `job`
	* @param N - number of columns
	* @param a - `a`
	* @param strideA - stride of `A`
	* @param b - `b`
	* @param strideB - stride of `B`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param IN - `IN`
	* @param strideIN - stride of `IN`
	* @param y - `y`
	* @param strideY - stride of `Y`
	* @param tol - `tol`
	* @returns result
	*/
	( job: string, N: number, a: Float64Array, strideA: number, b: Float64Array, strideB: number, c: Float64Array, strideC: number, d: Float64Array, strideD: number, IN: Float64Array, strideIN: number, y: Float64Array, strideY: number, tol: number ): Float64Array;

	/**
	* Solves the system (T - lambda_I)_x = y or (T - lambda_I)__T_x = y using using alternative indexing semantics.
	*
	* @param job - `job`
	* @param N - number of columns
	* @param a - `a`
	* @param strideA - stride of `A`
	* @param offsetA - starting index for `A`
	* @param b - `b`
	* @param strideB - stride of `B`
	* @param offsetB - starting index for `B`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param offsetC - starting index for `C`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param IN - `IN`
	* @param strideIN - stride of `IN`
	* @param offsetIN - starting index for `IN`
	* @param y - `y`
	* @param strideY - stride of `Y`
	* @param offsetY - starting index for `Y`
	* @param tol - `tol`
	* @returns result
	*/
	ndarray( job: string, N: number, a: Float64Array, strideA: number, offsetA: number, b: Float64Array, strideB: number, offsetB: number, c: Float64Array, strideC: number, offsetC: number, d: Float64Array, strideD: number, offsetD: number, IN: Float64Array, strideIN: number, offsetIN: number, y: Float64Array, strideY: number, offsetY: number, tol: number ): Float64Array;
}

/**
* Solves the system (T - lambda_I)_x = y or (T - lambda_I)__T_x = y using.
*/
declare var dlagts: Routine;


// EXPORTS //

export = dlagts;
