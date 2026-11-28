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
* Interface describing `zgeqr2p`.
*/
interface Routine {
	/**
	* Computes a complex QR factorization with non-negative diagonal elements (unblocked algorithm)
	*
	* @param order - storage layout
	* @param M - number of rows
	* @param N - number of columns
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param TAU - input array
	* @param strideTAU - stride length for `TAU`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @returns result
	*/
	( order: Layout, M: number, N: number, A: Float64Array, LDA: number, TAU: Float64Array, strideTAU: number, WORK: Float64Array, strideWORK: number ): Float64Array;

	/**
	* Computes a complex QR factorization with non-negative diagonal elements (unblocked algorithm), using alternative indexing semantics.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param TAU - input array
	* @param strideTAU - stride length for `TAU`
	* @param offsetTAU - starting index for `TAU`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( M: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, TAU: Float64Array, strideTAU: number, offsetTAU: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Computes a complex QR factorization with non-negative diagonal elements (unblocked algorithm)
*/
declare var zgeqr2p: Routine;


// EXPORTS //

export = zgeqr2p;
