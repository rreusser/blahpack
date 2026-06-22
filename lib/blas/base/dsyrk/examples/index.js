import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsyrk from './../lib/base.js';

// Perform C = alpha*A*A' + beta*C:
var A = new Float64Array( [ 1.0, 2.0 ] );
var C = new Float64Array( [ 0.0 ] );

dsyrk( 'upper', 'no-transpose', 1, 2, 1.0, A, 2, 1, 0, 0.0, C, 1, 1, 0 );
console.log( C ); // eslint-disable-line no-console
