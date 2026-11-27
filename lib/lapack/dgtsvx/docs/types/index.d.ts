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

import { TransposeOperation } from '@stdlib/types/blas';

/**
* Interface describing `dgtsvx`.
*/
interface Routine {
	/**
	* Uses the LU factorization to compute the solution to a real system of.
	*
	* @param fact - `fact`
	* @param trans - specifies whether the matrix should be transposed
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param DL - `DL`
	* @param strideDL - stride of `DL`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param DU - `DU`
	* @param strideDU - stride of `DU`
	* @param DLF - `DLF`
	* @param strideDLF - stride of `DLF`
	* @param DF - `DF`
	* @param strideDF - stride of `DF`
	* @param DUF - `DUF`
	* @param strideDUF - stride of `DUF`
	* @param DU2 - `DU2`
	* @param strideDU2 - stride of `DU`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param X - `X`
	* @param LDX - leading dimension of `X`
	* @param rcond - `rcond`
	* @param FERR - `FERR`
	* @param strideFERR - stride of `FERR`
	* @param BERR - `BERR`
	* @param strideBERR - stride of `BERR`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @returns result
	*/
	( fact: string, trans: TransposeOperation, N: number, nrhs: number, DL: Float64Array, strideDL: number, d: Float64Array, strideD: number, DU: Float64Array, strideDU: number, DLF: Float64Array, strideDLF: number, DF: Float64Array, strideDF: number, DUF: Float64Array, strideDUF: number, DU2: number, strideDU2: number, IPIV: Int32Array, strideIPIV: number, B: Float64Array, LDB: number, X: Float64Array, LDX: number, rcond: number, FERR: Float64Array, strideFERR: number, BERR: Float64Array, strideBERR: number, WORK: Float64Array, strideWORK: number, IWORK: Int32Array, strideIWORK: number ): Float64Array;

	/**
	* Uses the LU factorization to compute the solution to a real system of using alternative indexing semantics.
	*
	* @param fact - `fact`
	* @param trans - specifies whether the matrix should be transposed
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param DL - `DL`
	* @param strideDL - stride of `DL`
	* @param offsetDL - starting index for `DL`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param DU - `DU`
	* @param strideDU - stride of `DU`
	* @param offsetDU - starting index for `DU`
	* @param DLF - `DLF`
	* @param strideDLF - stride of `DLF`
	* @param offsetDLF - starting index for `DLF`
	* @param DF - `DF`
	* @param strideDF - stride of `DF`
	* @param offsetDF - starting index for `DF`
	* @param DUF - `DUF`
	* @param strideDUF - stride of `DUF`
	* @param offsetDUF - starting index for `DUF`
	* @param DU2 - `DU2`
	* @param strideDU2 - stride of `DU`
	* @param offsetDU2 - starting index for `DU2`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param X - `X`
	* @param strideX1 - stride of `X`
	* @param strideX2 - stride of `X`
	* @param offsetX - starting index for `X`
	* @param rcond - `rcond`
	* @param FERR - `FERR`
	* @param strideFERR - stride of `FERR`
	* @param offsetFERR - starting index for `FERR`
	* @param BERR - `BERR`
	* @param strideBERR - stride of `BERR`
	* @param offsetBERR - starting index for `BERR`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	ndarray( fact: string, trans: TransposeOperation, N: number, nrhs: number, DL: Float64Array, strideDL: number, offsetDL: number, d: Float64Array, strideD: number, offsetD: number, DU: Float64Array, strideDU: number, offsetDU: number, DLF: Float64Array, strideDLF: number, offsetDLF: number, DF: Float64Array, strideDF: number, offsetDF: number, DUF: Float64Array, strideDUF: number, offsetDUF: number, DU2: number, strideDU2: number, offsetDU2: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, X: Float64Array, strideX1: number, strideX2: number, offsetX: number, rcond: number, FERR: Float64Array, strideFERR: number, offsetFERR: number, BERR: Float64Array, strideBERR: number, offsetBERR: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;
}

/**
* Uses the LU factorization to compute the solution to a real system of.
*/
declare var dgtsvx: Routine;


// EXPORTS //

export = dgtsvx;
