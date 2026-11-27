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
* Interface describing `dlarrc`.
*/
interface Routine {
	/**
	* Counts the number of eigenvalues of a symmetric tridiagonal matrix in an interval.
	*
	* @param jobt - `jobt`
	* @param N - number of columns
	* @param vl - `vl`
	* @param vu - `vu`
	* @param D - `D`
	* @param E - `E`
	* @param pivmin - `pivmin`
	* @returns result
	*/
	( jobt: string, N: number, vl: number, vu: number, D: Float64Array, E: Float64Array, pivmin: number ): Float64Array;

	/**
	* Counts the number of eigenvalues of a symmetric tridiagonal matrix in an interval using alternative indexing semantics.
	*
	* @param jobt - `jobt`
	* @param N - number of columns
	* @param vl - `vl`
	* @param vu - `vu`
	* @param D - `D`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param E - `E`
	* @param strideE - stride of `E`
	* @param offsetE - starting index for `E`
	* @param pivmin - `pivmin`
	* @returns result
	*/
	ndarray( jobt: string, N: number, vl: number, vu: number, D: Float64Array, strideD: number, offsetD: number, E: Float64Array, strideE: number, offsetE: number, pivmin: number ): Float64Array;
}

/**
* Counts the number of eigenvalues of a symmetric tridiagonal matrix in an interval.
*/
declare var dlarrc: Routine;


// EXPORTS //

export = dlarrc;
