
/**
* Computes the Z vector determining the rank-one modification of the diagonal matrix used by DSTEDC.
*
* @module @stdlib/lapack/base/dlaeda
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var dlaeda = require( '@stdlib/lapack/base/dlaeda' );
*
* var N = 4;
* var QPTR = new Int32Array( [ 1, 5, 9 ] );
* var q = new Float64Array( [ 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0 ] );
* var z = new Float64Array( N );
* var ZTEMP = new Float64Array( N );
* var prmptr = new Int32Array( 4 );
* var perm = new Int32Array( 4 );
* var givptr = new Int32Array( 4 );
* var givcol = new Int32Array( 2 * 4 );
* var givnum = new Float64Array( 2 * 4 );
*
* dlaeda( 'row-major', N, 1, 1, 0, prmptr, 1, 0, perm, 1, 0, givptr, 1, 0, givcol, 2, 1, 0, givnum, N, q, 1, QPTR, 1, 0, z, 1, ZTEMP, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlaeda.ndarray" }
