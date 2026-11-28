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
* Interface describing `zgesvd`.
*/
interface Routine {
	/**
	* Computes the singular value decomposition (SVD) of a complex M-by-N matrix A.
	*
	* @param order - storage layout
	* @param jobu - `jobu`
	* @param jobvt - `jobvt`
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param s - `s`
	* @param strideS - stride of `S`
	* @param U - `U`
	* @param LDU - leading dimension of `U`
	* @param VT - `VT`
	* @param LDVT - leading dimension of `VT`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param lwork - workspace size
	* @param RWORK - `RWORK`
	* @param strideRWORK - stride of `RWORK`
	* @returns result
	*/
	( order: Layout, jobu: string, jobvt: string, M: number, N: number, A: Float64Array, LDA: number, s: Float64Array, strideS: number, U: Float64Array, LDU: number, VT: Float64Array, LDVT: number, WORK: Float64Array, strideWORK: number, lwork: number, RWORK: Float64Array, strideRWORK: number ): Float64Array;

	/**
	* Computes the singular value decomposition (SVD) of a complex M-by-N matrix A, using alternative indexing semantics.
	*
	* @param jobu - `jobu`
	* @param jobvt - `jobvt`
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param s - `s`
	* @param strideS - stride of `S`
	* @param offsetS - starting index for `S`
	* @param U - `U`
	* @param strideU1 - stride of `U`
	* @param strideU2 - stride of `U`
	* @param offsetU - starting index for `U`
	* @param VT - `VT`
	* @param strideVT1 - stride of `VT`
	* @param strideVT2 - stride of `VT`
	* @param offsetVT - starting index for `VT`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param lwork - workspace size
	* @param RWORK - `RWORK`
	* @param strideRWORK - stride of `RWORK`
	* @param offsetRWORK - starting index for `RWORK`
	* @returns result
	*/
	ndarray( jobu: string, jobvt: string, M: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, s: Float64Array, strideS: number, offsetS: number, U: Float64Array, strideU1: number, strideU2: number, offsetU: number, VT: Float64Array, strideVT1: number, strideVT2: number, offsetVT: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, lwork: number, RWORK: Float64Array, strideRWORK: number, offsetRWORK: number ): Float64Array;
}

/**
* Computes the singular value decomposition (SVD) of a complex M-by-N matrix A.
*/
declare var zgesvd: Routine;


// EXPORTS //

export = zgesvd;
