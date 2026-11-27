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
* Interface describing `zla_gerfsx_extended`.
*/
interface Routine {
	/**
	* Improves the computed solution using extra-precise iterative refinement for complex general matrices
	*
	* @param order - storage layout
	* @param prec_type - prec_type
	* @param trans_type - trans_type
	* @param N - number of columns
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param AF - input matrix
	* @param LDAF - leading dimension of `AF`
	* @param IPIV - input array
	* @param strideIPIV - stride length for `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param colequ - colequ
	* @param c - input array
	* @param strideC - stride length for `c`
	* @param B - input matrix
	* @param LDB - leading dimension of `B`
	* @param Y - input matrix
	* @param LDY - leading dimension of `Y`
	* @param BERR_OUT - input array
	* @param strideBERR_OUT - stride length for `BERR_OUT`
	* @param n_norms - n_norms
	* @param ERRS_N - input matrix
	* @param LDERRS_N - leading dimension of `ERRS_N`
	* @param ERRS_C - input matrix
	* @param LDERRS_C - leading dimension of `ERRS_C`
	* @param RES - input array
	* @param strideRES - stride length for `RES`
	* @param AYB - input array
	* @param strideAYB - stride length for `AYB`
	* @param y - input array
	* @param strideY - stride length for `y`
	* @param Y_TAIL - output array
	* @param strideY_TAIL - stride length for `Y_TAIL`
	* @param rcond - rcond
	* @param ithresh - ithresh
	* @param rthresh - rthresh
	* @param dz_ub - dz_ub
	* @param ignore_cwise - ignore_cwise
	* @returns result
	*/
	( order: Layout, prec_type: number, trans_type: number, N: number, A: Float64Array, LDA: number, AF: Float64Array, LDAF: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, colequ: boolean, c: Float64Array, strideC: number, B: Float64Array, LDB: number, Y: Float64Array, LDY: number, BERR_OUT: Float64Array, strideBERR_OUT: number, n_norms: number, ERRS_N: Float64Array, LDERRS_N: number, ERRS_C: Float64Array, LDERRS_C: number, RES: Float64Array, strideRES: number, AYB: Float64Array, strideAYB: number, y: Float64Array, strideY: number, Y_TAIL: Float64Array, strideY_TAIL: number, rcond: number, ithresh: number, rthresh: number, dz_ub: number, ignore_cwise: boolean ): Float64Array;

	/**
	* Improves the computed solution using extra-precise iterative refinement for complex general matrices, using alternative indexing semantics.
	*
	* @param prec_type - prec_type
	* @param trans_type - trans_type
	* @param N - number of columns
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param AF - input matrix
	* @param strideAF1 - stride of `AF`
	* @param strideAF2 - stride of `AF`
	* @param offsetAF - starting index for `AF`
	* @param IPIV - input array
	* @param strideIPIV - stride length for `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param colequ - colequ
	* @param c - input array
	* @param strideC - stride length for `c`
	* @param offsetC - starting index for `C`
	* @param B - input matrix
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param Y - input matrix
	* @param strideY1 - stride of `Y`
	* @param strideY2 - stride of `Y`
	* @param offsetY - starting index for `Y`
	* @param BERR_OUT - input array
	* @param strideBERR_OUT - stride length for `BERR_OUT`
	* @param offsetBERR_OUT - starting index for `BERR_OUT`
	* @param n_norms - n_norms
	* @param ERRS_N - input matrix
	* @param strideERRS_N1 - stride of `ERRS_N`
	* @param strideERRS_N2 - stride of `ERRS_N`
	* @param offsetERRS_N - starting index for `ERRS_N`
	* @param ERRS_C - input matrix
	* @param strideERRS_C1 - stride of `ERRS_C`
	* @param strideERRS_C2 - stride of `ERRS_C`
	* @param offsetERRS_C - starting index for `ERRS_C`
	* @param RES - input array
	* @param strideRES - stride length for `RES`
	* @param offsetRES - starting index for `RES`
	* @param AYB - input array
	* @param strideAYB - stride length for `AYB`
	* @param offsetAYB - starting index for `AYB`
	* @param y - input array
	* @param strideY - stride length for `y`
	* @param offsetY - starting index for `Y`
	* @param Y_TAIL - output array
	* @param strideY_TAIL - stride length for `Y_TAIL`
	* @param offsetY_TAIL - starting index for `Y_TAIL`
	* @param rcond - rcond
	* @param ithresh - ithresh
	* @param rthresh - rthresh
	* @param dz_ub - dz_ub
	* @param ignore_cwise - ignore_cwise
	* @returns result
	*/
	ndarray( prec_type: number, trans_type: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, AF: Float64Array, strideAF1: number, strideAF2: number, offsetAF: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, colequ: boolean, c: Float64Array, strideC: number, offsetC: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, Y: Float64Array, strideY1: number, strideY2: number, offsetY: number, BERR_OUT: Float64Array, strideBERR_OUT: number, offsetBERR_OUT: number, n_norms: number, ERRS_N: Float64Array, strideERRS_N1: number, strideERRS_N2: number, offsetERRS_N: number, ERRS_C: Float64Array, strideERRS_C1: number, strideERRS_C2: number, offsetERRS_C: number, RES: Float64Array, strideRES: number, offsetRES: number, AYB: Float64Array, strideAYB: number, offsetAYB: number, y: Float64Array, strideY: number, offsetY: number, Y_TAIL: Float64Array, strideY_TAIL: number, offsetY_TAIL: number, rcond: number, ithresh: number, rthresh: number, dz_ub: number, ignore_cwise: boolean ): Float64Array;
}

/**
* Improves the computed solution using extra-precise iterative refinement for complex general matrices
*/
declare var zla_gerfsx_extended: Routine;


// EXPORTS //

export = zla_gerfsx_extended;
