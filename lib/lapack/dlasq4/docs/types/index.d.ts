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
* Interface describing `dlasq4`.
*/
interface Routine {
	/**
	* Computes an approximation TAU to the smallest eigenvalue using values of d.
	*
	* @param i0 - `i0`
	* @param n0 - `n0`
	* @param z - `z`
	* @param stride - stride of ``
	* @param pp - `pp`
	* @param n0in - `n0in`
	* @param dmin - `dmin`
	* @param dmin1 - `dmin1`
	* @param dmin2 - `dmin2`
	* @param dn - `dn`
	* @param dn1 - `dn1`
	* @param dn2 - `dn2`
	* @param tau - `tau`
	* @param ttype - `ttype`
	* @param g - `g`
	* @returns result
	*/
	( i0: number, n0: number, z: number, stride: number, pp: number, n0in: number, dmin: number, dmin1: number, dmin2: number, dn: number, dn1: number, dn2: number, tau: number, ttype: number, g: number ): Float64Array;

	/**
	* Computes an approximation TAU to the smallest eigenvalue using values of d using alternative indexing semantics.
	*
	* @param i0 - `i0`
	* @param n0 - `n0`
	* @param z - `z`
	* @param stride - stride of ``
	* @param offset - starting index for ``
	* @param pp - `pp`
	* @param n0in - `n0in`
	* @param dmin - `dmin`
	* @param dmin1 - `dmin1`
	* @param dmin2 - `dmin2`
	* @param dn - `dn`
	* @param dn1 - `dn1`
	* @param dn2 - `dn2`
	* @param tau - `tau`
	* @param ttype - `ttype`
	* @param g - `g`
	* @returns result
	*/
	ndarray( i0: number, n0: number, z: number, stride: number, offset: number, pp: number, n0in: number, dmin: number, dmin1: number, dmin2: number, dn: number, dn1: number, dn2: number, tau: number, ttype: number, g: number ): Float64Array;
}

/**
* Computes an approximation TAU to the smallest eigenvalue using values of d.
*/
declare var dlasq4: Routine;


// EXPORTS //

export = dlasq4;
