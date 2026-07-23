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
* Interface describing `dlaqr3`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param wantt - `wantt`
	* @param wantz - `wantz`
	* @param N - number of columns
	* @param ktop - `ktop`
	* @param kbot - `kbot`
	* @param nw - `nw`
	* @param H - `H`
	* @param LDH - leading dimension of `H`
	* @param iloz - `iloz`
	* @param ihiz - `ihiz`
	* @param Z - `Z`
	* @param LDZ - leading dimension of `Z`
	* @param SR - `SR`
	* @param strideSR - stride of `SR`
	* @param SI - `SI`
	* @param strideSI - stride of `SI`
	* @param V - `V`
	* @param LDV - leading dimension of `V`
	* @param nh - `nh`
	* @param T - `T`
	* @param LDT - leading dimension of `T`
	* @param nv - `nv`
	* @param WV - `WV`
	* @param LDWV - leading dimension of `WV`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @returns result
	*/
	( wantt: boolean, wantz: boolean, N: number, ktop: number, kbot: number, nw: number, H: Float64Array, LDH: number, iloz: number, ihiz: number, Z: Float64Array, LDZ: number, SR: Float64Array, strideSR: number, SI: Float64Array, strideSI: number, V: Float64Array, LDV: number, nh: number, T: Float64Array, LDT: number, nv: number, WV: Float64Array, LDWV: number, WORK: Float64Array, strideWork: number ): Record<string, unknown>;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param wantt - `wantt`
	* @param wantz - `wantz`
	* @param N - number of columns
	* @param ktop - `ktop`
	* @param kbot - `kbot`
	* @param nw - `nw`
	* @param H - `H`
	* @param strideH1 - stride of `H`
	* @param strideH2 - stride of `H`
	* @param offsetH - starting index for `H`
	* @param iloz - `iloz`
	* @param ihiz - `ihiz`
	* @param Z - `Z`
	* @param strideZ1 - stride of `Z`
	* @param strideZ2 - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param SR - `SR`
	* @param strideSR - stride of `SR`
	* @param offsetSR - starting index for `SR`
	* @param SI - `SI`
	* @param strideSI - stride of `SI`
	* @param offsetSI - starting index for `SI`
	* @param V - `V`
	* @param strideV1 - stride of `V`
	* @param strideV2 - stride of `V`
	* @param offsetV - starting index for `V`
	* @param nh - `nh`
	* @param T - `T`
	* @param strideT1 - stride of `T`
	* @param strideT2 - stride of `T`
	* @param offsetT - starting index for `T`
	* @param nv - `nv`
	* @param WV - `WV`
	* @param strideWV1 - stride of `WV`
	* @param strideWV2 - stride of `WV`
	* @param offsetWV - starting index for `WV`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @returns result
	*/
	ndarray( wantt: boolean, wantz: boolean, N: number, ktop: number, kbot: number, nw: number, H: Float64Array, strideH1: number, strideH2: number, offsetH: number, iloz: number, ihiz: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, SR: Float64Array, strideSR: number, offsetSR: number, SI: Float64Array, strideSI: number, offsetSI: number, V: Float64Array, strideV1: number, strideV2: number, offsetV: number, nh: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number, nv: number, WV: Float64Array, strideWV1: number, strideWV2: number, offsetWV: number, WORK: Float64Array, strideWork: number, offsetWork: number ): Record<string, unknown>;
}

/**
* @license MIT.
*/
declare var dlaqr3: Routine;


// EXPORTS //

export = dlaqr3;
