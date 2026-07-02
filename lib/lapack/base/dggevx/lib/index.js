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
* Computes for a pair of N-by-N real nonsymmetric matrices (A,B) the generalized eigenvalues, and, optionally, the left and/or right generalized eigenvectors, along with optional balancing (ILO/IHI/LSCALE/RSCALE/ABNRM/BBNRM) and reciprocal condition numbers (RCONDE/RCONDV).
*
* @module @stdlib/lapack/base/dggevx
*
* @example
* // Compute generalized eigenvalues and optional condition numbers for a pair of real matrices.
* // See README.md and tests for full usage examples.
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dggevx.ndarray" }
