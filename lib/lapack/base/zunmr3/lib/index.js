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
* Multiplies a general matrix by the unitary matrix Q from an RZ factorization.
*
* @module @stdlib/lapack/base/zunmr3
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zunmr3 = require( '@stdlib/lapack/base/zunmr3' );
*
* var A = new Complex128Array( 6 );
* var TAU = new Complex128Array( 2 );
* var C = new Complex128Array( 9 );
* var WORK = new Complex128Array( 3 );
*
* zunmr3( 'column-major', 'left', 'no-transpose', 3, 3, 2, 0, A, 2, TAU, 1, C, 3, WORK, 1 );
* // C unchanged when all reflectors are trivial
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zunmr3.ndarray" }
