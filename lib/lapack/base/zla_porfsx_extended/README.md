<!--

@license Apache-2.0

Copyright (c) 2025 The Stdlib Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

-->

# zla_porfsx_extended

> Improves the computed solution using extra-precise iterative refinement for Hermitian positive-definite matrices

> ⚠️ **INCOMPLETE TRANSLATION — NOT EXTRA-PRECISE.**
>
> The reference LAPACK routine calls `BLAS_ZHEMV_X` and `BLAS_ZHEMV2_X` from the
> XBLAS extended-precision BLAS library. XBLAS is **not** distributed with LAPACK
> 3.12.0 and has not been ported to blahpack. This JS port substitutes plain
> double-precision `zhemv` for both calls, so the `prec_type` parameter has **no
> precision effect** — residuals are computed in plain double precision. Do
> **not** rely on this module for extra-precise residuals until XBLAS is ported.
>
> **Vendored-source modification:** stub `blas_zhemv_x.f` and `blas_zhemv2_x.f`
> files were added under `data/lapack-3.12.0/SRC/` so the Fortran test program
> can link. These stubs simply call `zhemv` and do **not** implement
> extended-precision arithmetic.
>
> Branch coverage is ~85% (right at the target) because state-machine branches
> that would only fire with true extended precision are unreachable.

<section class="usage">

## Usage

```javascript
var zla_porfsx_extended = require( '@stdlib/lapack/base/zla_porfsx_extended' );
```

#### zla_porfsx_extended( order, prec_type, uplo, N, A, LDA, AF, LDAF, colequ, c, strideC, B, LDB, Y, LDY, BERR_OUT, strideBERR_OUT, n_norms, ERR_BNDS_NORM, LDERR_BNDS_NORM, ERR_BNDS_COMP, LDERR_BNDS_COMP, RES, strideRES, AYB, strideAYB, y, strideY, Y_TAIL, strideY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise )

Improves the computed solution using extra-precise iterative refinement for Hermitian positive-definite matrices

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );

// Hermitian positive-definite 3x3 matrix, single RHS; see `examples/index.js`
// for a complete worked example including the `zpotrf` / `zpotrs` setup.
var A = new Complex128Array( 9 );
var B = new Complex128Array( 3 );
var info = zla_porfsx_extended( 'column-major', 1, 'upper', 3, 1, A, 3, /* ...see examples/ */ );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **prec_type**: prec_type.
-   **uplo**: specifies the operation type.
-   **N**: number of columns.
-   **A**: input matrix.
-   **LDA**: leading dimension of `A`.
-   **AF**: input matrix.
-   **LDAF**: leading dimension of `AF`.
-   **colequ**: colequ.
-   **c**: input array.
-   **strideC**: stride length for `c`.
-   **B**: input matrix.
-   **LDB**: leading dimension of `B`.
-   **Y**: input matrix.
-   **LDY**: leading dimension of `Y`.
-   **BERR_OUT**: input array.
-   **strideBERR_OUT**: stride length for `BERR_OUT`.
-   **n_norms**: n_norms.
-   **ERR_BNDS_NORM**: input matrix.
-   **LDERR_BNDS_NORM**: leading dimension of `ERR_BNDS_NORM`.
-   **ERR_BNDS_COMP**: input matrix.
-   **LDERR_BNDS_COMP**: leading dimension of `ERR_BNDS_COMP`.
-   **RES**: input array.
-   **strideRES**: stride length for `RES`.
-   **AYB**: input array.
-   **strideAYB**: stride length for `AYB`.
-   **y**: input array.
-   **strideY**: stride length for `y`.
-   **Y_TAIL**: output array.
-   **strideY_TAIL**: stride length for `Y_TAIL`.
-   **rcond**: rcond.
-   **ithresh**: ithresh.
-   **rthresh**: rthresh.
-   **dz_ub**: dz_ub.
-   **ignore_cwise**: ignore_cwise.

#### zla_porfsx_extended.ndarray( prec_type, uplo, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, colequ, c, strideC, offsetC, B, strideB1, strideB2, offsetB, Y, strideY1, strideY2, offsetY, BERR_OUT, strideBERR_OUT, offsetBERR_OUT, n_norms, ERR_BNDS_NORM, strideERR_BNDS_NORM1, strideERR_BNDS_NORM2, offsetERR_BNDS_NORM, ERR_BNDS_COMP, strideERR_BNDS_COMP1, strideERR_BNDS_COMP2, offsetERR_BNDS_COMP, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, y, strideY, offsetY, Y_TAIL, strideY_TAIL, offsetY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise )

