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
* Applies an elementary reflector to a Hermitian matrix.
*
* @module @rreusser/blahpack/lapack/base/zlarfy
*
* @example
* import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlarfy from '@rreusser/blahpack/lapack/base/zlarfy';
*
* var C = new Complex128Array( [ 4.0, 0.0, 0.0, 0.0, 1.0, 2.0, 5.0, 0.0 ] );
* var v = new Complex128Array( [ 1.0, 0.0, 0.5, 0.25 ] );
* var WORK = new Complex128Array( 2 );
*
* zlarfy( 'column-major', 'upper', 2, v, 1, new Complex128( 1.0, 0.0 ), C, 2, WORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlarfy.ndarray" }
