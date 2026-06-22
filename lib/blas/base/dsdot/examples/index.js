import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsdot from './../lib/base.js';

// Compute the dot product with extended precision:
var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
var y = new Float64Array( [ 4.0, 5.0, 6.0 ] );

var result = dsdot( 3, x, 1, 0, y, 1, 0 );
console.log( result ); // eslint-disable-line no-console
// => 32.0
