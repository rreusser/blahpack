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
* Interface describing `zla_gbrfsx_extended`.
*/
interface Routine {
	/**
	* Improves the computed solution using extra-precise iterative refinement for complex banded matrices
	*
	* @param order - storage layout
	* @param prec_type - prec_type
	* @param trans_type - trans_type
	* @param N - number of columns
	* @param kl - kl
	* @param ku - ku
	* @param AB - input matrix
	* @param LDAB - leading dimension of `AB`
	* @param AFB - input matrix
	* @param LDAFB - leading dimension of `AFB`
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
	* @param ERR_BNDS_NORM - input matrix
	* @param LDERR_BNDS_NORM - leading dimension of `ERR_BNDS_NORM`
	* @param ERR_BNDS_COMP - input matrix
	* @param LDERR_BNDS_COMP - leading dimension of `ERR_BNDS_COMP`
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
	( order: Layout, prec_type: number, trans_type: number, N: number, kl: number, ku: number, AB: Float64Array, LDAB: number, AFB: Float64Array, LDAFB: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, colequ: boolean, c: Float64Array, strideC: number, B: Float64Array, LDB: number, Y: Float64Array, LDY: number, BERR_OUT: Float64Array, strideBERR_OUT: number, n_norms: number, ERR_BNDS_NORM: Float64Array, LDERR_BNDS_NORM: number, ERR_BNDS_COMP: Float64Array, LDERR_BNDS_COMP: number, RES: Float64Array, strideRES: number, AYB: Float64Array, strideAYB: number, y: Float64Array, strideY: number, Y_TAIL: Float64Array, strideY_TAIL: number, rcond: number, ithresh: number, rthresh: number, dz_ub: number, ignore_cwise: boolean ): Float64Array;

	/**
	* Improves the computed solution using extra-precise iterative refinement for complex banded matrices, using alternative indexing semantics.
	*
	* @param prec_type - prec_type
	* @param trans_type - trans_type
	* @param N - number of columns
	* @param kl - kl
	* @param ku - ku
	* @param AB - input matrix
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param AFB - input matrix
	* @param strideAFB1 - stride of `AFB`
	* @param strideAFB2 - stride of `AFB`
	* @param offsetAFB - starting index for `AFB`
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
	* @param ERR_BNDS_NORM - input matrix
	* @param strideERR_BNDS_NORM1 - stride of `ERR_BNDS_NORM`
	* @param strideERR_BNDS_NORM2 - stride of `ERR_BNDS_NORM`
	* @param offsetERR_BNDS_NORM - starting index for `ERR_BNDS_NORM`
	* @param ERR_BNDS_COMP - input matrix
	* @param strideERR_BNDS_COMP1 - stride of `ERR_BNDS_COMP`
	* @param strideERR_BNDS_COMP2 - stride of `ERR_BNDS_COMP`
	* @param offsetERR_BNDS_COMP - starting index for `ERR_BNDS_COMP`
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
	ndarray( prec_type: number, trans_type: number, N: number, kl: number, ku: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, AFB: Float64Array, strideAFB1: number, strideAFB2: number, offsetAFB: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, colequ: boolean, c: Float64Array, strideC: number, offsetC: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, Y: Float64Array, strideY1: number, strideY2: number, offsetY: number, BERR_OUT: Float64Array, strideBERR_OUT: number, offsetBERR_OUT: number, n_norms: number, ERR_BNDS_NORM: Float64Array, strideERR_BNDS_NORM1: number, strideERR_BNDS_NORM2: number, offsetERR_BNDS_NORM: number, ERR_BNDS_COMP: Float64Array, strideERR_BNDS_COMP1: number, strideERR_BNDS_COMP2: number, offsetERR_BNDS_COMP: number, RES: Float64Array, strideRES: number, offsetRES: number, AYB: Float64Array, strideAYB: number, offsetAYB: number, y: Float64Array, strideY: number, offsetY: number, Y_TAIL: Float64Array, strideY_TAIL: number, offsetY_TAIL: number, rcond: number, ithresh: number, rthresh: number, dz_ub: number, ignore_cwise: boolean ): Float64Array;
}

/**
* Improves the computed solution using extra-precise iterative refinement for complex banded matrices
*/
declare var zla_gbrfsx_extended: Routine;


// EXPORTS //

export = zla_gbrfsx_extended;
