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

import { Layout } from '@stdlib/types/blas';

/**
* Interface describing `dstebz`.
*/
interface Routine {
	/**
	* Computes selected eigenvalues of a real symmetric tridiagonal matrix T.
	*
	* @param range - `range`
	* @param order - storage layout
	* @param N - number of columns
	* @param vl - `vl`
	* @param vu - `vu`
	* @param il - `il`
	* @param iu - `iu`
	* @param abstol - `abstol`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param M - number of rows
	* @param nsplit - `nsplit`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param IBLOCK - `IBLOCK`
	* @param strideIBLOCK - stride of `IBLOCK`
	* @param ISPLIT - `ISPLIT`
	* @param strideISPLIT - stride of `ISPLIT`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @returns result
	*/
	( range: string, order: Layout, N: number, vl: number, vu: number, il: number, iu: number, abstol: number, d: Float64Array, strideD: number, e: Float64Array, strideE: number, M: number, nsplit: number, w: Float64Array, strideW: number, IBLOCK: Int32Array, strideIBLOCK: number, ISPLIT: Int32Array, strideISPLIT: number, WORK: Float64Array, strideWORK: number, IWORK: Int32Array, strideIWORK: number ): Float64Array;

	/**
	* Computes selected eigenvalues of a real symmetric tridiagonal matrix T using alternative indexing semantics.
	*
	* @param range - `range`
	* @param order - storage layout
	* @param N - number of columns
	* @param vl - `vl`
	* @param vu - `vu`
	* @param il - `il`
	* @param iu - `iu`
	* @param abstol - `abstol`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param offsetE - starting index for `E`
	* @param M - number of rows
	* @param nsplit - `nsplit`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param offsetW - starting index for `W`
	* @param IBLOCK - `IBLOCK`
	* @param strideIBLOCK - stride of `IBLOCK`
	* @param offsetIBLOCK - starting index for `IBLOCK`
	* @param ISPLIT - `ISPLIT`
	* @param strideISPLIT - stride of `ISPLIT`
	* @param offsetISPLIT - starting index for `ISPLIT`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	ndarray( range: string, order: Layout, N: number, vl: number, vu: number, il: number, iu: number, abstol: number, d: Float64Array, strideD: number, offsetD: number, e: Float64Array, strideE: number, offsetE: number, M: number, nsplit: number, w: Float64Array, strideW: number, offsetW: number, IBLOCK: Int32Array, strideIBLOCK: number, offsetIBLOCK: number, ISPLIT: Int32Array, strideISPLIT: number, offsetISPLIT: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;
}

/**
* Computes selected eigenvalues of a real symmetric tridiagonal matrix T.
*/
declare var dstebz: Routine;


// EXPORTS //

export = dstebz;
