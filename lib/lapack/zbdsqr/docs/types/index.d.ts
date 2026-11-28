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

import { MatrixTriangle, Layout } from '@stdlib/types/blas';

/**
* Interface describing `zbdsqr`.
*/
interface Routine {
	/**
	* Returns |a| with the sign of b (Fortran SIGN intrinsic).
	*
	* @param order - storage layout
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param ncvt - `ncvt`
	* @param nru - `nru`
	* @param ncc - `ncc`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param VT - `VT`
	* @param LDVT - leading dimension of `VT`
	* @param U - `U`
	* @param LDU - leading dimension of `U`
	* @param C - `C`
	* @param LDC - leading dimension of `C`
	* @param RWORK - `RWORK`
	* @param strideRWORK - stride of `RWORK`
	* @returns result
	*/
	( order: Layout, uplo: MatrixTriangle, N: number, ncvt: number, nru: number, ncc: number, d: Float64Array, strideD: number, e: Float64Array, strideE: number, VT: Float64Array, LDVT: number, U: Float64Array, LDU: number, C: Float64Array, LDC: number, RWORK: Float64Array, strideRWORK: number ): Float64Array;

	/**
	* Returns |a| with the sign of b (Fortran SIGN intrinsic) using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param ncvt - `ncvt`
	* @param nru - `nru`
	* @param ncc - `ncc`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param offsetE - starting index for `E`
	* @param VT - `VT`
	* @param strideVT1 - stride of `VT`
	* @param strideVT2 - stride of `VT`
	* @param offsetVT - starting index for `VT`
	* @param U - `U`
	* @param strideU1 - stride of `U`
	* @param strideU2 - stride of `U`
	* @param offsetU - starting index for `U`
	* @param C - `C`
	* @param strideC1 - stride of `C`
	* @param strideC2 - stride of `C`
	* @param offsetC - starting index for `C`
	* @param RWORK - `RWORK`
	* @param strideRWORK - stride of `RWORK`
	* @param offsetRWORK - starting index for `RWORK`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, N: number, ncvt: number, nru: number, ncc: number, d: Float64Array, strideD: number, offsetD: number, e: Float64Array, strideE: number, offsetE: number, VT: Float64Array, strideVT1: number, strideVT2: number, offsetVT: number, U: Float64Array, strideU1: number, strideU2: number, offsetU: number, C: Float64Array, strideC1: number, strideC2: number, offsetC: number, RWORK: Float64Array, strideRWORK: number, offsetRWORK: number ): Float64Array;
}

/**
* Returns |a| with the sign of b (Fortran SIGN intrinsic).
*/
declare var zbdsqr: Routine;


// EXPORTS //

export = zbdsqr;
