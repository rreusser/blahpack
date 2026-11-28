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
* Interface describing `dnrm2`.
*/
interface Routine {
	/**
	* Computes the Euclidean norm of a real double-precision vector.
	*
	* @param N - number of columns
	* @param x - `x`
	* @param stride - stride of ``
	* @returns result
	*/
	( N: number, x: number, stride: number ): Float64Array;

	/**
	* Computes the Euclidean norm of a real double-precision vector using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param x - `x`
	* @param stride - stride of ``
	* @param offset - starting index for ``
	* @returns result
	*/
	ndarray( N: number, x: number, stride: number, offset: number ): Float64Array;
}

/**
* Computes the Euclidean norm of a real double-precision vector.
*/
declare var dnrm2: Routine;


// EXPORTS //

export = dnrm2;
