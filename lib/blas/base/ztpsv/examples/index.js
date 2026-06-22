import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztpsv from './../lib/base.js';

// Solve A*x = b for complex triangular packed A:
var AP = new Float64Array( [ 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
var x = new Float64Array( [ 5.0, 0.0, 11.0, 0.0 ] );

ztpsv( 'upper', 'no-transpose', 'non-unit', 2, AP, 1, 0, x, 1, 0 );
console.log( x ); // eslint-disable-line no-console
