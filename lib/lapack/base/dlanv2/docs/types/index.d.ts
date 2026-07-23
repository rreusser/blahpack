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
* Interface describing `dlanv2`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param a - `a`
	* @param b - `b`
	* @param c - `c`
	* @param d - `d`
	* @returns result
	*/
	( a: number, b: number, c: number, d: number ): { B: number; C: number; rt1r: number; rt1i: number; rt2r: number; cs: number };

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param A - `A`
	* @param B - `B`
	* @param C - `C`
	* @param D - `D`
	* @returns result
	*/
	ndarray( A: number, B: number, C: number, D: number ): { B: number; C: number; rt1r: number; rt1i: number; rt2r: number; cs: number };
}

/**
* @license MIT.
*/
declare var dlanv2: Routine;


// EXPORTS //

export = dlanv2;
