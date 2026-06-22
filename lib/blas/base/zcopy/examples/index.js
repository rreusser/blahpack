import Float64Array from '@stdlib/array/float64/lib/index.js';
import zcopy from './../lib/base.js';

// Copy complex vector zx into zy:
var zx = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var zy = new Float64Array( 4 );

zcopy( 2, zx, 1, 0, zy, 1, 0 );
console.log( zy ); // eslint-disable-line no-console
