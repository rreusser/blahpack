/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
* Pre-processor for `zgesvj` performing Jacobi rotations.
*
* `zgsvj0` applies a sequence of Jacobi rotations from the right to the M-by-N complex matrix `A*diag(D)` in column-pivoted cyclic order. The complex vector `D` accumulates rotation phases (`D(p) <- -D(q) * ompq`) and the real vector `SVA` holds the Euclidean column norms `||A(:,j)||`. The routine does **not** check the convergence criterion — it simply performs `nsweep` row-cyclic sweeps with a row-skipping heuristic. It is intended to be called from `zgesvj` as a preprocessor.
*
* ## Notes
*
* -   `D` is a phase accumulator: it is updated *only* via `D(p) <- -D(q)*ompq` after each rotation, and is never read inside any inner computation. `A`, `V`, and `SVA` carry the load-bearing state.
* -   `jobv` strings are long-form: `'compute-v'`, `'apply-v'`, `'no-v'`. Single-character Fortran flags (`'V'`, `'A'`, `'N'`) are rejected by the validator.
* -   The complex sine for each `zrot` call is `conj(ompq)*sn` (or `conj(ompq)*t` in the trivial-rotation branch). This is reused for both the `A` and `V` updates inside a rotation.
*
* @module @rreusser/blahpack/lapack/base/zgsvj0
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zgsvj0 from '@rreusser/blahpack/lapack/base/zgsvj0';
*
* var EPS = 2.220446049250313e-16;
* var SFMIN = 2.2250738585072014e-308;
* var TOL = 1.0e-10;
*
* // A = [ 1, 1; 1, -1+i ] (column-major), with initial column norms in sva:
* var A = new Complex128Array( [ 1, 0, 1, 0, 1, 0, -1, 1 ] );
* var d = new Complex128Array( [ 1, 0, 1, 0 ] );
* var sva = new Float64Array( [ Math.sqrt( 2.0 ), Math.sqrt( 3.0 ) ] );
* var V = new Complex128Array( 1 );
* var work = new Complex128Array( 2 );
*
* var info = zgsvj0( 'column-major', 'no-v', 2, 2, A, 2, d, 1, sva, 1, 0, V, 1, EPS, SFMIN, TOL, 5, work );
* // returns 0
*
* // After the sweeps, sva holds the singular values of A:
* // sva => <Float64Array>[ ~1.902113, ~1.175571 ]
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zgsvj0.ndarray" }
