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
* Interface describing `dlarrb`.
*/
interface Routine {
	/**
	* Provides limited bisection to locate eigenvalues for more accuracy
	*
	* @param N - number of columns
	* @param d - input array
	* @param strideD - stride length for `d`
	* @param LLD - input array
	* @param strideLLD - stride length for `LLD`
	* @param ifirst - ifirst
	* @param ilast - ilast
	* @param rtol1 - rtol1
	* @param rtol2 - rtol2
	* @param offset - offset
	* @param w - input array
	* @param strideW - stride length for `w`
	* @param WGAP - input array
	* @param strideWGAP - stride length for `WGAP`
	* @param WERR - input array
	* @param strideWERR - stride length for `WERR`
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param IWORK - output array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @param pivmin - pivmin
	* @param spdiam - spdiam
	* @param twist - twist
	* @returns result
	*/
	( N: number, d: Float64Array, strideD: number, LLD: Float64Array, strideLLD: number, ifirst: number, ilast: number, rtol1: number, rtol2: number, offset: number, w: Float64Array, strideW: number, WGAP: Float64Array, strideWGAP: number, WERR: Float64Array, strideWERR: number, WORK: Float64Array, strideWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number, pivmin: number, spdiam: number, twist: number ): Float64Array;

	/**
	* Provides limited bisection to locate eigenvalues for more accuracy, using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param d - input array
	* @param strideD - stride length for `d`
	* @param offsetD - starting index for `D`
	* @param LLD - input array
	* @param strideLLD - stride length for `LLD`
	* @param offsetLLD - starting index for `LLD`
	* @param ifirst - ifirst
	* @param ilast - ilast
	* @param rtol1 - rtol1
	* @param rtol2 - rtol2
	* @param offset - starting index for ``
	* @param w - input array
	* @param strideW - stride length for `w`
	* @param offsetW - starting index for `W`
	* @param WGAP - input array
	* @param strideWGAP - stride length for `WGAP`
	* @param offsetWGAP - starting index for `WGAP`
	* @param WERR - input array
	* @param strideWERR - stride length for `WERR`
	* @param offsetWERR - starting index for `WERR`
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param IWORK - output array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @param pivmin - pivmin
	* @param spdiam - spdiam
	* @param twist - twist
	* @returns result
	*/
	ndarray( N: number, d: Float64Array, strideD: number, offsetD: number, LLD: Float64Array, strideLLD: number, offsetLLD: number, ifirst: number, ilast: number, rtol1: number, rtol2: number, offset: number, w: Float64Array, strideW: number, offsetW: number, WGAP: Float64Array, strideWGAP: number, offsetWGAP: number, WERR: Float64Array, strideWERR: number, offsetWERR: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number, pivmin: number, spdiam: number, twist: number ): Float64Array;
}

/**
* Provides limited bisection to locate eigenvalues for more accuracy
*/
declare var dlarrb: Routine;


// EXPORTS //

export = dlarrb;
