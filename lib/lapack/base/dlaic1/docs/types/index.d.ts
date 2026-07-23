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
* Interface describing `dlaic1`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param job - `job`
	* @param J - `J`
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param sest - `sest`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param gamma - `gamma`
	* @param out - `out`
	* @returns result
	*/
	( job: string, J: number, x: Float64Array, strideX: number, sest: number, w: Float64Array, strideW: number, gamma: number, out: number ): Float64Array;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param job - `job`
	* @param J - `J`
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param offsetX - starting index for `X`
	* @param sest - `sest`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param offsetW - starting index for `W`
	* @param gamma - `gamma`
	* @param out - `out`
	* @returns result
	*/
	ndarray( job: string, J: number, x: Float64Array, strideX: number, offsetX: number, sest: number, w: Float64Array, strideW: number, offsetW: number, gamma: number, out: number ): Float64Array;
}

/**
* @license MIT.
*/
declare var dlaic1: Routine;


// EXPORTS //

export = dlaic1;
