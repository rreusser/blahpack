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
* Interface describing `zlartg`.
*/
interface Routine {
	/**
	* Compute |re|^2 + |im|^2.
	*
	* @param f - `f`
	* @param offsetF - starting index for `F`
	* @param g - `g`
	* @param offsetG - starting index for `G`
	* @param c - `c`
	* @param offsetC - starting index for `C`
	* @param s - `s`
	* @param offsetS - starting index for `S`
	* @param r - `r`
	* @param offsetR - starting index for `R`
	* @returns result
	*/
	( f: number, offsetF: number, g: number, offsetG: number, c: number, offsetC: number, s: number, offsetS: number, r: number, offsetR: number ): void;

	/**
	* Compute |re|^2 + |im|^2 using alternative indexing semantics.
	*
	* @param f - `f`
	* @param offsetF - starting index for `F`
	* @param g - `g`
	* @param offsetG - starting index for `G`
	* @param c - `c`
	* @param offsetC - starting index for `C`
	* @param s - `s`
	* @param offsetS - starting index for `S`
	* @param r - `r`
	* @param offsetR - starting index for `R`
	* @returns result
	*/
	ndarray( f: number, offsetF: number, g: number, offsetG: number, c: number, offsetC: number, s: number, offsetS: number, r: number, offsetR: number ): void;
}

/**
* Compute |re|^2 + |im|^2.
*/
declare var zlartg: Routine;


// EXPORTS //

export = zlartg;
