import Float64Array from '@stdlib/array/float64/lib/index.js';
import dswap from './../lib/base.js';

// Swap vectors x and y:
var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
var y = new Float64Array( [ 4.0, 5.0, 6.0 ] );

dswap( 3, x, 1, 0, y, 1, 0 );
console.log( x ); // eslint-disable-line no-console
console.log( y ); // eslint-disable-line no-console
