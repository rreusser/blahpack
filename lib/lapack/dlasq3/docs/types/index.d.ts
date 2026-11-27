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
* Interface describing `dlasq3`.
*/
interface Routine {
	/**
	* Checks for deflation, computes a shift (TAU) and calls dqds. In case of.
	*
	* @param i0 - `i0`
	* @param n0 - `n0`
	* @param z - `z`
	* @param stride - stride of ``
	* @param pp - `pp`
	* @param dmin - `dmin`
	* @param sigma - `sigma`
	* @param desig - `desig`
	* @param qmax - `qmax`
	* @param nfail - `nfail`
	* @param iter - `iter`
	* @param ndiv - `ndiv`
	* @param ieee - `ieee`
	* @param ttype - `ttype`
	* @param dmin1 - `dmin1`
	* @param dmin2 - `dmin2`
	* @param dn - `dn`
	* @param dn1 - `dn1`
	* @param dn2 - `dn2`
	* @param g - `g`
	* @param tau - `tau`
	* @returns result
	*/
	( i0: number, n0: number, z: number, stride: number, pp: number, dmin: number, sigma: number, desig: number, qmax: number, nfail: number, iter: number, ndiv: number, ieee: number, ttype: number, dmin1: number, dmin2: number, dn: number, dn1: number, dn2: number, g: number, tau: number ): Float64Array;

	/**
	* Checks for deflation, computes a shift (TAU) and calls dqds. In case of using alternative indexing semantics.
	*
	* @param i0 - `i0`
	* @param n0 - `n0`
	* @param z - `z`
	* @param stride - stride of ``
	* @param offset - starting index for ``
	* @param pp - `pp`
	* @param dmin - `dmin`
	* @param sigma - `sigma`
	* @param desig - `desig`
	* @param qmax - `qmax`
	* @param nfail - `nfail`
	* @param iter - `iter`
	* @param ndiv - `ndiv`
	* @param ieee - `ieee`
	* @param ttype - `ttype`
	* @param dmin1 - `dmin1`
	* @param dmin2 - `dmin2`
	* @param dn - `dn`
	* @param dn1 - `dn1`
	* @param dn2 - `dn2`
	* @param g - `g`
	* @param tau - `tau`
	* @returns result
	*/
	ndarray( i0: number, n0: number, z: number, stride: number, offset: number, pp: number, dmin: number, sigma: number, desig: number, qmax: number, nfail: number, iter: number, ndiv: number, ieee: number, ttype: number, dmin1: number, dmin2: number, dn: number, dn1: number, dn2: number, g: number, tau: number ): Float64Array;
}

/**
* Checks for deflation, computes a shift (TAU) and calls dqds. In case of.
*/
declare var dlasq3: Routine;


// EXPORTS //

export = dlasq3;
