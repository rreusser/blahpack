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
* Interface describing `zlacrt`.
*/
interface Routine {
	/**
	* Applies a plane rotation to two complex vectors, where both the cosine.
	*
	* @param N - number of columns
	* @param cx - `cx`
	* @param strideX - stride of `X`
	* @param cy - `cy`
	* @param strideY - stride of `Y`
	* @param c - `c`
	* @param s - `s`
	* @returns result
	*/
	( N: number, cx: number, strideX: number, cy: number, strideY: number, c: number, s: number ): Float64Array;

	/**
	* Applies a plane rotation to two complex vectors, where both the cosine using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param cx - `cx`
	* @param strideX - stride of `X`
	* @param offsetX - starting index for `X`
	* @param cy - `cy`
	* @param strideY - stride of `Y`
	* @param offsetY - starting index for `Y`
	* @param c - `c`
	* @param s - `s`
	* @returns result
	*/
	ndarray( N: number, cx: number, strideX: number, offsetX: number, cy: number, strideY: number, offsetY: number, c: number, s: number ): Float64Array;
}

/**
* Applies a plane rotation to two complex vectors, where both the cosine.
*/
declare var zlacrt: Routine;


// EXPORTS //

export = zlacrt;
