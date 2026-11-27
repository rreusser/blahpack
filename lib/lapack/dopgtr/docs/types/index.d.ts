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
* Interface describing `dopgtr`.
*/
interface Routine {
	/**
	* Generates a real orthogonal matrix Q from the elementary reflectors returned by dsptrd.
	*
	* @param order - storage layout
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param AP - `AP`
	* @param TAU - `TAU`
	* @param Q - `Q`
	* @param LDQ - leading dimension of `Q`
	* @param WORK - `WORK`
	* @returns result
	*/
	( order: Layout, uplo: MatrixTriangle, N: number, AP: Float64Array, TAU: Float64Array, Q: Float64Array, LDQ: number, WORK: Float64Array ): Float64Array;

	/**
	* Generates a real orthogonal matrix Q from the elementary reflectors returned by dsptrd using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param AP - `AP`
	* @param strideAP - stride of `AP`
	* @param offsetAP - starting index for `AP`
	* @param TAU - `TAU`
	* @param strideTAU - stride of `TAU`
	* @param offsetTAU - starting index for `TAU`
	* @param Q - `Q`
	* @param strideQ1 - stride of `Q`
	* @param strideQ2 - stride of `Q`
	* @param offsetQ - starting index for `Q`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, N: number, AP: Float64Array, strideAP: number, offsetAP: number, TAU: Float64Array, strideTAU: number, offsetTAU: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Generates a real orthogonal matrix Q from the elementary reflectors returned by dsptrd.
*/
declare var dopgtr: Routine;


// EXPORTS //

export = dopgtr;
