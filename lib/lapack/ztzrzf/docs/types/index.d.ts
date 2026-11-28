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
import { Complex128Array } from '@stdlib/types/array';

/**
* Interface describing `ztzrzf`.
*/
interface Routine {
	/**
	* Reduces a complex M-by-N (M <= N) upper trapezoidal matrix to upper triangular form via the unitary RZ factorization (blocked driver).
	*
	* @param order - storage layout
	* @param M - number of rows of `A`
	* @param N - number of columns of `A` (must satisfy `N >= M`)
	* @param A - input/output matrix
	* @param LDA - leading dimension of `A`
	* @param TAU - output array of scalar factors of the elementary reflectors (length `M`)
	* @param strideTAU - stride length for `TAU`
	* @param WORK - workspace array
	* @param strideWORK - stride length for `WORK`
	* @returns status code (`0` = success)
	*/
	( order: Layout, M: number, N: number, A: Complex128Array, LDA: number, TAU: Complex128Array, strideTAU: number, WORK: Complex128Array, strideWORK: number ): number;

	/**
	* Reduces a complex M-by-N (M <= N) upper trapezoidal matrix to upper triangular form via the unitary RZ factorization (blocked driver), using alternative indexing semantics.
	*
	* @param M - number of rows of `A`
	* @param N - number of columns of `A`
	* @param A - input/output matrix
	* @param strideA1 - stride of the first dimension of `A` (in complex elements)
	* @param strideA2 - stride of the second dimension of `A` (in complex elements)
	* @param offsetA - starting index for `A` (in complex elements)
	* @param TAU - output array of scalar factors of the elementary reflectors
	* @param strideTAU - stride length for `TAU` (in complex elements)
	* @param offsetTAU - starting index for `TAU` (in complex elements)
	* @param WORK - workspace array
	* @param strideWORK - stride length for `WORK` (in complex elements)
	* @param offsetWORK - starting index for `WORK` (in complex elements)
	* @returns status code (`0` = success)
	*/
	ndarray( M: number, N: number, A: Complex128Array, strideA1: number, strideA2: number, offsetA: number, TAU: Complex128Array, strideTAU: number, offsetTAU: number, WORK: Complex128Array, strideWORK: number, offsetWORK: number ): number;
}

/**
* Reduces a complex M-by-N (M <= N) upper trapezoidal matrix to upper triangular form via the unitary RZ factorization (blocked driver).
*/
declare var ztzrzf: Routine;


// EXPORTS //

export = ztzrzf;
