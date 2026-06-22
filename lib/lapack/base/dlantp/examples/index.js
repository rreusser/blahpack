/* eslint-disable no-console */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlantp from './../lib/index.js';

/*
* 3x3 upper triangular matrix:
*   A = [ 2.0  3.0  -1.0 ]
*       [ 0.0  5.0   2.0 ]
*       [ 0.0  0.0   7.0 ]
*
* Upper packed: 2, 3, 5, -1, 2, 7
*/
var AP = new Float64Array( [ 2.0, 3.0, 5.0, -1.0, 2.0, 7.0 ] );
var WORK = new Float64Array( 3 );

var result = dlantp( 'max', 'upper', 'non-unit', 3, AP, WORK );
console.log( 'Max norm (non-unit): %d', result );
// => Max norm (non-unit): 7

result = dlantp( 'one-norm', 'upper', 'non-unit', 3, AP, WORK );
console.log( 'One-norm (non-unit): %d', result );
// => One-norm (non-unit): 10

result = dlantp( 'max', 'upper', 'unit', 3, AP, WORK );
console.log( 'Max norm (unit): %d', result );
// => Max norm (unit): 3
