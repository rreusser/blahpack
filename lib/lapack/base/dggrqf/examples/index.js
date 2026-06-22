
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggrqf from './../lib/index.js';

// Define a 3x3 matrix A in column-major order:
var A = new Float64Array( [ 2.0, 1.0, 3.0, 1.0, 4.0, 2.0, 3.0, 2.0, 5.0 ] );

// Define a 3x3 matrix B in column-major order:
var B = new Float64Array( [ 1.0, 2.0, 1.0, 3.0, 1.0, 2.0, 2.0, 3.0, 1.0 ] );
var TAUA = new Float64Array( 3 );
var TAUB = new Float64Array( 3 );

var info = dggrqf( 3, 3, 3, A, 3, TAUA, 1, B, 3, TAUB, 1 );
console.log( 'info:', info ); // eslint-disable-line no-console
// => 0

console.log( 'A (R + reflectors):', A ); // eslint-disable-line no-console
console.log( 'TAUA:', TAUA ); // eslint-disable-line no-console
console.log( 'B (T + reflectors):', B ); // eslint-disable-line no-console
console.log( 'TAUB:', TAUB ); // eslint-disable-line no-console
