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
* Interface describing `ddot`.
*/
interface Routine {
	/**
	* @license Apache-2.0.
	*
	* @param N - number of columns
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param offsetX - starting index for `X`
	* @param y - `y`
	* @param strideY - stride of `Y`
	* @param offsetY - starting index for `Y`
	* @returns result
	*/
	( N: number, x: Float64Array, strideX: number, offsetX: number, y: Float64Array, strideY: number, offsetY: number ): Float64Array;
}

/**
* @license Apache-2.0.
*/
declare var ddot: Routine;


// EXPORTS //

export = ddot;
