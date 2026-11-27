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
* Interface describing `izmax1`.
*/
interface Routine {
	/**
	* Finds the index of the first vector element of maximum absolute value.
	*
	* @param N - number of columns
	* @param ZX - `ZX`
	* @param strideZX - stride of `ZX`
	* @returns result
	*/
	( N: number, ZX: Float64Array, strideZX: number ): Float64Array;

	/**
	* Finds the index of the first vector element of maximum absolute value using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param ZX - `ZX`
	* @param strideZX - stride of `ZX`
	* @param offsetZX - starting index for `ZX`
	* @returns result
	*/
	ndarray( N: number, ZX: Float64Array, strideZX: number, offsetZX: number ): Float64Array;
}

/**
* Finds the index of the first vector element of maximum absolute value.
*/
declare var izmax1: Routine;


// EXPORTS //

export = izmax1;
