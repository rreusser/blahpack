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
* Interface describing `dla_wwaddw`.
*/
interface Routine {
	/**
	* Adds a vector in doubled-single precision representation
	*
	* @param N - number of columns
	* @param x - input array
	* @param strideX - stride length for `x`
	* @param y - input array
	* @param strideY - stride length for `y`
	* @param w - output array
	* @param strideW - stride length for `w`
	* @returns result
	*/
	( N: number, x: Float64Array, strideX: number, y: Float64Array, strideY: number, w: Float64Array, strideW: number ): Float64Array;

	/**
	* Adds a vector in doubled-single precision representation, using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param x - input array
	* @param strideX - stride length for `x`
	* @param offsetX - starting index for `X`
	* @param y - input array
	* @param strideY - stride length for `y`
	* @param offsetY - starting index for `Y`
	* @param w - output array
	* @param strideW - stride length for `w`
	* @param offsetW - starting index for `W`
	* @returns result
	*/
	ndarray( N: number, x: Float64Array, strideX: number, offsetX: number, y: Float64Array, strideY: number, offsetY: number, w: Float64Array, strideW: number, offsetW: number ): Float64Array;
}

/**
* Adds a vector in doubled-single precision representation
*/
declare var dla_wwaddw: Routine;


// EXPORTS //

export = dla_wwaddw;
