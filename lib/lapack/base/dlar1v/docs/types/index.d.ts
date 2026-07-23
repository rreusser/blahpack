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
* Interface describing `dlar1v`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param N - number of columns
	* @param b1 - `b1`
	* @param bn - `bn`
	* @param lambda - `lambda`
	* @param D - `D`
	* @param strideD - stride of `D`
	* @param L - `L`
	* @param strideL - stride of `L`
	* @param LD - `LD`
	* @param strideLD - stride of `LD`
	* @param LLD - `LLD`
	* @param strideLLD - stride of `LLD`
	* @param pivmin - `pivmin`
	* @param gaptol - `gaptol`
	* @param Z - `Z`
	* @param strideZ - stride of `Z`
	* @param wantnc - `wantnc`
	* @param negcnt - `negcnt`
	* @param ztz - `ztz`
	* @param mingma - `mingma`
	* @param r - `r`
	* @param ISUPPZ - `ISUPPZ`
	* @param strideISUPPZ - stride of `ISUPPZ`
	* @param nrminv - `nrminv`
	* @param resid - `resid`
	* @param rqcorr - `rqcorr`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @returns result
	*/
	( N: number, b1: number, bn: number, lambda: number, D: Float64Array, strideD: number, L: Float64Array, strideL: number, LD: Float64Array, strideLD: number, LLD: Float64Array, strideLLD: number, pivmin: number, gaptol: number, Z: Float64Array, strideZ: number, wantnc: number, negcnt: number, ztz: number, mingma: number, r: number, ISUPPZ: Int32Array, strideISUPPZ: number, nrminv: number, resid: number, rqcorr: number, WORK: Float64Array, strideWork: number ): void;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param b1 - `b1`
	* @param bn - `bn`
	* @param lambda - `lambda`
	* @param D - `D`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param L - `L`
	* @param strideL - stride of `L`
	* @param offsetL - starting index for `L`
	* @param LD - `LD`
	* @param strideLD - stride of `LD`
	* @param offsetLD - starting index for `LD`
	* @param LLD - `LLD`
	* @param strideLLD - stride of `LLD`
	* @param offsetLLD - starting index for `LLD`
	* @param pivmin - `pivmin`
	* @param gaptol - `gaptol`
	* @param Z - `Z`
	* @param strideZ - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param wantnc - `wantnc`
	* @param negcnt - `negcnt`
	* @param ztz - `ztz`
	* @param mingma - `mingma`
	* @param r - `r`
	* @param ISUPPZ - `ISUPPZ`
	* @param strideISUPPZ - stride of `ISUPPZ`
	* @param offsetISUPPZ - starting index for `ISUPPZ`
	* @param nrminv - `nrminv`
	* @param resid - `resid`
	* @param rqcorr - `rqcorr`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @returns result
	*/
	ndarray( N: number, b1: number, bn: number, lambda: number, D: Float64Array, strideD: number, offsetD: number, L: Float64Array, strideL: number, offsetL: number, LD: Float64Array, strideLD: number, offsetLD: number, LLD: Float64Array, strideLLD: number, offsetLLD: number, pivmin: number, gaptol: number, Z: Float64Array, strideZ: number, offsetZ: number, wantnc: number, negcnt: number, ztz: number, mingma: number, r: number, ISUPPZ: Int32Array, strideISUPPZ: number, offsetISUPPZ: number, nrminv: number, resid: number, rqcorr: number, WORK: Float64Array, strideWork: number, offsetWork: number ): void;
}

/**
* @license MIT.
*/
declare var dlar1v: Routine;


// EXPORTS //

export = dlar1v;
