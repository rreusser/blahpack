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
* Interface describing `dlaed6`.
*/
interface Routine {
	/**
	* Computes the positive or negative root (closest to the origin) of the secular equation.
	*
	* @param kniter - `kniter`
	* @param orgati - `orgati`
	* @param rho - `rho`
	* @param d - `d`
	* @param z - `z`
	* @param finit - `finit`
	* @param tau - `tau`
	* @returns result
	*/
	( kniter: number, orgati: number, rho: number, d: Float64Array, z: Float64Array, finit: number, tau: number ): Float64Array;

	/**
	* Computes the positive or negative root (closest to the origin) of the secular equation using alternative indexing semantics.
	*
	* @param kniter - `kniter`
	* @param orgati - `orgati`
	* @param rho - `rho`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param z - `z`
	* @param strideZ - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param finit - `finit`
	* @param tau - `tau`
	* @returns result
	*/
	ndarray( kniter: number, orgati: number, rho: number, d: Float64Array, strideD: number, offsetD: number, z: Float64Array, strideZ: number, offsetZ: number, finit: number, tau: number ): Float64Array;
}

/**
* Computes the positive or negative root (closest to the origin) of the secular equation.
*/
declare var dlaed6: Routine;


// EXPORTS //

export = dlaed6;
