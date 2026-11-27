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
* Interface describing `dlarrf`.
*/
interface Routine {
	/**
	* Finds a new relatively robust representation for eigenvalues
	*
	* @param N - number of columns
	* @param d - input array
	* @param strideD - stride length for `d`
	* @param l - input array
	* @param strideL - stride length for `l`
	* @param LD - leading dimension of ``
	* @param strideLD - stride length for `LD`
	* @param clstrt - clstrt
	* @param clend - clend
	* @param w - input array
	* @param strideW - stride length for `w`
	* @param WGAP - input array
	* @param strideWGAP - stride length for `WGAP`
	* @param WERR - input array
	* @param strideWERR - stride length for `WERR`
	* @param spdiam - spdiam
	* @param clgapl - clgapl
	* @param clgapr - clgapr
	* @param pivmin - pivmin
	* @param sigma - sigma
	* @param DPLUS - input array
	* @param strideDPLUS - stride length for `DPLUS`
	* @param LPLUS - input array
	* @param strideLPLUS - stride length for `LPLUS`
	* @param WORK - output array
	* @returns result
	*/
	( N: number, d: Float64Array, strideD: number, l: Float64Array, strideL: number, LD: Float64Array, strideLD: number, clstrt: number, clend: number, w: Float64Array, strideW: number, WGAP: Float64Array, strideWGAP: number, WERR: Float64Array, strideWERR: number, spdiam: number, clgapl: number, clgapr: number, pivmin: number, sigma: number, DPLUS: Float64Array, strideDPLUS: number, LPLUS: Float64Array, strideLPLUS: number, WORK: Float64Array ): Float64Array;

	/**
	* Finds a new relatively robust representation for eigenvalues, using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param d - input array
	* @param strideD - stride length for `d`
	* @param offsetD - starting index for `D`
	* @param l - input array
	* @param strideL - stride length for `l`
	* @param offsetL - starting index for `L`
	* @param LD - input array
	* @param strideLD - stride length for `LD`
	* @param offsetLD - starting index for `LD`
	* @param clstrt - clstrt
	* @param clend - clend
	* @param w - input array
	* @param strideW - stride length for `w`
	* @param offsetW - starting index for `W`
	* @param WGAP - input array
	* @param strideWGAP - stride length for `WGAP`
	* @param offsetWGAP - starting index for `WGAP`
	* @param WERR - input array
	* @param strideWERR - stride length for `WERR`
	* @param offsetWERR - starting index for `WERR`
	* @param spdiam - spdiam
	* @param clgapl - clgapl
	* @param clgapr - clgapr
	* @param pivmin - pivmin
	* @param sigma - sigma
	* @param DPLUS - input array
	* @param strideDPLUS - stride length for `DPLUS`
	* @param offsetDPLUS - starting index for `DPLUS`
	* @param LPLUS - input array
	* @param strideLPLUS - stride length for `LPLUS`
	* @param offsetLPLUS - starting index for `LPLUS`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( N: number, d: Float64Array, strideD: number, offsetD: number, l: Float64Array, strideL: number, offsetL: number, LD: Float64Array, strideLD: number, offsetLD: number, clstrt: number, clend: number, w: Float64Array, strideW: number, offsetW: number, WGAP: Float64Array, strideWGAP: number, offsetWGAP: number, WERR: Float64Array, strideWERR: number, offsetWERR: number, spdiam: number, clgapl: number, clgapr: number, pivmin: number, sigma: number, DPLUS: Float64Array, strideDPLUS: number, offsetDPLUS: number, LPLUS: Float64Array, strideLPLUS: number, offsetLPLUS: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Finds a new relatively robust representation for eigenvalues
*/
declare var dlarrf: Routine;


// EXPORTS //

export = dlarrf;
