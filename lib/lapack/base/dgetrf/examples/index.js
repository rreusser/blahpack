/* eslint-disable no-console */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgetrf from './../lib/index.js';

// 3x3 column-major matrix:
var A = new Float64Array( [ 2.0, 4.0, 8.0, 1.0, 3.0, 7.0, 1.0, 3.0, 9.0 ] );
var IPIV = new Int32Array( 3 );

var info = dgetrf( 'column-major', 3, 3, A, 3, IPIV, 1 );
console.log( 'info: %d', info );
console.log( 'A (factored):' );
console.log( A );
console.log( 'IPIV:' );
console.log( IPIV );
