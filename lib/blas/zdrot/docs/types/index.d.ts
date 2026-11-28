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
* Interface describing `zdrot`.
*/
interface Routine {
	/**
	* Applies a real plane rotation to a pair of complex double-precision vectors:.
	*
	* @param N - number of columns
	* @param zx - `zx`
	* @param strideX - stride of `X`
	* @param zy - `zy`
	* @param strideY - stride of `Y`
	* @param c - `c`
	* @param s - `s`
	* @returns result
	*/
	( N: number, zx: number, strideX: number, zy: number, strideY: number, c: number, s: number ): Float64Array;

	/**
	* Applies a real plane rotation to a pair of complex double-precision vectors: using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param zx - `zx`
	* @param strideX - stride of `X`
	* @param offsetX - starting index for `X`
	* @param zy - `zy`
	* @param strideY - stride of `Y`
	* @param offsetY - starting index for `Y`
	* @param c - `c`
	* @param s - `s`
	* @returns result
	*/
	ndarray( N: number, zx: number, strideX: number, offsetX: number, zy: number, strideY: number, offsetY: number, c: number, s: number ): Float64Array;
}

/**
* Applies a real plane rotation to a pair of complex double-precision vectors:.
*/
declare var zdrot: Routine;


// EXPORTS //

export = zdrot;
