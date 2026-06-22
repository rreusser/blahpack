import Float64Array from '@stdlib/array/float64/lib/index.js';
import zdrot from './../lib/base.js';

// Apply a real Givens rotation to complex vectors:
var zx = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var zy = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );

zdrot( 2, zx, 1, 0, zy, 1, 0, 0.8, 0.6 );
console.log( zx ); // eslint-disable-line no-console
console.log( zy ); // eslint-disable-line no-console
