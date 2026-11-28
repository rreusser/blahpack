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
	* Computes eigenvalues of a symmetric tridiagonal matrix to suitable accuracy
	*
	* @param range - specifies the operation type
	* @param order - storage layout
	* @param N - number of columns
	* @param vl - vl
	* @param vu - vu
	* @param il - il
	* @param iu - iu
	* @param GERS - input array
	* @param strideGERS - stride length for `GERS`
	* @param reltol - reltol
	* @param d - input array
	* @param strideD - stride length for `d`
	* @param e - input array
	* @param strideE - stride length for `e`
	* @param E2 - input array
	* @param strideE2 - stride length for `E2`
	* @param pivmin - pivmin
	* @param nsplit - nsplit
	* @param ISPLIT - input array
	* @param strideISPLIT - stride length for `ISPLIT`
	* @param offsetISPLIT - starting index for `ISPLIT`
	* @param M - number of rows
	* @param w - input array
	* @param strideW - stride length for `w`
	* @param WERR - input array
	* @param strideWERR - stride length for `WERR`
	* @param wl - wl
	* @param wu - wu
	* @param IBLOCK - input array
	* @param strideIBLOCK - stride length for `IBLOCK`
	* @param offsetIBLOCK - starting index for `IBLOCK`
	* @param INDEXW - input array
	* @param strideINDEXW - stride length for `INDEXW`
	* @param offsetINDEXW - starting index for `INDEXW`
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param IWORK - output array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	( range: string, order: Layout, N: number, vl: number, vu: number, il: number, iu: number, GERS: Float64Array, strideGERS: number, reltol: number, d: Float64Array, strideD: number, e: Float64Array, strideE: number, E2: Float64Array, strideE2: number, pivmin: number, nsplit: number, ISPLIT: Int32Array, strideISPLIT: number, offsetISPLIT: number, M: number, w: Float64Array, strideW: number, WERR: Float64Array, strideWERR: number, wl: number, wu: number, IBLOCK: Int32Array, strideIBLOCK: number, offsetIBLOCK: number, INDEXW: Int32Array, strideINDEXW: number, offsetINDEXW: number, WORK: Float64Array, strideWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;

	/**
	* Computes eigenvalues of a symmetric tridiagonal matrix to suitable accuracy, using alternative indexing semantics.
	*
	* @param range - specifies the operation type
	* @param order - specifies the operation type
	* @param N - number of columns
	* @param vl - vl
	* @param vu - vu
	* @param il - il
	* @param iu - iu
	* @param GERS - input array
	* @param strideGERS - stride length for `GERS`
	* @param offsetGERS - starting index for `GERS`
	* @param reltol - reltol
	* @param d - input array
	* @param strideD - stride length for `d`
	* @param offsetD - starting index for `D`
	* @param e - input array
	* @param strideE - stride length for `e`
	* @param offsetE - starting index for `E`
	* @param E2 - input array
	* @param strideE2 - stride of `E`
	* @param offsetE2 - starting index for `E2`
	* @param pivmin - pivmin
	* @param nsplit - nsplit
	* @param ISPLIT - input array
	* @param strideISPLIT - stride length for `ISPLIT`
	* @param offsetISPLIT - starting index for `ISPLIT`
	* @param M - number of rows
	* @param w - input array
	* @param strideW - stride length for `w`
	* @param offsetW - starting index for `W`
	* @param WERR - input array
	* @param strideWERR - stride length for `WERR`
	* @param offsetWERR - starting index for `WERR`
	* @param wl - wl
	* @param wu - wu
	* @param IBLOCK - input array
	* @param strideIBLOCK - stride length for `IBLOCK`
	* @param offsetIBLOCK - starting index for `IBLOCK`
	* @param INDEXW - input array
	* @param strideINDEXW - stride length for `INDEXW`
	* @param offsetINDEXW - starting index for `INDEXW`
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param IWORK - output array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	ndarray( range: string, order: Layout, N: number, vl: number, vu: number, il: number, iu: number, GERS: Float64Array, strideGERS: number, offsetGERS: number, reltol: number, d: Float64Array, strideD: number, offsetD: number, e: Float64Array, strideE: number, offsetE: number, E2: Float64Array, strideE2: number, offsetE2: number, pivmin: number, nsplit: number, ISPLIT: Int32Array, strideISPLIT: number, offsetISPLIT: number, M: number, w: Float64Array, strideW: number, offsetW: number, WERR: Float64Array, strideWERR: number, offsetWERR: number, wl: number, wu: number, IBLOCK: Int32Array, strideIBLOCK: number, offsetIBLOCK: number, INDEXW: Int32Array, strideINDEXW: number, offsetINDEXW: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;
}

/**
* Computes eigenvalues of a symmetric tridiagonal matrix to suitable accuracy
*/
declare var dlarrd: Routine;


// EXPORTS //

export = dlarrd;
