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
* Interface describing `dlaqr5`.
*/
interface Routine {
	/**
	* Accesses a 2D array element (1-based row i, column j).
	*
	* @param A - `A`
	* @param sA1 - `sA1`
	* @param sA2 - `sA2`
	* @param oA - `oA`
	* @param i - `i`
	* @param j - `j`
	* @returns result
	*/
	( A: number, sA1: number, sA2: number, oA: number, i: number, j: number ): Float64Array;

	/**
	* Accesses a 2D array element (1-based row i, column j) using alternative indexing semantics.
	*
	* @param wantt - `wantt`
	* @param wantz - `wantz`
	* @param kacc22 - `kacc22`
	* @param N - number of columns
	* @param ktop - `ktop`
	* @param kbot - `kbot`
	* @param nshfts - `nshfts`
	* @param SR - `SR`
	* @param strideSR - stride of `SR`
	* @param offsetSR - starting index for `SR`
	* @param SI - `SI`
	* @param strideSI - stride of `SI`
	* @param offsetSI - starting index for `SI`
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
	* @param V - `V`
	* @param strideV1 - stride of `V`
	* @param strideV2 - stride of `V`
	* @param offsetV - starting index for `V`
	* @param U - `U`
	* @param strideU1 - stride of `U`
	* @param strideU2 - stride of `U`
	* @param offsetU - starting index for `U`
	* @param nv - `nv`
	* @param WV - `WV`
	* @param strideWV1 - stride of `WV`
	* @param strideWV2 - stride of `WV`
	* @param offsetWV - starting index for `WV`
	* @param nh - `nh`
	* @param WH - `WH`
	* @param strideWH1 - stride of `WH`
	* @param strideWH2 - stride of `WH`
	* @param offsetWH - starting index for `WH`
	* @returns result
	*/
	ndarray( wantt: boolean, wantz: boolean, kacc22: number, N: number, ktop: number, kbot: number, nshfts: number, SR: Float64Array, strideSR: number, offsetSR: number, SI: Float64Array, strideSI: number, offsetSI: number, H: Float64Array, strideH1: number, strideH2: number, offsetH: number, iloz: number, ihiz: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, V: Float64Array, strideV1: number, strideV2: number, offsetV: number, U: Float64Array, strideU1: number, strideU2: number, offsetU: number, nv: number, WV: Float64Array, strideWV1: number, strideWV2: number, offsetWV: number, nh: number, WH: Float64Array, strideWH1: number, strideWH2: number, offsetWH: number ): Float64Array;
}

/**
* Accesses a 2D array element (1-based row i, column j).
*/
declare var dlaqr5: Routine;


// EXPORTS //

export = dlaqr5;
