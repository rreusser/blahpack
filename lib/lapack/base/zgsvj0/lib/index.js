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
