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
* Interface describing `dlarrf`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param N - number of columns
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param l - `l`
	* @param strideL - stride of `L`
	* @param ld - `ld`
	* @param strideLD - stride of `LD`
	* @param clstrt - `clstrt`
	* @param clend - `clend`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param wgap - `wgap`
	* @param strideWGAP - stride of `WGAP`
	* @param werr - `werr`
	* @param strideWERR - stride of `WERR`
	* @param spdiam - `spdiam`
	* @param clgapl - `clgapl`
	* @param clgapr - `clgapr`
	* @param pivmin - `pivmin`
	* @param sigma - `sigma`
	* @param dplus - `dplus`
	* @param strideDPLUS - stride of `DPLUS`
	* @param lplus - `lplus`
	* @param strideLPLUS - stride of `LPLUS`
	* @param work - `work`
	* @param strideWork - stride of `Work`
	* @returns result
	*/
	( N: number, d: Float64Array, strideD: number, l: Float64Array, strideL: number, ld: Float64Array, strideLD: number, clstrt: number, clend: number, w: Float64Array, strideW: number, wgap: Float64Array, strideWGAP: number, werr: Float64Array, strideWERR: number, spdiam: number, clgapl: number, clgapr: number, pivmin: number, sigma: number, dplus: Float64Array, strideDPLUS: number, lplus: Float64Array, strideLPLUS: number, work: Float64Array, strideWork: number ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param l - `l`
	* @param strideL - stride of `L`
	* @param offsetL - starting index for `L`
	* @param ld - `ld`
	* @param strideLD - stride of `LD`
	* @param offsetLD - starting index for `LD`
	* @param clstrt - `clstrt`
	* @param clend - `clend`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param offsetW - starting index for `W`
	* @param wgap - `wgap`
	* @param strideWGAP - stride of `WGAP`
	* @param offsetWGAP - starting index for `WGAP`
	* @param werr - `werr`
	* @param strideWERR - stride of `WERR`
	* @param offsetWERR - starting index for `WERR`
	* @param spdiam - `spdiam`
	* @param clgapl - `clgapl`
	* @param clgapr - `clgapr`
	* @param pivmin - `pivmin`
	* @param sigma - `sigma`
	* @param dplus - `dplus`
	* @param strideDPLUS - stride of `DPLUS`
	* @param offsetDPLUS - starting index for `DPLUS`
	* @param lplus - `lplus`
	* @param strideLPLUS - stride of `LPLUS`
	* @param offsetLPLUS - starting index for `LPLUS`
	* @param work - `work`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @returns result
	*/
	ndarray( N: number, d: Float64Array, strideD: number, offsetD: number, l: Float64Array, strideL: number, offsetL: number, ld: Float64Array, strideLD: number, offsetLD: number, clstrt: number, clend: number, w: Float64Array, strideW: number, offsetW: number, wgap: Float64Array, strideWGAP: number, offsetWGAP: number, werr: Float64Array, strideWERR: number, offsetWERR: number, spdiam: number, clgapl: number, clgapr: number, pivmin: number, sigma: number, dplus: Float64Array, strideDPLUS: number, offsetDPLUS: number, lplus: Float64Array, strideLPLUS: number, offsetLPLUS: number, work: Float64Array, strideWork: number, offsetWork: number ): number;
}

/**
* @license MIT.
*/
declare var dlarrf: Routine;


// EXPORTS //

export = dlarrf;
