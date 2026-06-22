import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsbmv from './../lib/base.js';

// Perform y = alpha*A*x + beta*y for symmetric banded A:
var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var x = new Float64Array( [ 1.0, 1.0 ] );
var y = new Float64Array( [ 0.0, 0.0 ] );

dsbmv( 'upper', 2, 1, 1.0, A, 2, 1, 0, x, 1, 0, 0.0, y, 1, 0 );
console.log( y ); // eslint-disable-line no-console
