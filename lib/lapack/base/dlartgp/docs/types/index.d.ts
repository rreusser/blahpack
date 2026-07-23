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
* Interface describing `dlartgp`.
*/
interface Routine {
	/**
	* Generates a plane rotation with non-negative diagonal.
	*
	* @param f - `f`
	* @param g - `g`
	* @returns result
	*/
	( f: number, g: number ): Float64Array;

	/**
	* Generates a plane rotation with non-negative diagonal using alternative indexing semantics.
	*
	* @param f - `f`
	* @param g - `g`
	* @param out - `out`
	* @returns result
	*/
	ndarray( f: number, g: number, out: number ): Float64Array;
}

/**
* Generates a plane rotation with non-negative diagonal.
*/
declare var dlartgp: Routine;


// EXPORTS //

export = dlartgp;
