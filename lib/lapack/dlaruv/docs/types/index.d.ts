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
* Interface describing `dlaruv`.
*/
interface Routine {
	/**
	* Returns a vector of n random real numbers from a uniform (0,1) distribution.
	*
	* @param iseed - `iseed`
	* @param strideISEED - stride of `ISEED`
	* @param N - number of columns
	* @param x - `x`
	* @param strideX - stride of `X`
	* @returns result
	*/
	( iseed: Float64Array, strideISEED: number, N: number, x: Float64Array, strideX: number ): Float64Array;

	/**
	* Returns a vector of n random real numbers from a uniform (0,1) distribution using alternative indexing semantics.
	*
	* @param iseed - `iseed`
	* @param strideISEED - stride of `ISEED`
	* @param offsetISEED - starting index for `ISEED`
	* @param N - number of columns
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param offsetX - starting index for `X`
	* @returns result
	*/
	ndarray( iseed: Float64Array, strideISEED: number, offsetISEED: number, N: number, x: Float64Array, strideX: number, offsetX: number ): Float64Array;
}

/**
* Returns a vector of n random real numbers from a uniform (0,1) distribution.
*/
declare var dlaruv: Routine;


// EXPORTS //

export = dlaruv;
