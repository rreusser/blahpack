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
* Interface describing `dtrttf`.
*/
interface Routine {
	/**
	* Copies a triangular matrix from standard full format (TR) to Rectangular Full Packed format (RFP).
	*
	* @param order - storage layout
	* @param transr - `transr`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param ARF - `ARF`
	* @returns result
	*/
	( order: Layout, transr: string, uplo: MatrixTriangle, N: number, A: Float64Array, LDA: number, ARF: Float64Array ): Float64Array;

	/**
	* Copies a triangular matrix from standard full format (TR) to Rectangular Full Packed format (RFP) using alternative indexing semantics.
	*
	* @param transr - `transr`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param ARF - `ARF`
	* @param strideARF - stride of `ARF`
	* @param offsetARF - starting index for `ARF`
	* @returns result
	*/
	ndarray( transr: string, uplo: MatrixTriangle, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, ARF: Float64Array, strideARF: number, offsetARF: number ): Float64Array;
}

/**
* Copies a triangular matrix from standard full format (TR) to Rectangular Full Packed format (RFP).
*/
declare var dtrttf: Routine;


// EXPORTS //

export = dtrttf;
