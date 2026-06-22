
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlantp from './../lib/index.js';

/*
* 3x3 upper triangular matrix (packed):
*   A = [ (1+2i) (3+4i) (5+6i) ]
*       [     0  (7+8i) (9+1i) ]
*       [     0      0  (2+3i) ]
*/
var AP = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 7.0, 8.0, 5.0, 6.0, 9.0, 1.0, 2.0, 3.0 ] ); // eslint-disable-line max-len
var WORK = new Float64Array( 3 );

console.log( 'Max norm (upper, non-unit):', zlantp( 'max', 'upper', 'non-unit', 3, AP, WORK ) ); // eslint-disable-line max-len
console.log( 'One norm (upper, non-unit):', zlantp( 'one-norm', 'upper', 'non-unit', 3, AP, WORK ) ); // eslint-disable-line max-len
console.log( 'Inf norm (upper, non-unit):', zlantp( 'inf-norm', 'upper', 'non-unit', 3, AP, WORK ) ); // eslint-disable-line max-len
console.log( 'Frobenius norm (upper, non-unit):', zlantp( 'frobenius', 'upper', 'non-unit', 3, AP, WORK ) ); // eslint-disable-line max-len
