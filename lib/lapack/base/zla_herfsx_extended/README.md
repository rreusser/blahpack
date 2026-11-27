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

# zla_herfsx_extended

> Improves the computed solution using extra-precise iterative refinement for Hermitian indefinite matrices

> ⚠️ **INCOMPLETE TRANSLATION — NOT EXTRA-PRECISE.**
>
> The reference LAPACK routine calls `BLAS_ZHEMV_X` and `BLAS_ZHEMV2_X` from the
> XBLAS extended-precision BLAS library. XBLAS is **not** distributed with LAPACK
> 3.12.0 and has not been ported to blahpack. This JS port substitutes plain
> double-precision `zhemv` for both calls, so the `prec_type` parameter has **no
> precision effect** — the routine still runs the iterative refinement state
> machine and the `zla_wwaddw` compensated-sum update, but residuals are computed
> in plain double precision. Do **not** rely on this module for extra-precise
> residuals until XBLAS is ported.
>
> Because the Fortran reference cannot be linked without XBLAS, no reference
> fixtures were generated. Tests validate mathematical invariants (`A*Y ≈ B`
> componentwise, small `BERR_OUT`) rather than matching Fortran output.
>
> Branch coverage is ~64% (below the 85% target) because state-machine branches
> that would only fire with true extended precision are unreachable in this
> build.

<section class="usage">

## Usage

```javascript
var zla_herfsx_extended = require( '@stdlib/lapack/base/zla_herfsx_extended' );
```

#### zla_herfsx_extended( order, prec_type, uplo, N, A, LDA, AF, LDAF, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, B, LDB, Y, LDY, BERR_OUT, strideBERR_OUT, n_norms, ERR_BNDS_NORM, LDERR_BNDS_NORM, ERR_BNDS_COMP, LDERR_BNDS_COMP, RES, strideRES, AYB, strideAYB, y, strideY, Y_TAIL, strideY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise )

Improves the computed solution using extra-precise iterative refinement for Hermitian indefinite matrices

```javascript
var Float64Array = require( '@stdlib/array/float64' );

// See the `examples/` directory for a complete runnable example.
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
-   **IPIV**: input array.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
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

#### zla_herfsx_extended.ndarray( prec_type, uplo, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, offsetC, B, strideB1, strideB2, offsetB, Y, strideY1, strideY2, offsetY, BERR_OUT, strideBERR_OUT, offsetBERR_OUT, n_norms, ERR_BNDS_NORM, strideERR_BNDS_NORM1, strideERR_BNDS_NORM2, offsetERR_BNDS_NORM, ERR_BNDS_COMP, strideERR_BNDS_COMP1, strideERR_BNDS_COMP2, offsetERR_BNDS_COMP, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, y, strideY, offsetY, Y_TAIL, strideY_TAIL, offsetY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise )

Improves the computed solution using extra-precise iterative refinement for Hermitian indefinite matrices, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

// See the `examples/` directory for a complete runnable example.
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
-   **IPIV**: input array.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
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

-   This routine improves the computed solution `Y` to a Hermitian indefinite system `A*X = B` and returns per-right-hand-side backward and forward error bounds.
-   Extended-precision BLAS calls (`BLAS_ZHEMV_X`, `BLAS_ZHEMV2_X`) from the Fortran reference are substituted with plain `zhemv`, since double-double extended-precision BLAS is not available in the runtime. The `precType` argument is accepted but currently has no effect on residual precision.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var zlaHerfsxExtended = require( '@stdlib/lapack/base/zla_herfsx_extended' );

// See examples/index.js for a complete runnable example.
console.log( typeof zlaHerfsxExtended );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zla_herfsx_extended.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZLA_HERFSX_EXTENDED`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZLA\_HERFSX\_EXTENDED improves the computed solution to a system of linear equations by performing extra-precise iterative refinement and provides error bounds and backward error estimates for the solution. This subroutine is called by ZHERFSX to perform iterative refinement. In addition to normwise error bound, the code provides maximum componentwise error bound if possible. See comments for `ERR_BNDS_NORM` and `ERR_BNDS_COMP` for details of the error bounds. Note that this subroutine is only responsible for setting the second fields of `ERR_BNDS_NORM` and `ERR_BNDS_COMP`.

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