Improves the computed solution using extra-precise iterative refinement for Hermitian positive-definite matrices, using alternative indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );

// See `examples/index.js` for a complete worked example.
```

The function has the following additional parameters:

-   **prec_type**: prec_type.
-   **uplo**: specifies the operation type.
-   **N**: number of columns.
-   **A**: input matrix.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **AF**: input matrix.
-   **strideAF1**: stride of dimension 1 of `AF`.
-   **strideAF2**: stride of dimension 2 of `AF`.
-   **offsetAF**: starting index for `AF`.
-   **colequ**: colequ.
-   **c**: input array.
-   **strideC**: stride length for `c`.
-   **offsetC**: starting index for `C`.
-   **B**: input matrix.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **Y**: input matrix.
-   **strideY1**: stride of dimension 1 of `Y`.
-   **strideY2**: stride of dimension 2 of `Y`.
-   **offsetY**: starting index for `Y`.
-   **BERR_OUT**: input array.
-   **strideBERR_OUT**: stride length for `BERR_OUT`.
-   **offsetBERR_OUT**: starting index for `BERR_OUT`.
-   **n_norms**: n_norms.
-   **ERR_BNDS_NORM**: input matrix.
-   **strideERR_BNDS_NORM1**: stride of dimension 1 of `ERR_BNDS_NORM`.
-   **strideERR_BNDS_NORM2**: stride of dimension 2 of `ERR_BNDS_NORM`.
-   **offsetERR_BNDS_NORM**: starting index for `ERR_BNDS_NORM`.
-   **ERR_BNDS_COMP**: input matrix.
-   **strideERR_BNDS_COMP1**: stride of dimension 1 of `ERR_BNDS_COMP`.
-   **strideERR_BNDS_COMP2**: stride of dimension 2 of `ERR_BNDS_COMP`.
-   **offsetERR_BNDS_COMP**: starting index for `ERR_BNDS_COMP`.
-   **RES**: input array.
-   **strideRES**: stride length for `RES`.
-   **offsetRES**: starting index for `RES`.
-   **AYB**: input array.
-   **strideAYB**: stride length for `AYB`.
-   **offsetAYB**: starting index for `AYB`.
-   **y**: input array.
-   **strideY**: stride length for `y`.
-   **offsetY**: starting index for `Y`.
-   **Y_TAIL**: output array.
-   **strideY_TAIL**: stride length for `Y_TAIL`.
-   **offsetY_TAIL**: starting index for `Y_TAIL`.
-   **rcond**: rcond.
-   **ithresh**: ithresh.
-   **rthresh**: rthresh.
-   **dz_ub**: dz_ub.
-   **ignore_cwise**: ignore_cwise.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   This port does not implement the XBLAS extra-precision residual variants (`BLAS_ZHEMV_X`, `BLAS_ZHEMV2_X`). The `prec_type` parameter is accepted for API parity but all residual paths compute the base-precision residual via `zhemv`.
-   On entry, `Y` must contain the initial solution computed by `zpotrs` from the Cholesky factor stored in `AF`.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

See [`examples/index.js`](./examples/index.js) for a runnable example.

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zla_porfsx_extended.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZLA_PORFSX_EXTENDED`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Improves the computed solution to a system of linear equations for symmetric or Hermitian positive-definite matrices by performing extra-precise iterative refinement and provides error bounds and backward error estimates for the solution.

### Purpose

ZLA\_PORFSX\_EXTENDED improves the computed solution to a system of linear equations by performing extra-precise iterative refinement and provides error bounds and backward error estimates for the solution. This subroutine is called by ZPORFSX to perform iterative refinement. In addition to normwise error bound, the code provides maximum componentwise error bound if possible. See comments for `ERR_BNDS_NORM` and `ERR_BNDS_COMP` for details of the error bounds. Note that this subroutine is only responsible for setting the second fields of `ERR_BNDS_NORM` and `ERR_BNDS_COMP`.

### Arguments

#### PREC_TYPE `[in]`

_INTEGER_

Specifies the intermediate precision to be used in refinement. The value is defined by ILAPREC(P) where P is a CHARACTER and P

-   = 'S': Single
-   = 'D': Double
-   = 'I': Indigenous
-   = 'X' or 'E': Extra

#### UPLO `[in]`

_CHARACTER\*1_

-   `= 'U'`: Upper triangle of A is stored;
-   `= 'L'`: Lower triangle of A is stored.

#### N `[in]`

_INTEGER_

