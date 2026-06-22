import Float64Array from '@stdlib/array/float64/lib/index.js';
import drotm from './../lib/base.js';

// Apply a modified Givens rotation:
var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
var y = new Float64Array( [ 4.0, 5.0, 6.0 ] );
var param = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0 ] );

drotm( 3, x, 1, 0, y, 1, 0, param, 1, 0 );
console.log( x ); // eslint-disable-line no-console
console.log( y ); // eslint-disable-line no-console
