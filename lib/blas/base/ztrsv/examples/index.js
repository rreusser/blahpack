import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztrsv from './../lib/base.js';

// Solve A*x = b for complex triangular A:
var A = new Float64Array( [ 2.0, 0.0, 3.0, 0.0, 0.0, 0.0, 4.0, 0.0 ] );
var x = new Float64Array( [ 5.0, 0.0, 4.0, 0.0 ] );

ztrsv( 'upper', 'no-transpose', 'non-unit', 2, A, 2, 1, 0, x, 1, 0 );
console.log( x ); // eslint-disable-line no-console
