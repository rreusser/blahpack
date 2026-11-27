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
* Interface describing `dlapy3`.
*/
interface Routine {
	/**
	* Computes sqrt(x^2 + y^2 + z^2) safely, avoiding unnecessary overflow.
	*
	* @param x - `x`
	* @param y - `y`
	* @param z - `z`
	* @returns result
	*/
	( x: number, y: number, z: number ): number;

	/**
	* Computes sqrt(x^2 + y^2 + z^2) safely, avoiding unnecessary overflow using alternative indexing semantics.
	*
	* @param x - `x`
	* @param y - `y`
	* @param z - `z`
	* @returns result
	*/
	ndarray( x: number, y: number, z: number ): number;
}

/**
* Computes sqrt(x^2 + y^2 + z^2) safely, avoiding unnecessary overflow.
*/
declare var dlapy3: Routine;


// EXPORTS //

export = dlapy3;
