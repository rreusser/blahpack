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
* Interface describing `zlaqz1`.
*/
interface Routine {
	/**
	* Chases a 1x1 shift bulge in a matrix pencil down a single position (complex QZ)
	*
	* @param order - storage layout
	* @param ilq - ilq
	* @param ilz - ilz
	* @param K - number of superdiagonals
	* @param istartm - istartm
	* @param istopm - istopm
	* @param ihi - ihi
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param B - input matrix
	* @param LDB - leading dimension of `B`
	* @param nq - nq
	* @param qstart - qstart
	* @param Q - input matrix
	* @param LDQ - leading dimension of `Q`
	* @param nz - nz
	* @param zstart - zstart
	* @param Z - output matrix
	* @param LDZ - leading dimension of `Z`
	* @returns result
	*/
	( order: Layout, ilq: boolean, ilz: boolean, K: number, istartm: number, istopm: number, ihi: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, nq: number, qstart: number, Q: Float64Array, LDQ: number, nz: number, zstart: number, Z: Float64Array, LDZ: number ): Float64Array;

	/**
	* Chases a 1x1 shift bulge in a matrix pencil down a single position (complex QZ), using alternative indexing semantics.
	*
	* @param ilq - ilq
	* @param ilz - ilz
	* @param K - number of superdiagonals
	* @param istartm - istartm
	* @param istopm - istopm
	* @param ihi - ihi
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - input matrix
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param nq - nq
	* @param qstart - qstart
	* @param Q - input matrix
	* @param strideQ1 - stride of `Q`
	* @param strideQ2 - stride of `Q`
	* @param offsetQ - starting index for `Q`
	* @param nz - nz
	* @param zstart - zstart
	* @param Z - output matrix
	* @param strideZ1 - stride of `Z`
	* @param strideZ2 - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @returns result
	*/
	ndarray( ilq: boolean, ilz: boolean, K: number, istartm: number, istopm: number, ihi: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, nq: number, qstart: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, nz: number, zstart: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number ): Float64Array;
}

/**
* Chases a 1x1 shift bulge in a matrix pencil down a single position (complex QZ)
*/
declare var zlaqz1: Routine;


// EXPORTS //

export = zlaqz1;
