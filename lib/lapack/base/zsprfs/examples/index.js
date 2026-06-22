/* eslint-disable no-restricted-syntax, no-console */

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsprfs from './../lib/base.js';

// 1x1 complex symmetric system: A = (3+i), B = (1+i), X = (0.4+0.2i)
var AP = new Complex128Array( new Float64Array( [ 3.0, 1.0 ] ) );
var AFP = new Complex128Array( new Float64Array( [ 3.0, 1.0 ] ) );
var IPIV = new Int32Array( [ 0 ] );
var B = new Complex128Array( new Float64Array( [ 1.0, 1.0 ] ) );
var X = new Complex128Array( new Float64Array( [ 0.4, 0.2 ] ) );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 2 );
var RWORK = new Float64Array( 1 );

var info = zsprfs( 'upper', 1, 1, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

console.log( 'info:', info );
console.log( 'FERR:', FERR[ 0 ] );
console.log( 'BERR:', BERR[ 0 ] );
