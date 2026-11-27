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
* Generates a real `M`-by-`N` matrix `Q` with orthonormal columns from a Tall-Skinny QR factorization (`dlatsqr`).
*
* ## Notes
*
* -   `dorgtsqr` consumes the output of `dlatsqr`: the reflectors stored below the diagonal of `A` and the block triangular factors stored in `T`. Calling `dorgtsqr` on inputs that did not come from `dlatsqr` (with the same `mb`, `nb`) will produce undefined results.
* -   The implementation forms `Q` by applying the implicit `Q` to the leading `N` columns of the `M`-by-`M` identity matrix using `dlamtsqr`, then copying the result back into `A`.
*
* @module @rreusser/blahpack/lapack/base/dorgtsqr
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dorgtsqr from '@rreusser/blahpack/lapack/base/dorgtsqr';
*
* // Pre-factored 4-by-2 inputs (reflectors and T factors that the corresponding `dlatsqr` call would produce):
* var M = 4;
* var N = 2;
* var mb = 8;
* var nb = 2;
* var A = new Float64Array( M * N ); // would be filled by dlatsqr in real usage
* var T = new Float64Array( nb * N );
* var WORK = new Float64Array( ( M + nb ) * N );
*
* var info = dorgtsqr( 'column-major', M, N, mb, nb, A, M, T, nb, WORK );
* // returns 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dorgtsqr.ndarray" }
