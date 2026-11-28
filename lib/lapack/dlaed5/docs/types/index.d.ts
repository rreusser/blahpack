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
* Interface describing `dlaed5`.
*/
interface Routine {
	/**
	* Solves the 2-by-2 secular equation.
	*
	* @param i - `i`
	* @param D - `D`
	* @param Z - `Z`
	* @param DELTA - `DELTA`
	* @param rho - `rho`
	* @param dlam - `dlam`
	* @returns result
	*/
	( i: number, D: Float64Array, Z: Float64Array, DELTA: Float64Array, rho: number, dlam: number ): Float64Array;

	/**
	* Solves the 2-by-2 secular equation using alternative indexing semantics.
	*
	* @param i - `i`
	* @param D - `D`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param Z - `Z`
	* @param strideZ - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param DELTA - `DELTA`
	* @param strideDELTA - stride of `DELTA`
	* @param offsetDELTA - starting index for `DELTA`
	* @param rho - `rho`
	* @param dlam - `dlam`
	* @returns result
	*/
	ndarray( i: number, D: Float64Array, strideD: number, offsetD: number, Z: Float64Array, strideZ: number, offsetZ: number, DELTA: Float64Array, strideDELTA: number, offsetDELTA: number, rho: number, dlam: number ): Float64Array;
}

/**
* Solves the 2-by-2 secular equation.
*/
declare var dlaed5: Routine;


// EXPORTS //

export = dlaed5;
