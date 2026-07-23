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
* Interface describing `dlaneg`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param N - number of columns
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param LLD - `LLD`
	* @param strideLLD - stride of `LLD`
	* @param sigma - `sigma`
	* @param pivmin - `pivmin`
	* @param r - `r`
	* @returns result
	*/
	( N: number, d: Float64Array, strideD: number, LLD: Float64Array, strideLLD: number, sigma: number, pivmin: number, r: number ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param LLD - `LLD`
	* @param strideLLD - stride of `LLD`
	* @param offsetLLD - starting index for `LLD`
	* @param sigma - `sigma`
	* @param pivmin - `pivmin`
	* @param r - `r`
	* @returns result
	*/
	ndarray( N: number, d: Float64Array, strideD: number, offsetD: number, LLD: Float64Array, strideLLD: number, offsetLLD: number, sigma: number, pivmin: number, r: number ): number;
}

/**
* @license MIT.
*/
declare var dlaneg: Routine;


// EXPORTS //

export = dlaneg;
