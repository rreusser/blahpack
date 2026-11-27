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
* Interface describing `dlaqr0`.
*/
interface Routine {
	/**
	* Compute the number of simultaneous shifts (ISPEC=15) per iparmq.
	*
	* @param nh - `nh`
	* @returns result
	*/
	( nh: number ): Float64Array;

	/**
	* Compute the number of simultaneous shifts (ISPEC=15) per iparmq using alternative indexing semantics.
	*
	* @param wantt - `wantt`
	* @param wantz - `wantz`
	* @param N - number of columns
	* @param ilo - lower index
	* @param ihi - upper index
	* @param H - `H`
	* @param strideH1 - stride of `H`
	* @param strideH2 - stride of `H`
	* @param offsetH - starting index for `H`
	* @param WR - `WR`
	* @param strideWR - stride of `WR`
	* @param offsetWR - starting index for `WR`
	* @param WI - `WI`
	* @param strideWI - stride of `WI`
	* @param offsetWI - starting index for `WI`
	* @param iloz - `iloz`
	* @param ihiz - `ihiz`
	* @param Z - `Z`
	* @param strideZ1 - stride of `Z`
	* @param strideZ2 - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( wantt: boolean, wantz: boolean, N: number, ilo: number, ihi: number, H: Float64Array, strideH1: number, strideH2: number, offsetH: number, WR: Float64Array, strideWR: number, offsetWR: number, WI: Float64Array, strideWI: number, offsetWI: number, iloz: number, ihiz: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Compute the number of simultaneous shifts (ISPEC=15) per iparmq.
*/
declare var dlaqr0: Routine;


// EXPORTS //

export = dlaqr0;
