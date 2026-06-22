import Float64Array from '@stdlib/array/float64/lib/index.js';
import zscal from './../lib/base.js';

// Scale a complex vector by a complex constant:
var zx = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var za = new Float64Array( [ 2.0, 0.0 ] );

zscal( 2, za, zx, 1, 0 );
console.log( zx ); // eslint-disable-line no-console
