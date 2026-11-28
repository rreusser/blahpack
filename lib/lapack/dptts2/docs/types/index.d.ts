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
* Interface describing `dptts2`.
*/
interface Routine {
	/**
	* Solves a tridiagonal system of the form A _ X = B using the L_D*L^T.
	*
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @returns result
	*/
	( N: number, nrhs: number, d: Float64Array, strideD: number, e: Float64Array, strideE: number, B: Float64Array, LDB: number ): Float64Array;

	/**
	* Solves a tridiagonal system of the form A _ X = B using the L_D*L^T using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param offsetE - starting index for `E`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @returns result
	*/
	ndarray( N: number, nrhs: number, d: Float64Array, strideD: number, offsetD: number, e: Float64Array, strideE: number, offsetE: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number ): Float64Array;
}

/**
* Solves a tridiagonal system of the form A _ X = B using the L_D*L^T.
*/
declare var dptts2: Routine;


// EXPORTS //

export = dptts2;
