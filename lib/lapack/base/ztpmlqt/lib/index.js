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
* Applies a complex unitary matrix `Q` (or its conjugate transpose) obtained from a triangular-pentagonal compact-WY block reflector — the output of `ztplqt` — to a stacked matrix `C` formed by two blocks `A` and `B`.
*
* @module @stdlib/lapack/base/ztpmlqt
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var ztpmlqt = require( '@stdlib/lapack/base/ztpmlqt' ).ndarray;
*
* // ... (see examples/index.js)
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "ztpmlqt.ndarray" }
