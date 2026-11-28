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
* Interface describing `dlaed2`.
*/
interface Routine {
	/**
	* Merges the two sets of eigenvalues together into a single sorted set, then tries to deflate the size of the problem.
	*
	* @param N - number of columns
	* @param n1 - `n1`
	* @param d - `d`
	* @param Q - `Q`
	* @param LDQ - leading dimension of `Q`
	* @param INDXQ - `INDXQ`
	* @param rho - `rho`
	* @param z - `z`
	* @param DLAMBDA - `DLAMBDA`
	* @param w - `w`
	* @param Q2 - `Q2`
	* @param INDX - `INDX`
	* @param INDXC - `INDXC`
	* @param INDXP - `INDXP`
	* @param COLTYP - `COLTYP`
	* @returns result
	*/
	( N: number, n1: number, d: Float64Array, Q: Float64Array, LDQ: number, INDXQ: Float64Array, rho: number, z: Float64Array, DLAMBDA: Float64Array, w: Float64Array, Q2: Float64Array, INDX: Float64Array, INDXC: Float64Array, INDXP: Float64Array, COLTYP: Float64Array ): Float64Array;

	/**
	* Merges the two sets of eigenvalues together into a single sorted set, then tries to deflate the size of the problem using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param n1 - `n1`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param Q - `Q`
	* @param strideQ1 - stride of `Q`
	* @param strideQ2 - stride of `Q`
	* @param offsetQ - starting index for `Q`
	* @param INDXQ - `INDXQ`
	* @param strideINDXQ - stride of `INDXQ`
	* @param offsetINDXQ - starting index for `INDXQ`
	* @param rho - `rho`
	* @param z - `z`
	* @param strideZ - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param DLAMBDA - `DLAMBDA`
	* @param strideDLAMBDA - stride of `DLAMBDA`
	* @param offsetDLAMBDA - starting index for `DLAMBDA`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param offsetW - starting index for `W`
	* @param Q2 - `Q2`
	* @param strideQ21 - stride of `Q2`
	* @param offsetQ2 - starting index for `Q2`
	* @param INDX - `INDX`
	* @param strideINDX - stride of `INDX`
	* @param offsetINDX - starting index for `INDX`
	* @param INDXC - `INDXC`
	* @param strideINDXC - stride of `INDXC`
	* @param offsetINDXC - starting index for `INDXC`
	* @param INDXP - `INDXP`
	* @param strideINDXP - stride of `INDXP`
	* @param offsetINDXP - starting index for `INDXP`
	* @param COLTYP - `COLTYP`
	* @param strideCOLTYP - stride of `COLTYP`
	* @param offsetCOLTYP - starting index for `COLTYP`
	* @returns result
	*/
	ndarray( N: number, n1: number, d: Float64Array, strideD: number, offsetD: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, INDXQ: Float64Array, strideINDXQ: number, offsetINDXQ: number, rho: number, z: Float64Array, strideZ: number, offsetZ: number, DLAMBDA: Float64Array, strideDLAMBDA: number, offsetDLAMBDA: number, w: Float64Array, strideW: number, offsetW: number, Q2: Float64Array, strideQ21: number, offsetQ2: number, INDX: Float64Array, strideINDX: number, offsetINDX: number, INDXC: Float64Array, strideINDXC: number, offsetINDXC: number, INDXP: Float64Array, strideINDXP: number, offsetINDXP: number, COLTYP: Float64Array, strideCOLTYP: number, offsetCOLTYP: number ): Float64Array;
}

/**
* Merges the two sets of eigenvalues together into a single sorted set, then tries to deflate the size of the problem.
*/
declare var dlaed2: Routine;


// EXPORTS //

export = dlaed2;
