import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgemm from './../lib/base.js';

// Perform C = alpha*A*B + beta*C:
var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var B = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );
var C = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );

dgemm( 'no-transpose', 'no-transpose', 2, 2, 2, 1.0, A, 2, 1, 0, B, 2, 1, 0, 0.0, C, 2, 1, 0 );
console.log( C ); // eslint-disable-line no-console
