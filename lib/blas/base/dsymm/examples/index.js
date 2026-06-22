import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsymm from './../lib/base.js';

// Perform C = alpha*A*B + beta*C where A is symmetric:
var A = new Float64Array( [ 1.0, 2.0, 2.0, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var C = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );

dsymm( 'left', 'upper', 2, 2, 1.0, A, 2, 1, 0, B, 2, 1, 0, 0.0, C, 2, 1, 0 );
console.log( C ); // eslint-disable-line no-console
