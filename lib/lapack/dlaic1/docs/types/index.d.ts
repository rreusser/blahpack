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

/// <reference types="@stdlib/types"/>



/**
* Interface describing `dlaic1`.
*/
interface Routine {
	/**
	* Applies one step of incremental condition estimation
	*
	* @param job - job
	* @param j - j
	* @param x - input array
	* @param strideX - stride length for `x`
	* @param sest - sest
	* @param w - input array
	* @param strideW - stride length for `w`
	* @param gamma - gamma
	* @param sestpr - sestpr
	* @param s - s
	* @param c - c
	* @returns result
	*/
	( job: number, j: number, x: Float64Array, strideX: number, sest: number, w: Float64Array, strideW: number, gamma: number, sestpr: number, s: number, c: number ): Float64Array;

	/**
	* Applies one step of incremental condition estimation, using alternative indexing semantics.
	*
	* @param job - job
	* @param j - j
	* @param x - input array
	* @param strideX - stride length for `x`
	* @param offsetX - starting index for `X`
	* @param sest - sest
	* @param w - input array
	* @param strideW - stride length for `w`
	* @param offsetW - starting index for `W`
	* @param gamma - gamma
	* @param sestpr - sestpr
	* @param s - s
	* @param c - c
	* @returns result
	*/
	ndarray( job: number, j: number, x: Float64Array, strideX: number, offsetX: number, sest: number, w: Float64Array, strideW: number, offsetW: number, gamma: number, sestpr: number, s: number, c: number ): Float64Array;
}

/**
* Applies one step of incremental condition estimation
*/
declare var dlaic1: Routine;


// EXPORTS //

export = dlaic1;
