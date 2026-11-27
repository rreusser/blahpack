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
* Interface describing `dlasrt`.
*/
interface Routine {
	/**
	* Sort an array of doubles in increasing or decreasing order using quicksort.
	*
	* @param id - `id`
	* @param N - number of columns
	* @param d - `d`
	* @param stride - stride of ``
	* @returns result
	*/
	( id: number, N: number, d: number, stride: number ): Float64Array;

	/**
	* Sort an array of doubles in increasing or decreasing order using quicksort using alternative indexing semantics.
	*
	* @param id - `id`
	* @param N - number of columns
	* @param d - `d`
	* @param stride - stride of ``
	* @param offset - starting index for ``
	* @returns result
	*/
	ndarray( id: number, N: number, d: number, stride: number, offset: number ): Float64Array;
}

/**
* Sort an array of doubles in increasing or decreasing order using quicksort.
*/
declare var dlasrt: Routine;


// EXPORTS //

export = dlasrt;
