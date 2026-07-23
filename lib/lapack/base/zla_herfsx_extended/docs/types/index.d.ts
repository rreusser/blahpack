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

import { Layout, MatrixTriangle } from '@stdlib/types/blas';

/**
* Interface describing `zla_herfsx_extended`.
*/
interface Routine {
	/**
	* Improves the computed solution using extra-precise iterative refinement for Hermitian indefinite matrices.
	*
	* @param order - storage layout
	* @param precType - `precType`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param AF - `AF`
	* @param LDAF - leading dimension of `AF`
	* @param IPIV - `IPIV`
	* @param colequ - `colequ`
	* @param c - `c`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param Y - `Y`
	* @param LDY - leading dimension of `Y`
	* @param berrOut - `berrOut`
	* @param nNorms - `nNorms`
	* @param errBndsNorm - `errBndsNorm`
	* @param ldErrBndsNorm - `ldErrBndsNorm`
	* @param errBndsComp - `errBndsComp`
	* @param ldErrBndsComp - `ldErrBndsComp`
	* @param RES - `RES`
	* @param AYB - `AYB`
	* @param DY - `DY`
	* @param yTail - `yTail`
	* @param rcond - `rcond`
	* @param ithresh - `ithresh`
	* @param rthresh - `rthresh`
	* @param dzUb - `dzUb`
	* @param ignoreCwise - `ignoreCwise`
	* @returns result
	*/
	( order: Layout, precType: number, uplo: MatrixTriangle, N: number, nrhs: number, A: Float64Array, LDA: number, AF: Float64Array, LDAF: number, IPIV: Int32Array, colequ: number, c: Float64Array, B: Float64Array, LDB: number, Y: Float64Array, LDY: number, berrOut: number, nNorms: number, errBndsNorm: number, ldErrBndsNorm: number, errBndsComp: number, ldErrBndsComp: number, RES: Float64Array, AYB: Float64Array, DY: Float64Array, yTail: number, rcond: number, ithresh: number, rthresh: number, dzUb: number, ignoreCwise: number ): number;

	/**
	* Improves the computed solution using extra-precise iterative refinement for Hermitian indefinite matrices using alternative indexing semantics.
	*
	* @param precType - `precType`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param AF - `AF`
	* @param strideAF1 - stride of `AF`
	* @param strideAF2 - stride of `AF`
	* @param offsetAF - starting index for `AF`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param colequ - `colequ`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param offsetC - starting index for `C`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param Y - `Y`
	* @param strideY1 - stride of `Y`
	* @param strideY2 - stride of `Y`
	* @param offsetY - starting index for `Y`
	* @param berrOut - `berrOut`
	* @param strideBerrOut - stride of `BerrOut`
	* @param offsetBerrOut - starting index for `BerrOut`
	* @param nNorms - `nNorms`
	* @param errBndsNorm - `errBndsNorm`
	* @param strideErrBndsNorm1 - stride of `ErrBndsNorm`
	* @param strideErrBndsNorm2 - stride of `ErrBndsNorm`
	* @param offsetErrBndsNorm - starting index for `ErrBndsNorm`
	* @param errBndsComp - `errBndsComp`
	* @param strideErrBndsComp1 - stride of `ErrBndsComp`
	* @param strideErrBndsComp2 - stride of `ErrBndsComp`
	* @param offsetErrBndsComp - starting index for `ErrBndsComp`
	* @param RES - `RES`
	* @param strideRES - stride of `RES`
	* @param offsetRES - starting index for `RES`
	* @param AYB - `AYB`
	* @param strideAYB - stride of `AYB`
	* @param offsetAYB - starting index for `AYB`
	* @param DY - `DY`
	* @param strideDY - stride of `DY`
	* @param offsetDY - starting index for `DY`
	* @param yTail - `yTail`
	* @param strideYTail - stride of `YTail`
	* @param offsetYTail - starting index for `YTail`
	* @param rcond - `rcond`
	* @param ithresh - `ithresh`
	* @param rthresh - `rthresh`
	* @param dzUb - `dzUb`
	* @param ignoreCwise - `ignoreCwise`
	* @returns result
	*/
	ndarray( precType: number, uplo: MatrixTriangle, N: number, nrhs: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, AF: Float64Array, strideAF1: number, strideAF2: number, offsetAF: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, colequ: number, c: Float64Array, strideC: number, offsetC: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, Y: Float64Array, strideY1: number, strideY2: number, offsetY: number, berrOut: number, strideBerrOut: number, offsetBerrOut: number, nNorms: number, errBndsNorm: number, strideErrBndsNorm1: number, strideErrBndsNorm2: number, offsetErrBndsNorm: number, errBndsComp: number, strideErrBndsComp1: number, strideErrBndsComp2: number, offsetErrBndsComp: number, RES: Float64Array, strideRES: number, offsetRES: number, AYB: Float64Array, strideAYB: number, offsetAYB: number, DY: Float64Array, strideDY: number, offsetDY: number, yTail: number, strideYTail: number, offsetYTail: number, rcond: number, ithresh: number, rthresh: number, dzUb: number, ignoreCwise: number ): number;
}

/**
* Improves the computed solution using extra-precise iterative refinement for Hermitian indefinite matrices.
*/
declare var zla_herfsx_extended: Routine;


// EXPORTS //

export = zla_herfsx_extended;
