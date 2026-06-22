import Float64Array from '@stdlib/array/float64/lib/index.js';
import drot from './../lib/base.js';

// Apply a Givens rotation to vectors x and y:
var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
var y = new Float64Array( [ 4.0, 5.0, 6.0 ] );

drot( 3, x, 1, 0, y, 1, 0, 0.8, 0.6 );
console.log( x ); // eslint-disable-line no-console
console.log( y ); // eslint-disable-line no-console
