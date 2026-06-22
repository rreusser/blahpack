import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsyr2k from './../lib/base.js';

// Perform C = alpha*A*B' + alpha*B*A' + beta*C:
var A = new Float64Array( [ 1.0, 2.0 ] );
var B = new Float64Array( [ 3.0, 4.0 ] );
var C = new Float64Array( [ 0.0 ] );

dsyr2k( 'upper', 'no-transpose', 1, 2, 1.0, A, 2, 1, 0, B, 2, 1, 0, 0.0, C, 1, 1, 0 );
console.log( C ); // eslint-disable-line no-console
