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
* Interface describing `zrotg`.
*/
interface Routine {
	/**
	* Computes the parameters for a Givens rotation.
	*
	* @param re - `re`
	* @param im - `im`
	* @returns result
	*/
	( re: number, im: number ): void;

	/**
	* Computes the parameters for a Givens rotation using alternative indexing semantics.
	*
	* @param a - `a`
	* @param offsetA - starting index for `A`
	* @param b - `b`
	* @param offsetB - starting index for `B`
	* @param c - `c`
	* @param offsetC - starting index for `C`
	* @param s - `s`
	* @param offsetS - starting index for `S`
	* @returns result
	*/
	ndarray( a: number, offsetA: number, b: number, offsetB: number, c: number, offsetC: number, s: number, offsetS: number ): void;
}

/**
* Computes the parameters for a Givens rotation.
*/
declare var zrotg: Routine;


// EXPORTS //

export = zrotg;
