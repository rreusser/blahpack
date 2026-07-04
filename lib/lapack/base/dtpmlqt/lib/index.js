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
* Applies a real orthogonal matrix `Q` (or its transpose) obtained from a triangular-pentagonal compact-WY block reflector — the output of `dtplqt` — to a stacked matrix `C` formed by two blocks `A` and `B`.
*
* @module @stdlib/lapack/base/dtpmlqt
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dtpmlqt = require( '@stdlib/lapack/base/dtpmlqt' ).ndarray;
*
* // ... (see examples/index.js)
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;
