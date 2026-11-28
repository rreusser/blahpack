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
* Interface describing `dscal`.
*/
interface Routine {
	/**
	* @license Apache-2.0.
	*
	* @param N - number of columns
	* @param da - `da`
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param offsetX - starting index for `X`
	* @returns result
	*/
	( N: number, da: number, x: Float64Array, strideX: number, offsetX: number ): Float64Array;
}

/**
* @license Apache-2.0.
*/
declare var dscal: Routine;


// EXPORTS //

export = dscal;
