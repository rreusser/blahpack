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
* Interface describing `zunbdb6`.
*/
interface Routine {
	/**
	* orthogonalizes a complex column vector against the columns of a complex orthonormal basis matrix
	*
	* @param order - storage layout
	* @param m1 - m1
	* @param m2 - m2
	* @param N - number of columns
	* @param X1 - input array
	* @param strideX1 - stride length for `X1`
	* @param incx1 - incx1
	* @param X2 - input array
	* @param strideX2 - stride length for `X2`
	* @param incx2 - incx2
	* @param Q1 - input matrix
	* @param LDQ1 - leading dimension of `Q1`
	* @param Q2 - input matrix
	* @param LDQ2 - leading dimension of `Q2`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @returns result
	*/
	( order: Layout, m1: number, m2: number, N: number, X1: Float64Array, strideX1: number, incx1: number, X2: Float64Array, strideX2: number, incx2: number, Q1: Float64Array, LDQ1: number, Q2: Float64Array, LDQ2: number, WORK: Float64Array, strideWORK: number ): Float64Array;

	/**
	* orthogonalizes a complex column vector against the columns of a complex orthonormal basis matrix, using alternative indexing semantics.
	*
	* @param m1 - m1
	* @param m2 - m2
	* @param N - number of columns
	* @param X1 - input array
	* @param strideX1 - stride of `X`
	* @param offsetX1 - starting index for `X1`
	* @param incx1 - incx1
	* @param X2 - input array
	* @param strideX2 - stride of `X`
	* @param offsetX2 - starting index for `X2`
	* @param incx2 - incx2
	* @param Q1 - input matrix
	* @param strideQ11 - stride of `Q1`
	* @param strideQ12 - stride of `Q1`
	* @param offsetQ1 - starting index for `Q1`
	* @param Q2 - input matrix
	* @param strideQ21 - stride of `Q2`
	* @param strideQ22 - stride of `Q2`
	* @param offsetQ2 - starting index for `Q2`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( m1: number, m2: number, N: number, X1: Float64Array, strideX1: number, offsetX1: number, incx1: number, X2: Float64Array, strideX2: number, offsetX2: number, incx2: number, Q1: Float64Array, strideQ11: number, strideQ12: number, offsetQ1: number, Q2: Float64Array, strideQ21: number, strideQ22: number, offsetQ2: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* orthogonalizes a complex column vector against the columns of a complex orthonormal basis matrix
*/
declare var zunbdb6: Routine;


// EXPORTS //

export = zunbdb6;
