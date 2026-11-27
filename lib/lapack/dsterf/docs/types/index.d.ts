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
* Interface describing `dsterf`.
*/
interface Routine {
	/**
	* Computes all eigenvalues of a real symmetric tridiagonal matrix using the.
	*
	* @param N - number of columns
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @returns result
	*/
	( N: number, d: Float64Array, strideD: number, e: Float64Array, strideE: number ): Float64Array;

	/**
	* Computes all eigenvalues of a real symmetric tridiagonal matrix using the using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param offsetE - starting index for `E`
	* @returns result
	*/
	ndarray( N: number, d: Float64Array, strideD: number, offsetD: number, e: Float64Array, strideE: number, offsetE: number ): Float64Array;
}

/**
* Computes all eigenvalues of a real symmetric tridiagonal matrix using the.
*/
declare var dsterf: Routine;


// EXPORTS //

export = dsterf;
