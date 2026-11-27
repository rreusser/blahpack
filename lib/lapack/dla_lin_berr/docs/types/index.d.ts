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

/// <reference types="@stdlib/types"/>



/**
* Interface describing `dla_lin_berr`.
*/
interface Routine {
	/**
	* Computes a component-wise relative backward error
	*
	* @param N - number of columns
	* @param nz - nz
	* @param nrhs - nrhs
	* @param res - input array
	* @param strideRES - stride length for `res`
	* @param ayb - input array
	* @param strideAYB - stride length for `ayb`
	* @param berr - input array
	* @param strideBERR - stride length for `berr`
	* @returns result
	*/
	( N: number, nz: number, nrhs: number, res: Float64Array, strideRES: number, ayb: Float64Array, strideAYB: number, berr: Float64Array, strideBERR: number ): Float64Array;

	/**
	* Computes a component-wise relative backward error, using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param nz - nz
	* @param nrhs - nrhs
	* @param res - input array
	* @param strideRES - stride length for `res`
	* @param offsetRES - starting index for `RES`
	* @param ayb - input array
	* @param strideAYB - stride length for `ayb`
	* @param offsetAYB - starting index for `AYB`
	* @param berr - input array
	* @param strideBERR - stride length for `berr`
	* @param offsetBERR - starting index for `BERR`
	* @returns result
	*/
	ndarray( N: number, nz: number, nrhs: number, res: Float64Array, strideRES: number, offsetRES: number, ayb: Float64Array, strideAYB: number, offsetAYB: number, berr: Float64Array, strideBERR: number, offsetBERR: number ): Float64Array;
}

/**
* Computes a component-wise relative backward error
*/
declare var dla_lin_berr: Routine;


// EXPORTS //

export = dla_lin_berr;
