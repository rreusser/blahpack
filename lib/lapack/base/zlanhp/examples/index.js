
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlanhp from './../lib/index.js';

/*
* 3x3 Hermitian matrix (upper packed):
*   A = [  2+0i     1+2i    -1+3i  ]
*       [  1-2i     5+0i   0.5-1.5i ]
*       [ -1-3i   0.5+1.5i   7+0i  ]
*/
var AP = new Complex128Array( [ 2.0, 0.0, 1.0, 2.0, 5.0, 0.0, -1.0, 3.0, 0.5, -1.5, 7.0, 0.0 ] ); // eslint-disable-line max-len
var WORK = new Float64Array( 3 );

console.log( 'Max norm (upper):', zlanhp( 'max', 'upper', 3, AP, WORK ) );
console.log( 'One norm (upper):', zlanhp( 'one-norm', 'upper', 3, AP, WORK ) );
console.log( 'Inf norm (upper):', zlanhp( 'inf-norm', 'upper', 3, AP, WORK ) );
console.log( 'Frobenius norm (upper):', zlanhp( 'frobenius', 'upper', 3, AP, WORK ) );
