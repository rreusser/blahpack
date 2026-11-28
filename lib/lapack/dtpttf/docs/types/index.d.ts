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

import { MatrixTriangle } from '@stdlib/types/blas';

/**
* Interface describing `dtpttf`.
*/
interface Routine {
	/**
	* Copy a triangular matrix from standard packed format (TP) to Rectangular Full Packed format (RFP).
	*
	* @param transr - `transr`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param AP - `AP`
	* @param ARF - `ARF`
	* @returns result
	*/
	( transr: string, uplo: MatrixTriangle, N: number, AP: Float64Array, ARF: Float64Array ): Float64Array;

	/**
	* Copy a triangular matrix from standard packed format (TP) to Rectangular Full Packed format (RFP) using alternative indexing semantics.
	*
	* @param transr - `transr`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param AP - `AP`
	* @param strideAP - stride of `AP`
	* @param offsetAP - starting index for `AP`
	* @param ARF - `ARF`
	* @param strideARF - stride of `ARF`
	* @param offsetARF - starting index for `ARF`
	* @returns result
	*/
	ndarray( transr: string, uplo: MatrixTriangle, N: number, AP: Float64Array, strideAP: number, offsetAP: number, ARF: Float64Array, strideARF: number, offsetARF: number ): Float64Array;
}

/**
* Copy a triangular matrix from standard packed format (TP) to Rectangular Full Packed format (RFP).
*/
declare var dtpttf: Routine;


// EXPORTS //

export = dtpttf;
