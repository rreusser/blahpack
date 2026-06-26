
/**
* Improves the computed solution using extra-precise iterative refinement for Hermitian positive-definite matrices.
*
* @module @stdlib/lapack/base/zla_porfsx_extended
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var zla_porfsx_extended = require( '@stdlib/lapack/base/zla_porfsx_extended' ).ndarray;
*
* var A = new Complex128Array([ 4.0, 0.0, 1.0, -1.0, 0.0, 0.0, 1.0, 1.0, 3.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 2.0, 0.0 ]);
* var B = new Complex128Array([ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ]);
* var AF = new Complex128Array( A.length );
* var Y = new Complex128Array( B.length );
* var c = new Float64Array([ 1.0, 1.0, 1.0 ]);
* var RES = new Complex128Array( 3 );
* var DY = new Complex128Array( 3 );
* var YT = new Complex128Array( 3 );
* var AYB = new Float64Array( 3 );
* var berr = new Float64Array( 1 );
* var ebn = new Float64Array( 3 );
* var ebc = new Float64Array( 3 );
*
* zla_porfsx_extended( 1, 'upper', 3, 1, A, 1, 3, 0, AF, 1, 3, 0, false, c, 1, 0, B, 1, 3, 0, Y, 1, 3, 0, berr, 1, 0, 2, ebn, 1, 1, 0, ebc, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1.0, 10, 0.5, 0.25, false );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zla_porfsx_extended.ndarray" }
