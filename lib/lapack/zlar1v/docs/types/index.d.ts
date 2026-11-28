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
* Interface describing `zlar1v`.
*/
interface Routine {
	/**
	* TODO: Add description for ZLAR1V.
	*
	* @param N - number of columns
	* @param b1 - b1
	* @param bn - bn
	* @param lambda - lambda
	* @param d - input array
	* @param strideD - stride length for `d`
	* @param l - input array
	* @param strideL - stride length for `l`
	* @param LD - leading dimension of ``
	* @param strideLD - stride length for `LD`
	* @param LLD - input array
	* @param strideLLD - stride length for `LLD`
	* @param pivmin - pivmin
	* @param gaptol - gaptol
	* @param z - input array
	* @param strideZ - stride length for `z`
	* @param wantnc - wantnc
	* @param negcnt - negcnt
	* @param ztz - ztz
	* @param mingma - mingma
	* @param r - r
	* @param ISUPPZ - input array
	* @param strideISUPPZ - stride length for `ISUPPZ`
	* @param offsetISUPPZ - starting index for `ISUPPZ`
	* @param nrminv - nrminv
	* @param resid - resid
	* @param rqcorr - rqcorr
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @returns result
	*/
	( N: number, b1: number, bn: number, lambda: number, d: Float64Array, strideD: number, l: Float64Array, strideL: number, LD: Float64Array, strideLD: number, LLD: Float64Array, strideLLD: number, pivmin: number, gaptol: number, z: Float64Array, strideZ: number, wantnc: boolean, negcnt: number, ztz: number, mingma: number, r: number, ISUPPZ: Int32Array, strideISUPPZ: number, offsetISUPPZ: number, nrminv: number, resid: number, rqcorr: number, WORK: Float64Array, strideWORK: number ): Float64Array;

	/**
	* TODO: Add description for ZLAR1V., using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param b1 - b1
	* @param bn - bn
	* @param lambda - lambda
	* @param d - input array
	* @param strideD - stride length for `d`
	* @param offsetD - starting index for `D`
	* @param l - input array
	* @param strideL - stride length for `l`
	* @param offsetL - starting index for `L`
	* @param LD - input array
	* @param strideLD - stride length for `LD`
	* @param offsetLD - starting index for `LD`
	* @param LLD - input array
	* @param strideLLD - stride length for `LLD`
	* @param offsetLLD - starting index for `LLD`
	* @param pivmin - pivmin
	* @param gaptol - gaptol
	* @param z - input array
	* @param strideZ - stride length for `z`
	* @param offsetZ - starting index for `Z`
	* @param wantnc - wantnc
	* @param negcnt - negcnt
	* @param ztz - ztz
	* @param mingma - mingma
	* @param r - r
	* @param ISUPPZ - input array
	* @param strideISUPPZ - stride length for `ISUPPZ`
	* @param offsetISUPPZ - starting index for `ISUPPZ`
	* @param nrminv - nrminv
	* @param resid - resid
	* @param rqcorr - rqcorr
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( N: number, b1: number, bn: number, lambda: number, d: Float64Array, strideD: number, offsetD: number, l: Float64Array, strideL: number, offsetL: number, LD: Float64Array, strideLD: number, offsetLD: number, LLD: Float64Array, strideLLD: number, offsetLLD: number, pivmin: number, gaptol: number, z: Float64Array, strideZ: number, offsetZ: number, wantnc: boolean, negcnt: number, ztz: number, mingma: number, r: number, ISUPPZ: Int32Array, strideISUPPZ: number, offsetISUPPZ: number, nrminv: number, resid: number, rqcorr: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* TODO: Add description for ZLAR1V.
*/
declare var zlar1v: Routine;


// EXPORTS //

export = zlar1v;