The number of linear equations, i.e., the order of the matrix A. $N \ge 0$.

#### NRHS `[in]`

_INTEGER_

The number of right-hand-sides, i.e., the number of columns of the matrix B.

#### A `[in]`

_COMPLEX\*16 array, dimension (LDA,N)_

On entry, the N-by-N matrix A.

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1,N)$.

#### AF `[in]`

_COMPLEX\*16 array, dimension (LDAF,N)_

The triangular factor U or L from the Cholesky factorization $A = U^T \, U$ or $A = L \, L^T$, as computed by ZPOTRF.

#### LDAF `[in]`

_INTEGER_

The leading dimension of the array `AF`. $\mathrm{LDAF} \ge \max (1,N)$.

#### COLEQU `[in]`

_LOGICAL_

If .TRUE. then column equilibration was done to A before calling this routine. This is needed to compute the solution and error bounds correctly.

#### C `[in]`

_DOUBLE PRECISION array, dimension (N)_

The column scale factors for A. If `COLEQU` = .FALSE., C is not accessed. If C is input, each element of C should be a power of the radix to ensure a reliable solution and error estimates. Scaling by powers of the radix does not cause rounding errors unless the result underflows or overflows. Rounding errors during scaling lead to refining with a matrix that is not equivalent to the input matrix, producing error estimates that may not be reliable.

#### B `[in]`

_COMPLEX\*16 array, dimension (LDB,NRHS)_

The right-hand-side matrix B.

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,N)$.

#### Y `[in,out]`

_COMPLEX\*16 array, dimension (LDY,NRHS)_

On entry, the solution matrix X, as computed by ZPOTRS. On exit, the improved solution matrix Y.

#### LDY `[in]`

_INTEGER_

The leading dimension of the array Y. $\mathrm{LDY} \ge \max (1,N)$.

#### BERR_OUT `[out]`

_DOUBLE PRECISION array, dimension (NRHS)_

On exit, `BERR_OUT(j)` contains the componentwise relative backward error for right-hand-side j from the formula

$$
\max (i) ( \lvert \mathrm{RES}(i) \rvert / ( \lvert \operatorname{op}(\mathrm{A\_s}) \rvert \, \lvert Y \rvert + \lvert \mathrm{B\_s} \rvert )(i) )
$$

where abs(Z) is the componentwise absolute value of the matrix or vector Z. This is computed by ZLA\_LIN\_BERR.

#### N_NORMS `[in]`

_INTEGER_

Determines which error bounds to return (see `ERR_BNDS_NORM` and `ERR_BNDS_COMP`). If $\mathrm{N\_NORMS} \ge 1$ return normwise error bounds. If $\mathrm{N\_NORMS} \ge 2$ return componentwise error bounds.

#### ERR_BNDS_NORM `[in,out]`

_DOUBLE PRECISION array, dimension (NRHS, N\_ERR\_BNDS)_

For each right-hand side, this array contains information about various error bounds and condition numbers corresponding to the normwise relative error, which is defined as follows:

Normwise relative error in the ith solution vector:

max\_j (abs(XTRUE(j,i) - X(j,i))) ------------------------------ max\_j abs(X(j,i))

The array is indexed by the type of error information as described below. There currently are up to three pieces of information returned.

The first index in `ERR_BNDS_NORM(i,:)` corresponds to the ith right-hand side.

The second index in `ERR_BNDS_NORM(:,err)` contains the following three fields: err = 1 "Trust/don't trust" boolean. Trust the answer if the

-   reciprocal condition number is less than the threshold
-   sqrt(n) \* slamch('Epsilon').

err = 2 "Guaranteed" error bound: The estimated forward error,

-   almost certainly within a factor of 10 of the true error
-   so long as the next entry is greater than the threshold
-   sqrt(n) \* slamch('Epsilon'). This error bound should only
-   be trusted if the previous boolean is true.

err = 3 Reciprocal condition number: Estimated normwise

-   reciprocal condition number. Compared with the threshold
-   sqrt(n) \* slamch('Epsilon') to determine if the error
-   estimate is "guaranteed". These reciprocal condition
-   numbers are 1 / (norm(Z^{-1},inf) \* norm(Z,inf)) for some
-   appropriately scaled matrix Z.
-   Let $Z = S \, A$, where S scales each row by a power of the
-   radix so all absolute row sums of Z are approximately 1.

This subroutine is only responsible for setting the second field above. See Lapack Working Note 165 for further details and extra cautions.

#### ERR_BNDS_COMP `[in,out]`

_DOUBLE PRECISION array, dimension (NRHS, N\_ERR\_BNDS)_

