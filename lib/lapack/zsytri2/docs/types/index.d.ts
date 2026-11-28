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

import { Layout, MatrixTriangle } from '@stdlib/types/blas';
import { Complex128Array } from '@stdlib/types/array';

/**
* Interface describing `zsytri2`.
*/
interface Routine {
	/**
	* Computes the inverse of a complex symmetric indefinite matrix using zsytrf factorization (dispatches between zsytri and zsytri2x)
	*
	* @param order - storage layout (`'row-major'` or `'column-major'`)
	* @param uplo - specifies whether the upper or lower triangle of `A` is stored (`'upper'` or `'lower'`)
	* @param N - order of the matrix `A`
	* @param A - input/output matrix `A`
	* @param LDA - leading dimension of `A`
	* @param IPIV - pivot indices from the factorization
	* @param strideIPIV - stride length for `IPIV`
	* @param WORK - workspace of length at least `max(1,N)` when `N <= NBMAX`, else `(N+NBMAX+1)*(NBMAX+3)`, where `NBMAX = ILAENV( 1, 'ZSYTRI2', ... ) = 1`; if `null`, a workspace is allocated internally
	* @returns status code
	*/
	( order: Layout, uplo: MatrixTriangle, N: number, A: Complex128Array, LDA: number, IPIV: Int32Array, strideIPIV: number, WORK: Complex128Array | null ): number;

	/**
	* Computes the inverse of a complex symmetric indefinite matrix using zsytrf factorization (dispatches between zsytri and zsytri2x), using alternative indexing semantics.
	*
	* @param uplo - specifies the operation type
	* @param N - number of columns
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param IPIV - input array
	* @param strideIPIV - stride length for `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	strided( uplo: string, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Computes the inverse of a complex symmetric indefinite matrix using zsytrf factorization (dispatches between zsytri and zsytri2x)
*/
declare var zsytri2: Routine;


// EXPORTS //

export = zsytri2;
