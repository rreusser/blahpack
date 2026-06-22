
/**
* Generates all or part of the unitary matrix Q from an RQ factorization determined by zgerqf (unblocked algorithm).
*
* @module @stdlib/lapack/base/zungr2
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zungr2 = require( '@stdlib/lapack/base/zungr2' );
*
* var A = new Complex128Array( 4 );
* var TAU = new Complex128Array( 1 );
* var WORK = new Complex128Array( 2 );
*
* var info = zungr2.ndarray( 2, 2, 0, A, 1, 2, 0, TAU, 1, 0, WORK, 1, 0 );
* // info => 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zungr2.ndarray" }
