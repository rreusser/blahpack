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
* Interface describing `dlarrd`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param range - `range`
	* @param order - storage layout
	* @param N - number of columns
	* @param vl - `vl`
	* @param vu - `vu`
	* @param il - `il`
	* @param iu - `iu`
	* @param GERS - `GERS`
	* @param strideGERS - stride of `GERS`
	* @param reltol - `reltol`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param E2 - `E2`
	* @param strideE2 - stride of `E`
	* @param pivmin - `pivmin`
	* @param nsplit - `nsplit`
	* @param ISPLIT - `ISPLIT`
	* @param strideISPLIT - stride of `ISPLIT`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param WERR - `WERR`
	* @param strideWERR - stride of `WERR`
	* @param IBLOCK - `IBLOCK`
	* @param strideIBLOCK - stride of `IBLOCK`
	* @param INDEXW - `INDEXW`
	* @param strideINDEXW - stride of `INDEXW`
	* @returns result
	*/
	( range: string, order: Layout, N: number, vl: number, vu: number, il: number, iu: number, GERS: Float64Array, strideGERS: number, reltol: number, d: Float64Array, strideD: number, e: Float64Array, strideE: number, E2: number, strideE2: number, pivmin: number, nsplit: number, ISPLIT: Int32Array, strideISPLIT: number, w: Float64Array, strideW: number, WERR: Float64Array, strideWERR: number, IBLOCK: Int32Array, strideIBLOCK: number, INDEXW: Float64Array, strideINDEXW: number ): Record<string, unknown>;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param range - `range`
	* @param order - storage layout
	* @param N - number of columns
	* @param vl - `vl`
	* @param vu - `vu`
	* @param il - `il`
	* @param iu - `iu`
	* @param GERS - `GERS`
	* @param strideGERS - stride of `GERS`
	* @param offsetGERS - starting index for `GERS`
	* @param reltol - `reltol`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param offsetE - starting index for `E`
	* @param E2 - `E2`
	* @param strideE2 - stride of `E`
	* @param offsetE2 - starting index for `E2`
	* @param pivmin - `pivmin`
	* @param nsplit - `nsplit`
	* @param ISPLIT - `ISPLIT`
	* @param strideISPLIT - stride of `ISPLIT`
	* @param offsetISPLIT - starting index for `ISPLIT`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param offsetW - starting index for `W`
	* @param WERR - `WERR`
	* @param strideWERR - stride of `WERR`
	* @param offsetWERR - starting index for `WERR`
	* @param IBLOCK - `IBLOCK`
	* @param strideIBLOCK - stride of `IBLOCK`
	* @param offsetIBLOCK - starting index for `IBLOCK`
	* @param INDEXW - `INDEXW`
	* @param strideINDEXW - stride of `INDEXW`
	* @param offsetINDEXW - starting index for `INDEXW`
	* @returns result
	*/
	ndarray( range: string, order: Layout, N: number, vl: number, vu: number, il: number, iu: number, GERS: Float64Array, strideGERS: number, offsetGERS: number, reltol: number, d: Float64Array, strideD: number, offsetD: number, e: Float64Array, strideE: number, offsetE: number, E2: number, strideE2: number, offsetE2: number, pivmin: number, nsplit: number, ISPLIT: Int32Array, strideISPLIT: number, offsetISPLIT: number, w: Float64Array, strideW: number, offsetW: number, WERR: Float64Array, strideWERR: number, offsetWERR: number, IBLOCK: Int32Array, strideIBLOCK: number, offsetIBLOCK: number, INDEXW: Float64Array, strideINDEXW: number, offsetINDEXW: number ): Record<string, unknown>;
}

/**
* @license MIT.
*/
declare var dlarrd: Routine;


// EXPORTS //

export = dlarrd;
