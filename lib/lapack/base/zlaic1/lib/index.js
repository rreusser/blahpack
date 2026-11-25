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
* Applies one step of incremental condition estimation for complex matrices.
*
* @module @rreusser/blahpack/lapack/base/zlaic1
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import zlaic1 from '@rreusser/blahpack/lapack/base/zlaic1';
*
* var x = new Complex128Array( [ 0.6, 0.1, 0.5, -0.2 ] );
* var w = new Complex128Array( [ 0.3, 0.4, 0.7, -0.1 ] );
* var gamma = new Complex128( 1.0, 0.5 );
* var sestpr = new Float64Array( 1 );
* var s = new Complex128Array( 1 );
* var c = new Complex128Array( 1 );
*
* zlaic1.ndarray( 'largest-singular-value', 2, x, 1, 0, 2.5, w, 1, 0, gamma, sestpr, s, 0, c, 0 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlaic1.ndarray" }
