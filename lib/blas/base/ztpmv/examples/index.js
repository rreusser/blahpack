import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztpmv from './../lib/base.js';

// Perform x = A*x for complex triangular packed A:
var AP = new Float64Array( [ 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
var x = new Float64Array( [ 1.0, 0.0, 1.0, 0.0 ] );

ztpmv( 'upper', 'no-transpose', 'non-unit', 2, AP, 1, 0, x, 1, 0 );
console.log( x ); // eslint-disable-line no-console