For each right-hand side, this array contains information about various error bounds and condition numbers corresponding to the componentwise relative error, which is defined as follows:

Componentwise relative error in the ith solution vector:

abs(XTRUE(j,i) - X(j,i)) max\_j ---------------------- abs(X(j,i))

The array is indexed by the right-hand side i (on which the componentwise relative error depends), and the type of error information as described below. There currently are up to three pieces of information returned for each right-hand side. If componentwise accuracy is not requested (PARAMS(3) = 0.0), then `ERR_BNDS_COMP` is not accessed. If $\mathrm{N\_ERR\_BNDS} < 3$, then at most the first (:,N\_ERR\_BNDS) entries are returned.

The first index in `ERR_BNDS_COMP(i,:)` corresponds to the ith right-hand side.

The second index in `ERR_BNDS_COMP(:,err)` contains the following three fields: err = 1 "Trust/don't trust" boolean. Trust the answer if the

-   reciprocal condition number is less than the threshold
-   sqrt(n) \* slamch('Epsilon').

err = 2 "Guaranteed" error bound: The estimated forward error,

-   almost certainly within a factor of 10 of the true error
-   so long as the next entry is greater than the threshold
-   sqrt(n) \* slamch('Epsilon'). This error bound should only
-   be trusted if the previous boolean is true.

err = 3 Reciprocal condition number: Estimated componentwise

-   reciprocal condition number. Compared with the threshold
-   sqrt(n) \* slamch('Epsilon') to determine if the error
-   estimate is "guaranteed". These reciprocal condition
-   numbers are 1 / (norm(Z^{-1},inf) \* norm(Z,inf)) for some
-   appropriately scaled matrix Z.
-   Let $Z = S \, (A \, \operatorname{diag}(x))$, where x is the solution for the
-   current right-hand side and S scales each row of
-   $A \, \operatorname{diag}(x)$ by a power of the radix so all absolute row
-   sums of Z are approximately 1.

This subroutine is only responsible for setting the second field above. See Lapack Working Note 165 for further details and extra cautions.

#### RES `[in]`

_COMPLEX\*16 array, dimension (N)_

Workspace to hold the intermediate residual.

#### AYB `[in]`

_DOUBLE PRECISION array, dimension (N)_

Workspace.

#### DY `[in]`

_COMPLEX\*16 PRECISION array, dimension (N)_

Workspace to hold the intermediate solution.

#### Y_TAIL `[in]`

_COMPLEX\*16 array, dimension (N)_

Workspace to hold the trailing bits of the intermediate solution.

#### RCOND `[in]`

_DOUBLE PRECISION_

Reciprocal scaled condition number. This is an estimate of the reciprocal Skeel condition number of the matrix A after equilibration (if done). If this is less than the machine precision (in particular, if it is zero), the matrix is singular to working precision. Note that the error may still be small even if this number is very small and the matrix appears ill- conditioned.

#### ITHRESH `[in]`

_INTEGER_

The maximum number of residual computations allowed for refinement. The default is 10. For 'aggressive' set to 100 to permit convergence using approximate factorizations or factorizations other than LU. If the factorization uses a technique other than Gaussian elimination, the guarantees in `ERR_BNDS_NORM` and `ERR_BNDS_COMP` may no longer be trustworthy.

#### RTHRESH `[in]`

_DOUBLE PRECISION_

Determines when to stop refinement if the error estimate stops decreasing. Refinement will stop when the next solution no longer satisfies norm(dx\_{i+1}) \< `RTHRESH` \* norm(dx\_i) where norm(Z) is the infinity norm of Z. `RTHRESH` satisfies $0 < \mathrm{RTHRESH} \le 1$. The default value is 0.5. For 'aggressive' set to 0.9 to permit convergence on extremely ill-conditioned matrices. See LAWN 165 for more details.

#### DZ_UB `[in]`

_DOUBLE PRECISION_

Determines when to start considering componentwise convergence. Componentwise convergence is only considered after each component of the solution Y is stable, which we define as the relative change in each component being less than `DZ_UB`. The default value is 0.25, requiring the first bit to be stable. See LAWN 165 for more details.

#### IGNORE_CWISE `[in]`

_LOGICAL_

If .TRUE. then ignore componentwise convergence. Default value is .FALSE..

#### INFO `[out]`

_INTEGER_

-   `= 0`: Successful exit.
-   `< 0`: if `INFO = -i`, the ith argument to ZPOTRS had an illegal value

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array
[mdn-float32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
[mdn-int32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->
