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
* Applies an elementary reflector from RZ factorization to a general matrix.
*
* ## Notes
*
* -   `dlarz` applies the elementary reflector `H = I - tau * v * v**T` produced by an RZ factorization (see `dtzrzf`), where `v` has the implicit structure `v = [ 1; 0; ...; 0; z ]` with only the trailing `l`-vector `z` stored explicitly. When `l = 0`, `H` reduces to a rank-one update on the first row (for `side='left'`) or first column (for `side='right'`) of `C`.
* -   The reflector is applied in-place: `C := H * C` when `side='left'`, or `C := C * H` when `side='right'`. When `tau` is zero, `H` is the identity and `C` is left unchanged.
*
* @module @rreusser/blahpack/lapack/base/dlarz
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlarz from '@rreusser/blahpack/lapack/base/dlarz';
*
* var v = new Float64Array( [ 0.5, 0.25 ] );
* var C = new Float64Array( [ 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16 ] );
* var WORK = new Float64Array( 4 );
*
* dlarz( 'column-major', 'left', 4, 4, 2, v, 1, 1.5, C, 4, WORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlarz.ndarray" }
