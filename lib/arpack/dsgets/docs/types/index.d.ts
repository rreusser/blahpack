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



/**
* Interface describing `dsgets`.
*/
interface Routine {
	/**
	* Selects the shifts for the implicitly restarted symmetric Lanczos/Arnoldi iteration and sorts the current Ritz values.
	*
	* @param ishift - if 1, compute the shifts; if 0, leave `shifts` untouched
	* @param which - ordering: `'LM'`, `'SM'`, `'LA'`, `'SA'`, or `'BE'`
	* @param kev - number of wanted Ritz values
	* @param np - number of shifts (unwanted Ritz values)
	* @param ritz - Ritz values (length kev+np); reordered in place
	* @param strideRitz - stride length for `ritz`
	* @param bounds - Ritz estimates (length kev+np); permuted alongside `ritz`
	* @param strideBounds - stride length for `bounds`
	* @param shifts - output array for the selected shifts (length np)
	* @param strideShifts - stride length for `shifts`
	*/
	( ishift: number, which: string, kev: number, np: number, ritz: Float64Array, strideRitz: number, bounds: Float64Array, strideBounds: number, shifts: Float64Array, strideShifts: number ): void;

	/**
	* Selects the shifts for the implicitly restarted symmetric Lanczos/Arnoldi iteration and sorts the current Ritz values, using alternative indexing semantics.
	*
	* @param ishift - if 1, compute the shifts; if 0, leave `shifts` untouched
	* @param which - ordering: `'LM'`, `'SM'`, `'LA'`, `'SA'`, or `'BE'`
	* @param kev - number of wanted Ritz values
	* @param np - number of shifts (unwanted Ritz values)
	* @param ritz - Ritz values (length kev+np); reordered in place
	* @param strideRitz - stride length for `ritz`
	* @param offsetRitz - starting index for `ritz`
	* @param bounds - Ritz estimates (length kev+np); permuted alongside `ritz`
	* @param strideBounds - stride length for `bounds`
	* @param offsetBounds - starting index for `bounds`
	* @param shifts - output array for the selected shifts (length np)
	* @param strideShifts - stride length for `shifts`
	* @param offsetShifts - starting index for `shifts`
	*/
	ndarray( ishift: number, which: string, kev: number, np: number, ritz: Float64Array, strideRitz: number, offsetRitz: number, bounds: Float64Array, strideBounds: number, offsetBounds: number, shifts: Float64Array, strideShifts: number, offsetShifts: number ): void;
}

/**
* Selects the shifts for the implicitly restarted symmetric Lanczos/Arnoldi iteration and sorts the current Ritz values.
*/
declare var dsgets: Routine;


// EXPORTS //

export = dsgets;
