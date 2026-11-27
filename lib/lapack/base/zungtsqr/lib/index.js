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
* Generates an M-by-N complex matrix Q with orthonormal columns from a Tall-Skinny QR factorization (output of zlatsqr).
*
* ## Notes
*
* -   `Q` is formed by applying the unitary factor `Q` (from `zlatsqr`) to the `M`-by-`N` identity via `zlamtsqr` and copying the result back into `A`.
*
* @module @rreusser/blahpack/lapack/base/zungtsqr
*/

export { default } from './main.js';
export { default as ndarray } from './ndarray.js';
