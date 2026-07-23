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
* Interface describing `dlarrj`.
*/
interface Routine {
	/**
	* Refine eigenvalue approximations using bisection given initial intervals.
	*
	* @param N - number of columns
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param E2 - `E2`
	* @param strideE2 - stride of `E`
	* @param ifirst - `ifirst`
	* @param ilast - `ilast`
	* @param rtol - `rtol`
	* @param offset - starting index for ``
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param WERR - `WERR`
	* @param strideWERR - stride of `WERR`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param IWORK - `IWORK`
	* @param strideIWork - stride of `IWork`
	* @param pivmin - `pivmin`
	* @param spdiam - `spdiam`
	* @returns result
	*/
	( N: number, d: Float64Array, strideD: number, E2: number, strideE2: number, ifirst: number, ilast: number, rtol: number, offset: number, w: Float64Array, strideW: number, WERR: Float64Array, strideWERR: number, WORK: Float64Array, strideWork: number, IWORK: Int32Array, strideIWork: number, pivmin: number, spdiam: number ): number;

	/**
	* Refine eigenvalue approximations using bisection given initial intervals using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param E2 - `E2`
	* @param strideE2 - stride of `E`
	* @param offsetE2 - starting index for `E2`
	* @param ifirst - `ifirst`
	* @param ilast - `ilast`
	* @param rtol - `rtol`
	* @param offset - starting index for ``
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param offsetW - starting index for `W`
	* @param WERR - `WERR`
	* @param strideWERR - stride of `WERR`
	* @param offsetWERR - starting index for `WERR`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @param IWORK - `IWORK`
	* @param strideIWork - stride of `IWork`
	* @param offsetIWork - starting index for `IWork`
	* @param pivmin - `pivmin`
	* @param spdiam - `spdiam`
	* @returns result
	*/
	ndarray( N: number, d: Float64Array, strideD: number, offsetD: number, E2: number, strideE2: number, offsetE2: number, ifirst: number, ilast: number, rtol: number, offset: number, w: Float64Array, strideW: number, offsetW: number, WERR: Float64Array, strideWERR: number, offsetWERR: number, WORK: Float64Array, strideWork: number, offsetWork: number, IWORK: Int32Array, strideIWork: number, offsetIWork: number, pivmin: number, spdiam: number ): number;
}

/**
* Refine eigenvalue approximations using bisection given initial intervals.
*/
declare var dlarrj: Routine;


// EXPORTS //

export = dlarrj;
