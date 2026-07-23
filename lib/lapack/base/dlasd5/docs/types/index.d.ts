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
* Interface describing `dlasd5`.
*/
interface Routine {
	/**
	* Compute the square root of the i-th eigenvalue of a positive symmetric rank-one modification of a 2-by-2 diagonal matrix.
	*
	* @param i - `i`
	* @param D - `D`
	* @param strideD - stride of `D`
	* @param Z - `Z`
	* @param strideZ - stride of `Z`
	* @param DELTA - `DELTA`
	* @param strideDELTA - stride of `DELTA`
	* @param rho - `rho`
	* @param dsigma - `dsigma`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @returns result
	*/
	( i: number, D: Float64Array, strideD: number, Z: Float64Array, strideZ: number, DELTA: Float64Array, strideDELTA: number, rho: number, dsigma: number, WORK: Float64Array, strideWork: number ): void;

	/**
	* Compute the square root of the i-th eigenvalue of a positive symmetric rank-one modification of a 2-by-2 diagonal matrix using alternative indexing semantics.
	*
	* @param i - `i`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param z - `z`
	* @param strideZ - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param DELTA - `DELTA`
	* @param strideDELTA - stride of `DELTA`
	* @param offsetDELTA - starting index for `DELTA`
	* @param rho - `rho`
	* @param dsigma - `dsigma`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @returns result
	*/
	ndarray( i: number, d: Float64Array, strideD: number, offsetD: number, z: Float64Array, strideZ: number, offsetZ: number, DELTA: Float64Array, strideDELTA: number, offsetDELTA: number, rho: number, dsigma: number, WORK: Float64Array, strideWork: number, offsetWork: number ): void;
}

/**
* Compute the square root of the i-th eigenvalue of a positive symmetric rank-one modification of a 2-by-2 diagonal matrix.
*/
declare var dlasd5: Routine;


// EXPORTS //

export = dlasd5;
