import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrsv from './../lib/base.js';

// Solve A*x = b for triangular A:
var A = new Float64Array( [ 2.0, 3.0, 0.0, 4.0 ] );
var x = new Float64Array( [ 5.0, 4.0 ] );

dtrsv( 'upper', 'no-transpose', 'non-unit', 2, A, 2, 1, 0, x, 1, 0 );
console.log( x ); // eslint-disable-line no-console
