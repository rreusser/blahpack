/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlatps from './../lib/index.js';

// Upper triangular 2x2 packed matrix:
var AP = new Complex128Array( [ 2.0, 1.0, 1.0, 0.5, 3.0, 0.0 ] );

// Right-hand side vector:
var x = new Complex128Array( [ 4.0, 2.0, 6.0, 0.0 ] );

var scale = new Float64Array( 1 );
var cnorm = new Float64Array( 2 );

var info = zlatps.ndarray( 'upper', 'no-transpose', 'non-unit', 'no', 2, AP, 1, 0, x, 1, 0, scale, cnorm, 1, 0 );

var xv = reinterpret( x, 0 );
console.log( 'info: %d', info );
console.log( 'scale: %d', scale[ 0 ] );
console.log( 'x: [%d, %d, %d, %d]', xv[ 0 ], xv[ 1 ], xv[ 2 ], xv[ 3 ] );
