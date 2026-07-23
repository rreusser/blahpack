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
* Interface describing `zla_lin_berr`.
*/
interface Routine {
	/**
	* Computes a component-wise relative backward error.
	*
	* @param N - number of columns
	* @param nz - `nz`
	* @param nrhs - number of right-hand sides
	* @param res - `res`
	* @param LDRES - leading dimension of `RES`
	* @param ayb - `ayb`
	* @param LDAYB - leading dimension of `AYB`
	* @param berr - `berr`
	* @returns result
	*/
	( N: number, nz: number, nrhs: number, res: Float64Array, LDRES: number, ayb: Float64Array, LDAYB: number, berr: Float64Array ): Float64Array;

	/**
	* Computes a component-wise relative backward error using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param nz - `nz`
	* @param nrhs - number of right-hand sides
	* @param res - `res`
	* @param strideRES1 - stride of `RES`
	* @param strideRES2 - stride of `RES`
	* @param offsetRES - starting index for `RES`
	* @param ayb - `ayb`
	* @param strideAYB1 - stride of `AYB`
	* @param strideAYB2 - stride of `AYB`
	* @param offsetAYB - starting index for `AYB`
	* @param berr - `berr`
	* @param strideBERR - stride of `BERR`
	* @param offsetBERR - starting index for `BERR`
	* @returns result
	*/
	ndarray( N: number, nz: number, nrhs: number, res: Float64Array, strideRES1: number, strideRES2: number, offsetRES: number, ayb: Float64Array, strideAYB1: number, strideAYB2: number, offsetAYB: number, berr: Float64Array, strideBERR: number, offsetBERR: number ): Float64Array;
}

/**
* Computes a component-wise relative backward error.
*/
declare var zla_lin_berr: Routine;


// EXPORTS //

export = zla_lin_berr;
