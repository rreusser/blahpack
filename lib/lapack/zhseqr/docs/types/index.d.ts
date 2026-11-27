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
* Interface describing `zhseqr`.
*/
interface Routine {
	/**
	* Computes the eigenvalues of a complex upper Hessenberg matrix H, and.
	*
	* @param job - `job`
	* @param compz - `compz`
	* @param N - number of columns
	* @param ilo - lower index
	* @param ihi - upper index
	* @param H - `H`
	* @param LDH - leading dimension of `H`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param Z - `Z`
	* @param LDZ - leading dimension of `Z`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param lwork - workspace size
	* @returns result
	*/
	( job: string, compz: string, N: number, ilo: number, ihi: number, H: Float64Array, LDH: number, w: Float64Array, strideW: number, Z: Float64Array, LDZ: number, WORK: Float64Array, strideWORK: number, lwork: number ): Float64Array;

	/**
	* Computes the eigenvalues of a complex upper Hessenberg matrix H, and using alternative indexing semantics.
	*
	* @param job - `job`
	* @param compz - `compz`
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
	* @param Z - `Z`
	* @param strideZ1 - stride of `Z`
	* @param strideZ2 - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param lwork - workspace size
	* @returns result
	*/
	ndarray( job: string, compz: string, N: number, ilo: number, ihi: number, H: Float64Array, strideH1: number, strideH2: number, offsetH: number, w: Float64Array, strideW: number, offsetW: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, lwork: number ): Float64Array;
}

/**
* Computes the eigenvalues of a complex upper Hessenberg matrix H, and.
*/
declare var zhseqr: Routine;


// EXPORTS //

export = zhseqr;
