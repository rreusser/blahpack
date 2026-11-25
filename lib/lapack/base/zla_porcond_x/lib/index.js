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
* Estimates the infinity norm condition number for a Hermitian positive-definite matrix with x scaling.
*
* @module @rreusser/blahpack/lapack/base/zla_porcond_x
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zla_porcond_x from '@rreusser/blahpack/lapack/base/zla_porcond_x';
*
* // A = [ 4, 2; 2, 3 ] and its upper Cholesky factor AF (U = [ 2, 1; 0, sqrt(2) ]):
* var A = new Complex128Array( [ 4, 0, 2, 0, 2, 0, 3, 0 ] );
* var AF = new Complex128Array( [ 2, 0, 2, 0, 1, 0, 1.4142135623730951, 0 ] );
* var X = new Complex128Array( [ 2, 0, 1, 0 ] );
* var WORK = new Complex128Array( 4 );
* var RWORK = new Float64Array( 2 );
*
* // 1 / || inv(A)*diag(|A|*|x|) ||_inf = 1/6
* var rcond = zla_porcond_x( 'column-major', 'upper', 2, A, 2, AF, 2, X, 1, WORK, RWORK );
* // returns ~0.166667
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zla_porcond_x.ndarray" }
