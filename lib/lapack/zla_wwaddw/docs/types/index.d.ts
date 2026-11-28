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

import { Complex128Array } from '@stdlib/types/array';

/**
* Interface describing `zla_wwaddw`.
*/
interface Routine {
	/**
	* Adds a complex vector `W` into a doubled-single accumulation vector `(X, Y)`.
	*
	* @param N - number of elements
	* @param x - high-order part of the doubled-single accumulation vector
	* @param strideX - stride length for `x`
	* @param y - low-order part of the doubled-single accumulation vector
	* @param strideY - stride length for `y`
	* @param w - vector to be added
	* @param strideW - stride length for `w`
	* @returns `x`
	*/
	( N: number, x: Complex128Array, strideX: number, y: Complex128Array, strideY: number, w: Complex128Array, strideW: number ): Complex128Array;

	/**
	* Adds a complex vector `W` into a doubled-single accumulation vector `(X, Y)` using alternative indexing semantics.
	*
	* @param N - number of elements
	* @param x - high-order part of the doubled-single accumulation vector
	* @param strideX - stride length for `x`
	* @param offsetX - starting index for `x`
	* @param y - low-order part of the doubled-single accumulation vector
	* @param strideY - stride length for `y`
	* @param offsetY - starting index for `y`
	* @param w - vector to be added
	* @param strideW - stride length for `w`
	* @param offsetW - starting index for `w`
	* @returns `x`
	*/
	ndarray( N: number, x: Complex128Array, strideX: number, offsetX: number, y: Complex128Array, strideY: number, offsetY: number, w: Complex128Array, strideW: number, offsetW: number ): Complex128Array;
}

/**
* Adds a complex vector `W` into a doubled-single accumulation vector `(X, Y)`.
*/
declare var zla_wwaddw: Routine;


// EXPORTS //

export = zla_wwaddw;
