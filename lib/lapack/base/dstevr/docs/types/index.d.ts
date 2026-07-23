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
* Interface describing `dstevr`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param jobz - `jobz`
	* @param range - `range`
	* @param N - number of columns
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param vl - `vl`
	* @param vu - `vu`
	* @param il - `il`
	* @param iu - `iu`
	* @param abstol - `abstol`
	* @param out - `out`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param Z - `Z`
	* @param LDZ - leading dimension of `Z`
	* @param ISUPPZ - `ISUPPZ`
	* @param strideISUPPZ - stride of `ISUPPZ`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param IWORK - `IWORK`
	* @param strideIWork - stride of `IWork`
	* @returns result
	*/
	( jobz: string, range: string, N: number, d: Float64Array, strideD: number, e: Float64Array, strideE: number, vl: number, vu: number, il: number, iu: number, abstol: number, out: number, w: Float64Array, strideW: number, Z: Float64Array, LDZ: number, ISUPPZ: Int32Array, strideISUPPZ: number, WORK: Float64Array, strideWork: number, IWORK: Int32Array, strideIWork: number ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param jobz - `jobz`
	* @param range - `range`
	* @param N - number of columns
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param offsetE - starting index for `E`
	* @param vl - `vl`
	* @param vu - `vu`
	* @param il - `il`
	* @param iu - `iu`
	* @param abstol - `abstol`
	* @param out - `out`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param offsetW - starting index for `W`
	* @param Z - `Z`
	* @param strideZ1 - stride of `Z`
	* @param strideZ2 - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param ISUPPZ - `ISUPPZ`
	* @param strideISUPPZ - stride of `ISUPPZ`
	* @param offsetISUPPZ - starting index for `ISUPPZ`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @param IWORK - `IWORK`
	* @param strideIWork - stride of `IWork`
	* @param offsetIWork - starting index for `IWork`
	* @returns result
	*/
	ndarray( jobz: string, range: string, N: number, d: Float64Array, strideD: number, offsetD: number, e: Float64Array, strideE: number, offsetE: number, vl: number, vu: number, il: number, iu: number, abstol: number, out: number, w: Float64Array, strideW: number, offsetW: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, ISUPPZ: Int32Array, strideISUPPZ: number, offsetISUPPZ: number, WORK: Float64Array, strideWork: number, offsetWork: number, IWORK: Int32Array, strideIWork: number, offsetIWork: number ): number;
}

/**
* @license MIT.
*/
declare var dstevr: Routine;


// EXPORTS //

export = dstevr;
