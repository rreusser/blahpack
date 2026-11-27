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
* Interface describing `dlarnv`.
*/
interface Routine {
	/**
	* Returns a vector of n random real numbers from a uniform or normal distribution.
	*
	* @param idist - `idist`
	* @param iseed - `iseed`
	* @param strideISEED - stride of `ISEED`
	* @param N - number of columns
	* @param x - `x`
	* @param stride - stride of ``
	* @returns result
	*/
	( idist: number, iseed: Float64Array, strideISEED: number, N: number, x: number, stride: number ): Float64Array;

	/**
	* Returns a vector of n random real numbers from a uniform or normal distribution using alternative indexing semantics.
	*
	* @param idist - `idist`
	* @param iseed - `iseed`
	* @param strideISEED - stride of `ISEED`
	* @param offsetISEED - starting index for `ISEED`
	* @param N - number of columns
	* @param x - `x`
	* @param stride - stride of ``
	* @param offset - starting index for ``
	* @returns result
	*/
	ndarray( idist: number, iseed: Float64Array, strideISEED: number, offsetISEED: number, N: number, x: number, stride: number, offset: number ): Float64Array;
}

/**
* Returns a vector of n random real numbers from a uniform or normal distribution.
*/
declare var dlarnv: Routine;


// EXPORTS //

export = dlarnv;
