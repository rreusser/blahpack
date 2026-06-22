import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsyr from './../lib/base.js';

// Perform A = alpha*x*x' + A for symmetric A:
var x = new Float64Array( [ 1.0, 2.0 ] );
var A = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );

dsyr( 'upper', 2, 1.0, x, 1, 0, A, 2, 1, 0 );
console.log( A ); // eslint-disable-line no-console
