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
* Multiplies a general matrix by the orthogonal matrix Q from an RZ factorization.
*
* ## Notes
*
* -   `A` contains the meaningful trailing `l`-vectors of the Householder reflectors as returned by `dtzrzf`; entries outside those positions are not accessed.
*
* @module @rreusser/blahpack/lapack/base/dormr3
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dormr3 from '@rreusser/blahpack/lapack/base/dormr3';
*
* var A = new Float64Array( 6 );
* var TAU = new Float64Array( 2 );
* var C = new Float64Array([ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
* var WORK = new Float64Array( 3 );
*
* dormr3( 'column-major', 'left', 'no-transpose', 3, 3, 2, 0, A, 2, TAU, 1, C, 3, WORK, 1 );
* // C unchanged when all reflectors are trivial
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dormr3.ndarray" }
