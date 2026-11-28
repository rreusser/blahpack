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
* Interface describing `zlaqr0`.
*/
interface Routine {
	/**
	* Complex multishift QR top-level driver.
	*
	* @param v - `v`
	* @param idx - `idx`
	* @returns result
	*/
	( v: number, idx: number ): Float64Array;

	/**
	* Complex multishift QR top-level driver using alternative indexing semantics.
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
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param offsetW - starting index for `W`
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
	ndarray( wantt: boolean, wantz: boolean, N: number, ilo: number, ihi: number, H: Float64Array, strideH1: number, strideH2: number, offsetH: number, w: Float64Array, strideW: number, offsetW: number, iloz: number, ihiz: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Complex multishift QR top-level driver.
*/
declare var zlaqr0: Routine;


// EXPORTS //

export = zlaqr0;
