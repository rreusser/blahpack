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
* Interface describing `zlargv`.
*/
interface Routine {
	/**
	* Generates a vector of complex plane rotations with real cosines and complex sines.
	*
	* @param N - number of columns
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param y - `y`
	* @param strideY - stride of `Y`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @returns result
	*/
	( N: number, x: Float64Array, strideX: number, y: Float64Array, strideY: number, c: Float64Array, strideC: number ): Float64Array;

	/**
	* Generates a vector of complex plane rotations with real cosines and complex sines using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param offsetX - starting index for `X`
	* @param y - `y`
	* @param strideY - stride of `Y`
	* @param offsetY - starting index for `Y`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param offsetC - starting index for `C`
	* @returns result
	*/
	ndarray( N: number, x: Float64Array, strideX: number, offsetX: number, y: Float64Array, strideY: number, offsetY: number, c: Float64Array, strideC: number, offsetC: number ): Float64Array;
}

/**
* Generates a vector of complex plane rotations with real cosines and complex sines.
*/
declare var zlargv: Routine;


// EXPORTS //

export = zlargv;
